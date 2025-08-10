import { UIEvent, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { Spinner } from "@twilio-paste/core/spinner";
import { Message } from "@twilio/conversations";
import throttle from "lodash.throttle";
import { isToday } from "date-fns";

import { MessageBubble } from "./MessageBubble";
import { AppState } from "../store/definitions";
import { getMoreMessages } from "../store/actions/genericActions";
import { MESSAGES_SPINNER_BOX_HEIGHT } from "../constants";
import classes from "./styles/MessageList.module.scss";

export const MessageList = () => {
    const { messages, participants, users, conversation, conversationsClient } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        participants: state.chat.participants,
        users: state.chat.users,
        conversation: state.chat.conversation,
        conversationsClient: state.chat.conversationsClient
    }));
    const dispatch = useDispatch();
    const messageListRef = useRef<HTMLDivElement>(null);
    const isLoadingMessages = useRef(false);
    const oldMessagesLength = useRef((messages || []).length);
    const [hasLoadedAllMessages, setHasLoadedAllMessages] = useState(true);
    const [focusIndex, setFocusIndex] = useState(
        messages && messages.length ? messages[messages?.length - 1].index : -1
    );
    const [shouldFocusLatest, setShouldFocusLatest] = useState(false);

    const updateFocus = (newFocus: number) => {
        if (newFocus < 0 || !messages || !messages.length || newFocus > messages[messages.length - 1].index) {
            return;
        }

        if (shouldFocusLatest) {
            setFocusIndex(messages[messages.length - 1].index);
            setShouldFocusLatest(false);
        } else {
            setFocusIndex(newFocus);
        }
    };

    const scrollToBottom = () => {
        if (!messageListRef.current) {
            return;
        }

        messageListRef.current.scrollTop = 0;
    };

    useEffect(() => {
        const messageListener = (message: Message) => {
            if (!document.activeElement?.hasAttribute("data-message-bubble")) {
                setShouldFocusLatest(true);
            }

            const belongsToCurrentUser = message.author === conversationsClient?.user.identity;
            if (belongsToCurrentUser) {
                scrollToBottom();
            }
        };

        conversation?.addListener("messageAdded", messageListener);

        return () => {
            conversation?.removeListener("messageAdded", messageListener);
        };
    }, [conversation, conversationsClient]);

    useEffect(() => {
        const checkIfAllMessagesLoaded = async () => {
            const totalMessagesCount = await conversation?.getMessagesCount();
            if (totalMessagesCount) {
                setHasLoadedAllMessages(totalMessagesCount === messages?.length);
            }

            if (messages && oldMessagesLength.current < messages?.length) {
                isLoadingMessages.current = false;
                oldMessagesLength.current = messages.length;
            }
        };

        checkIfAllMessagesLoaded();
    }, [messages, conversation]);

    const handleScroll = async (event: UIEvent<HTMLDivElement>) => {
        const element = event.target as HTMLDivElement;
        const hasReachedTop =
            element.scrollHeight + element.scrollTop - MESSAGES_SPINNER_BOX_HEIGHT <= element.clientHeight;

        if (hasReachedTop && conversation && messages && !hasLoadedAllMessages && !isLoadingMessages.current) {
            isLoadingMessages.current = true;
            oldMessagesLength.current = messages.length;
            const totalMessagesCount = await conversation?.getMessagesCount();

            if (totalMessagesCount && messages.length < totalMessagesCount) {
                dispatch(getMoreMessages({ anchor: totalMessagesCount - messages.length - 1, conversation }));
            }
        }
    };

    const renderChatStarted = () =>
        hasLoadedAllMessages ? (
            <>
     <Box className={classes.conversationEventContainer}>
  <p className={classes.conversationEventDate}>
    {conversation?.dateCreated
      ? isToday(new Date(conversation.dateCreated))
        ? "היום"
        : new Date(conversation.dateCreated).toLocaleDateString("he-IL")
      : null}
  </p>
</Box>
            </>
        ) : null;

    const renderChatItems = () => {
        if (!messages) {
            return null;
        }

        const spinnerIndex = (messages[0]?.index || 0) - 1;
        const messagesWithSpinner = [
            {
                index: spinnerIndex
            } as Message,
            ...messages
        ];

        return messagesWithSpinner.map((message: Message, i: number) => {
            if (message.index === spinnerIndex) {
                return hasLoadedAllMessages ? null : (
                    <Box className={classes.spinnerContainer} key={message.index}>
                        <Spinner color="colorTextWeak" decorative={false} title="Loading" />
                    </Box>
                );
            }
            i -= 1;

            return (
                <Box data-test="all-message-bubbles" key={message.index}>
                   <MessageBubble
  message={message}
  isLast={i === messages.length - 1}
  focusable={message.index === focusIndex}
  updateFocus={updateFocus}
/>

                </Box>
            );
        });
    };

    const handleFocus = () => {
        if (messages && messages.length && focusIndex < 0) {
            setFocusIndex(messages[messages.length - 1].index);
        }
    };

    return (
        <Box className={classes.messageList}>
            <Box className={classes.outerContainer} onScroll={throttle(handleScroll, 1000)} ref={messageListRef} role="main">
                <Box
                    aria-label="Chat messages"
                    role="log"
                    aria-relevant="additions"
                    className={classes.innerContainer}
                    tabIndex={focusIndex >= 0 ? -1 : 0}
                    onFocus={handleFocus}
                >
                    {renderChatStarted()}
                    {renderChatItems()}
                    {participants
                        ?.filter((p) => p.isTyping && p.identity !== conversationsClient?.user.identity)
                        .map((p) => (
                            <Text className={classes.participantTyping} as="p" key={p.identity}>
                                {users?.find((u) => u.identity === p.identity)?.friendlyName} is typing...
                            </Text>
                        ))}
                </Box>
            </Box>
        </Box>
    );
};
