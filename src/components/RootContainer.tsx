import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppState, EngagementPhase } from "../store/definitions";
import { initSession } from "../store/actions/initActions";
import { MessagingCanvasPhase } from "./MessagingCanvasPhase";
import { LoadingPhase } from "./LoadingPhase";
import { EntryPoint } from "./EntryPoint";

import { Box } from "@twilio-paste/core/box";

import classes from "./styles/RootContainer.module.scss";

const getPhaseComponent = (phase: EngagementPhase) => {
  switch (phase) {
    case EngagementPhase.Loading:
      return <LoadingPhase />;
    case EngagementPhase.MessagingCanvas:
    default:
      return <MessagingCanvasPhase />;
  }
};

export function RootContainer() {
  const dispatch = useDispatch();
  const { currentPhase, expanded, token, conversationSid } = useSelector((state: AppState) => state.session);

  useEffect(() => {
    if (
      token &&
      conversationSid &&
      currentPhase === EngagementPhase.Loading
    ) {
      dispatch(initSession({ token, conversationSid }));
    }
  }, [token, conversationSid, currentPhase, dispatch]);

  return (
    <Box>
      <Box className={classes.outerContainer}>
        {expanded && (
          <Box data-test="root-container" className={classes.innerContainer}>
            {getPhaseComponent(currentPhase)}
          </Box>
        )}
        <EntryPoint />
      </Box>
    </Box>
  );
}
