import { Box } from "@twilio-paste/core/box";

import classes from "./styles/SelectedMessage.module.scss";

interface SelectedMessageProps {
    value: string;
    timestamp?: Date;
}

const SelectedMessage = ({ value, timestamp }: SelectedMessageProps) => {
    return (
        <Box className={classes.userResponseContainer}>
            <Box className={classes.userResponse}>
                {value}
            </Box>
              {timestamp && (
        <Box className={classes.timestampInside}>
            {timestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </Box>
    )}
        </Box>
    );
};

export default SelectedMessage;
