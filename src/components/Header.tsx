import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";

import classes from "./styles/Header.module.scss";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    return (
        <Box className={classes.container}>
            <Text as="h2" className={classes.title}>
                {customTitle || "Live Chat"}
            </Text>
        </Box>
    );
};
