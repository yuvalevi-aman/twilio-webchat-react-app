import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { useDispatch, useSelector } from "react-redux";

import classes from "./styles/Header.module.scss";
import { AccessibilityIcon } from "../icons/AccessabiltyIcon";
import { ChatBubbleIcon } from "../icons/ChatBubbleIcon";
import { CancelIcon } from "../icons/CancelIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";

export const Header = ({ customTitle }: { customTitle?: string }) => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

    return (
        <Box as="header" className={classes.container}>
            <div className={classes.headerContent}>
                <ChatBubbleIcon />
                <Text as="h2" className={classes.title}>
                    {customTitle || "איקאה צ׳אט דיגיטלי"}
                </Text>
            </div>
            <div className={classes.headerContent}>
                <AccessibilityIcon />
                <ChevronDownIcon />
                <CancelIcon  onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}/>
            </div>
        </Box>
    );
};
