import log from "loglevel";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import throttle from "lodash.throttle";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { InputBox } from "@twilio-paste/core/input-box";
import { TextArea } from "@twilio-paste/core/textarea";
import { Button } from "@twilio-paste/core/button";

import { AppState } from "../store/definitions";
import { AttachFileButton } from "./AttachFileButton";
import { FilePreview } from "./FilePreview";
import { detachFiles } from "../store/actions/genericActions";
import { CHAR_LIMIT } from "../constants";
import classes from "./styles/MessageInput.module.scss";

export const MessageInput = () => {
    const dispatch = useDispatch();
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { conversation, attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        conversation: state.chat.conversation,
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const oldAttachmentsLength = useRef(attachedFiles.length);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const attachmentsBoxRef = useRef<HTMLDivElement>(null);

    const throttleChange = useMemo(
        () =>
            throttle(() => {
                conversation?.typing();
                if (conversation?.lastReadMessageIndex !== conversation?.lastMessage?.index) {
                    conversation?.setAllMessagesRead();
                }
            }, 500),
        [conversation]
    );

    const isSubmitDisabled = (!text.trim() && attachedFiles.length === 0) || isSending;

    const send = async () => {
        if (isSubmitDisabled || !conversation) {
            log.error("Failed sending message: no conversation or input is empty");
            return;
        }

        setIsSending(true);
        const preparedMessage = conversation.prepareMessage().setBody(text);

        attachedFiles.forEach((file: File) => {
            const formData = new FormData();
            formData.append(file.name, file);
            preparedMessage.addMedia(formData);
        });

        await preparedMessage.build().send();
        setText("");
        dispatch(detachFiles(attachedFiles));
        setIsSending(false);
        textAreaRef.current?.focus();
    };

    const onKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLInputElement).form?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
        }
    };

    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        throttleChange();
    };

    const onFocus = () => {
        conversation?.setAllMessagesRead();
    };

    useEffect(() => {
        textAreaRef.current?.setAttribute("rows", "1");
        textAreaRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!attachmentsBoxRef.current) return;

        if (attachedFiles.length > oldAttachmentsLength.current) {
            (attachmentsBoxRef.current.lastChild as Element)?.scrollIntoView();
        }

        oldAttachmentsLength.current = attachedFiles.length;
    }, [attachedFiles]);

    return (
        <Box as="form" className={classes.formStyles} onSubmit={(e) => { e.preventDefault(); send(); }}>
            <InputBox element="MESSAGE_INPUT_BOX" disabled={isSending} >
                <Box as="div" className={classes.innerInputStyles}>
                    <Box className={classes.textAreaContainerStyles}>
                        <TextArea
                            ref={textAreaRef}
                            data-test="message-input-textarea"
                            placeholder="כתיבת הודעה..."
                            value={text}
                            element="MESSAGE_INPUT"
                            onChange={onChange}
                            onFocus={onFocus}
                            readOnly={isSending}
                            onKeyPress={onKeyPress}
                            maxLength={CHAR_LIMIT}
                            
                        />
                    </Box>

                    <Box className={classes.messageOptionContainerStyles}>
                        {fileAttachmentConfig?.enabled && <AttachFileButton textAreaRef={textAreaRef} />}
                    </Box>

                    <Box className={classes.messageOptionContainerStyles}>
                        <Button
                            data-test="message-send-button"
                            variant="primary_icon"
                            size="icon_small"
                            type="submit"
                            aria-disabled={isSubmitDisabled}
                        >
                            &gt;
                        </Button>
                    </Box>
                </Box>

                {attachedFiles.length > 0 && (
                    <Box
                        data-test="message-attachments"
                        className={classes.filePreviewContainerStyles}
                        ref={attachmentsBoxRef}
                    >
                        {attachedFiles.map((file, index) => (
                            <FilePreview
                                focusable
                                key={index}
                                file={file}
                                isBubble={false}
                                disabled={isSending}
                            />
                        ))}
                    </Box>
                )}
            </InputBox>
        </Box>
    );
};
