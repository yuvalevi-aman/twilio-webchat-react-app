import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";

import styles from "./styles/AttachFileDropArea.module.scss";
import { validateFiles } from "../utils/validateFiles";
import { attachFiles } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";

export const AttachFileDropArea = ({ children }: { children: React.ReactNode }) => {
    const { attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const dispatch = useDispatch();

    const [isDragging, setIsDragging] = useState(false);

    const containsFile = (dataTransfer: DataTransfer): boolean =>
        Boolean(dataTransfer?.types?.find((dataTransferType) => dataTransferType === "Files"));

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();

        if (containsFile(event.dataTransfer)) {
            const { files } = event.dataTransfer;

            if (files && files.length) {
                const validFiles = validateFiles(Array.from(files), dispatch, attachedFiles, fileAttachmentConfig);
                dispatch(attachFiles(validFiles));
            }
        }

        setIsDragging(false);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();

        if (isDragging) {
            return;
        }

        if (!containsFile(event.dataTransfer)) {
            return;
        }

        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();

        const relatedTarget = (event.nativeEvent as DragEvent).relatedTarget as Node;
        if (
            !relatedTarget ||
            // Prevent event from being fired when dragging over a child (or child ShadowDOM element)
            (!event.currentTarget.contains(relatedTarget) && !(relatedTarget.getRootNode() instanceof ShadowRoot))
        ) {
            setIsDragging(false);
        }
    };

    return (
        <Box className={styles.container} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            {isDragging && (
                <Box className={styles.dropArea}>
                    <Box className={styles.attachIconContainer}>
                        <AttachIcon decorative={true} size="sizeIcon60" />
                    </Box>
                    <Text as="p" className={styles.attachTitle}>
                        Drop a file or image here
                    </Text>
                </Box>
            )}
            {children}
        </Box>
    );
};
