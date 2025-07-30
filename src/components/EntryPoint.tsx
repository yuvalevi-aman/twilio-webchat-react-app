import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";
import { SvgWrapper } from "./SvgWrapper"

import { ReactComponent as SpeechBubbleIcon } from "./icons/speech_bubble.svg";
import { changeExpandedStatus } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import classes from "./styles/EntryPoint.module.scss";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

return (
  !expanded && (
    <Box
      as="button"
      data-test="entry-point-button"
      onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}
      className={classes.container}
    >
      <SvgWrapper size={40}>
        <SpeechBubbleIcon />
      </SvgWrapper>
    </Box>
  )
);
}