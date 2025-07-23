import log from "loglevel";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { FileIcon } from "@twilio-paste/icons/esm/FileIcon";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { Button } from "@twilio-paste/core/button";
import { Media } from "@twilio/conversations";
import { extension as mimeToExtension } from "mime-types";
import { Truncate } from "@twilio-paste/core/truncate";

import { addNotification, detachFiles } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import { notifications } from "../notifications";
import { roundFileSizeInMB } from "../utils/roundFileSizeInMB";
import styles from "./styles/FilePreview.module.scss";

interface FilePreviewProps {
    file: File;
    isBubble: boolean;
    disabled?: boolean;
    media?: Media;
    focusable: boolean;
}

export const FilePreview = (props: FilePreviewProps) => {
    const { file, isBubble, disabled, media, focusable } = props;
    const [isHovered, setIsHovered] = useState(false);

    const dispatch = useDispatch();
    const fileAttachmentConfig = useSelector((state: AppState) => state.config.fileAttachment);

    const handleDetach = () => {
        dispatch(detachFiles([file]));
    };

    const handleDownload = async () => {
        if (fileAttachmentConfig?.maxFileSize && file.size > fileAttachmentConfig.maxFileSize) {
            dispatch(
                addNotification(
                    notifications.fileDownloadInvalidSizeNotification({
                        fileName: file.name,
                        maxFileSize: `${roundFileSizeInMB(fileAttachmentConfig.maxFileSize)}MB`
                    })
                )
            );
            return;
        }

        if (
            fileAttachmentConfig?.acceptedExtensions &&
            !fileAttachmentConfig.acceptedExtensions.includes(mimeToExtension(file.type) as string)
        ) {
            dispatch(
                addNotification(
                    notifications.fileDownloadInvalidTypeNotification({
                        fileName: file.name
                    })
                )
            );
            return;
        }

        try {
            const url = media ? await media.getContentTemporaryUrl() : URL.createObjectURL(file);
            window.open(url);
        } catch (e) {
            log.error(`Failed downloading message attachment: ${e}`);
        }
    };

    const handleBoxClick = () => {
        if (!disabled) {
            handleDownload();
        }
    };

    return (
        <Box className={styles.outerContainer}>
            <Box
                as="button"
                type="button"
                appearance="none"
                data-test="file-preview-main-area"
                className={[
                  styles.container,
                  isBubble ? styles.bubble : styles.notBubble,
                  disabled ? styles.disabled : ''
                ].join(' ')}
                onClick={handleBoxClick}
                onMouseEnter={() => setIsHovered(true)}
                onFocus={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onBlur={() => setIsHovered(false)}
                tabIndex={focusable ? 0 : -1}
            >
                <Box className={styles.fileIconContainer}>
                    <FileIcon decorative={false} title="File attachment" size="sizeIcon40" />
                </Box>
                <Box className={styles.fileDescriptionContainer}>
                    <Text as="h1" className={styles.fileName}>
                        <Truncate title={file.name}>{file.name}</Truncate>
                    </Text>
                    <Text as="p" className={styles.fileSize}>
                        {isHovered ? "Click to open" : `${roundFileSizeInMB(file.size)}MB`}
                    </Text>
                </Box>
            </Box>
            <Box className={styles.actionIconContainer}>
                {!isBubble && (
                    <Button
                        variant="secondary_icon"
                        size="icon_small"
                        onClick={handleDetach}
                        type="button"
                        data-test="message-file-attachment-remove-button"
                    >
                        <CloseIcon
                            decorative={false}
                            title="Remove file attachment"
                            size="sizeIcon30"
                            color="inherit"
                        />
                    </Button>
                )}
            </Box>
        </Box>
    );
};
