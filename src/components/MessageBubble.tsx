import { Media, Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { ScreenReaderOnly } from "@twilio-paste/core/screen-reader-only";
import { useSelector } from "react-redux";
import { Text } from "@twilio-paste/core/text";
import { Flex } from "@twilio-paste/core/flex";
import { UserIcon } from "@twilio-paste/icons/esm/UserIcon";
import { Key, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SuccessIcon } from "@twilio-paste/icons/esm/SuccessIcon";
import { Button } from "@twilio-paste/core/button";

import { AppState } from "../store/definitions";
import { FilePreview } from "./FilePreview";
import { parseMessageBody } from "../utils/parseMessageBody";
import classes from "./styles/MessageBubble.module.scss";

const doubleDigit = (number: number) => `${number < 10 ? 0 : ""}${number}`;

export const MessageBubble = ({
  message,
  isLast,
  isLastOfUserGroup,
  focusable,
  updateFocus
}: {
  message: Message;
  isLast: boolean;
  isLastOfUserGroup: boolean;
  focusable: boolean;
  updateFocus: (newFocus: number) => void;
}) => {
  const [read, setRead] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const { conversationsClient, participants, users, fileAttachmentConfig, conversation } = useSelector((state: AppState) => ({
    conversationsClient: state.chat.conversationsClient,
    participants: state.chat.participants,
    users: state.chat.users,
    fileAttachmentConfig: state.config.fileAttachment,
    conversation: state.chat.conversation
  }));
  const messageRef = useRef<HTMLDivElement>(null);

  const belongsToCurrentUser = message.author === conversationsClient?.user.identity;

  useEffect(() => {
    if (isLast && participants && belongsToCurrentUser) {
      const getOtherParticipants = participants.filter((p) => p.identity !== conversationsClient?.user.identity);
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

  const renderMedia = () => {
    if (fileAttachmentConfig?.enabled && message.attachedMedia) {
      return message.attachedMedia.map((media: Media, index: Key) => {
        const file = {
          name: media.filename,
          type: media.contentType,
          size: media.size
        } as File;
        return <FilePreview key={index} file={file} isBubble={true} media={media} focusable={focusable} />;
      });
    }
    return null;
  };

const renderInteractiveOptions = () => {
  const attributes = message.attributes as { buttons?: { label: string; value: string }[] };
  const buttons = attributes.buttons;

  if (!Array.isArray(buttons)) return null;

  const handleClick = async (value: string) => {
    try {
      await conversation?.sendMessage(value);
    } catch (err) {
      console.error("Failed to send option:", err);
    }
  };

  return (
    <Box className={classes.messageArray}>
        {buttons.map((opt, i) => (
          <Button
            key={i}
            variant="secondary"
            className={classes.option}
            onClick={() => handleClick(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
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

  const author = users?.find((u) => u.identity === message.author)?.friendlyName || message.author;

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
      <Box className={classes.bubbleContainer}>
        <Box className={classes.innerContainer}>
            <ScreenReaderOnly as="p">
              {belongsToCurrentUser ? "You sent at" : `${author} sent at`}
            </ScreenReaderOnly>
            <Text className={classes.timeStamp} as="p">
              {`${doubleDigit(message.dateCreated.getHours())}:${doubleDigit(message.dateCreated.getMinutes())}`}
            </Text>

          {message.body && (
            <Text as="p" className={classes.body}>
              {parseMessageBody(message.body, belongsToCurrentUser)}
            </Text>
          )}

          {message.type === "media" && renderMedia()}
        </Box>
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
