import { Media, Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { Anchor } from "@twilio-paste/core/anchor";
import { Key, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { AppState } from "../store/definitions";
import { FilePreview } from "./FilePreview";
import { parseMessageBody } from "../utils/parseMessageBody";
import classes from "./styles/MessageBubble.module.scss";

const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

export const MessageBubble = ({
  message,
  isLast,
  focusable,
  updateFocus,
}: {
  message: Message;
  isLast: boolean;
  focusable: boolean;
  updateFocus: (newFocus: number) => void;
}) => {
  const [read, setRead] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { conversationsClient, participants, fileAttachmentConfig, conversation } =
    useSelector((state: AppState) => ({
      conversationsClient: state.chat.conversationsClient,
      participants: state.chat.participants,
      fileAttachmentConfig: state.config.fileAttachment,
      conversation: state.chat.conversation,
    }));

  const messageRef = useRef<HTMLDivElement>(null);
  const belongsToCurrentUser = message.author === conversationsClient?.user.identity;

  useEffect(() => {
    if (isLast && participants && belongsToCurrentUser) {
      const getOtherParticipants = participants.filter(
        (p) => p.identity !== conversationsClient?.user.identity
      );
      setRead(
        Boolean(getOtherParticipants.length) &&
          getOtherParticipants.every((p) => p.lastReadMessageIndex === message.index)
      );
    } else {
      setRead(false);
    }
  }, [participants, isLast, belongsToCurrentUser, conversationsClient, message]);

  useEffect(() => {
    if (focusable) {
      messageRef.current?.focus();
    }
  }, [focusable]);

  if (!message.body?.trim() && message.type !== "media") {
    return null;
  }

  const renderMedia = () => {
    if (fileAttachmentConfig?.enabled && message.attachedMedia) {
      return message.attachedMedia.map((media: Media, index: Key) => {
        const file = {
          name: media.filename,
          type: media.contentType,
          size: media.size,
        } as File;
        return (
          <FilePreview
            key={index}
            file={file}
            isBubble={true}
            media={media}
            focusable={focusable}
          />
        );
      });
    }
    return null;
  };

  const renderInteractiveOptions = () => {
    const attributes = message.attributes as {
      buttons?: { label: string; value: string }[];
    };
    const buttons = attributes?.buttons;
    if (!Array.isArray(buttons)) return null;

    const handleClick = async (value: string) => {
      if (selectedOption) return;
      try {
        setSelectedOption(value);
        await conversation?.sendMessage(value);
      } catch (err) {
        console.error("Failed to send option:", err);
      }
    };

    return (
      <Box className={classes.messageArray}>
        {buttons.map((opt, i) => {
          const isDisabled = Boolean(selectedOption);
          return (
            <button
              key={i}
              className={`${classes.option} ${isDisabled ? classes.disabledOption : ""}`}
              onClick={() => handleClick(opt.value)}
              disabled={isDisabled}
              type="button"
            >
              {opt.label}
            </button>
          );
        })}
      </Box>
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const newFocusValue = message.index + (e.key === "ArrowUp" ? -1 : 1);
      updateFocus(newFocusValue);
    }
  };

  const handleMouseDown = () => setIsMouseDown(true);
  const handleMouseUp = () => setIsMouseDown(false);
  const handleFocus = () => {
    if (!isMouseDown) updateFocus(message.index);
  };

  const mdText = parseMessageBody(message.body ?? "", belongsToCurrentUser);

  return (
    <Box
      className={classes.outerContainer}
      tabIndex={focusable ? 0 : -1}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={messageRef}
      data-message-bubble
      data-testid="message-bubble"
    >
      <Box
        className={belongsToCurrentUser ? classes.bubbleContainerUser : classes.bubbleContainer}
      >
        <Box className={belongsToCurrentUser ? classes.innerContainerUser : classes.innerContainer}>
          {message.body && (
            <ReactMarkdown
              className={belongsToCurrentUser ? classes.bodyUser : classes.body}
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                a: ({ href, children }) => (
                  <Anchor
                    href={href ?? "#"}
                    variant={belongsToCurrentUser ? "inverse" : "default"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </Anchor>
                ),
              }}
              children={mdText}
            />
          )}
          {message.type === "media" && renderMedia()}
        </Box>

        <p className={classes.timeStamp}>
          {`${doubleDigit(message.dateCreated.getHours())}:${doubleDigit(
            message.dateCreated.getMinutes()
          )}`}
        </p>
      </Box>

      {renderInteractiveOptions()}

      {read && (
        <Flex hAlignContent="right" vAlignContent="center" marginTop="space20">
          <Text as="p" className={classes.readStatus}>
            Read
          </Text>
          <SuccessIcon decorative={true} size="sizeIcon10" color="colorTextWeak" />
        </Flex>
      )}
    </Box>
  );
};
