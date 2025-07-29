import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppState, EngagementPhase } from "../store/definitions";
import { initSession } from "../store/actions/initActions";
import { MessagingCanvasPhase } from "./MessagingCanvasPhase";
import { PreEngagementFormPhase } from "./PreEngagementFormPhase";
import { LoadingPhase } from "./LoadingPhase";
import { EntryPoint } from "./EntryPoint";
import { Box } from "@twilio-paste/core/box";
import { innerContainerStyles, outerContainerStyles } from "./styles/RootContainer.styles";

const getPhaseComponent = (phase: EngagementPhase) => {
  switch (phase) {
    case EngagementPhase.Loading:
      return <LoadingPhase />;
    case EngagementPhase.MessagingCanvas:
      return <MessagingCanvasPhase />;
    case EngagementPhase.PreEngagementForm:
    default:
      return <PreEngagementFormPhase />;
  }
};

export function RootContainer() {
  const dispatch = useDispatch();
  const { currentPhase, expanded, token, conversationSid } = useSelector((state: AppState) => state.session);
  const { showPreEngagementForm } = useSelector((state: AppState) => state.config);

  useEffect(() => {
    if (
      !showPreEngagementForm &&
      token &&
      conversationSid &&
      currentPhase === EngagementPhase.PreEngagementForm
    ) {
      dispatch(initSession({ token, conversationSid }));
    }
  }, [showPreEngagementForm, token, conversationSid, currentPhase, dispatch]);

  return (
    <Box>
      <Box {...outerContainerStyles}>
        {expanded && (
          <Box data-test="root-container" {...innerContainerStyles}>
            {getPhaseComponent(currentPhase)}
          </Box>
        )}
        <EntryPoint />
      </Box>
    </Box>
  );
}
