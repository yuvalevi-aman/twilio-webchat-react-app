import { Message } from "@twilio/conversations";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";

import styles from "./styles/MessageListSeparator.module.scss";
import { getDaysOld } from "../utils/getDaysOld";
import { SeparatorType } from "./definitions";

export const MessageListSeparator = ({
    message,
    separatorType
}: {
    message: Message;
    separatorType: SeparatorType;
}) => {
    const getSeparatorText = () => {
        let separatorText;
        if (separatorType === "new") {
            separatorText = "New";
        } else {
            const daysOld = getDaysOld(message.dateCreated);
            if (daysOld === 0) {
                separatorText = "Today";
            } else if (daysOld === 1) {
                separatorText = "Yesterday";
            } else {
                separatorText = message.dateCreated.toLocaleDateString();
            }
        }

        return separatorText;
    };

    return (
        <Box className={styles.separatorContainer} data-test="new-message-separator" role="separator">
            <Box className={[
                styles.separatorLine,
                separatorType === "new" ? styles.new : styles.default
            ].join(' ')} aria-hidden="true" />
            <Text as="p" className={[
                styles.separatorText,
                separatorType === "new" ? styles.new : styles.default
            ].join(' ')}>
                {getSeparatorText()}
            </Text>
            <Box className={[
                styles.separatorLine,
                separatorType === "new" ? styles.new : styles.default
            ].join(' ')} aria-hidden="true" />
        </Box>
    );
};
