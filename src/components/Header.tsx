import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { SvgWrapper } from "./SvgWrapper"
import { ReactComponent as SpeechBubbleIcon } from "./icons/speech_bubble.svg";
import { ReactComponent as Negishut } from "./icons/negishut1.svg";
import { ReactComponent as Cross } from "./icons/cross.svg";
import { ReactComponent as Chevron } from "./icons/chevron_down.svg";
import classes from "./styles/Header.module.scss";

export const Header = ({ customTitle }: { customTitle?: string }) => {
        const dispatch = useDispatch();
        const expanded = useSelector((state: AppState) => state.session.expanded);

    return (
        <Box className={classes.container}>
            <Box className={classes.titleContainer}>
            <SvgWrapper > 
                <SpeechBubbleIcon />
            </SvgWrapper>
            <h2 className={classes.title}>
                {customTitle || "איקאה צ׳אט דיגיטלי"}
            </h2>
            </Box>
            <Box className={classes.iconsContainer}>
             <SvgWrapper className={classes.iconAsButton}> 
                <Negishut />
            </SvgWrapper>
                <SvgWrapper className={classes.iconAsButton}> 
                <Chevron />
            </SvgWrapper>
            <SvgWrapper className={classes.iconAsButton} onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}> 
                <Cross />
            </SvgWrapper>
            </Box>
        </Box>
    );
};
