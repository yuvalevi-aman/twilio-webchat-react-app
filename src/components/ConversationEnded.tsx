import { Fragment } from "react";
import { Box } from "@twilio-paste/core/box";
import { Button } from "@twilio-paste/core/button";
import { useDispatch, useSelector } from "react-redux";

import { sessionDataHandler } from "../sessionDataHandler";
import { changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import { initSession } from "../store/actions/initActions";
import { EngagementPhase, AppState } from "../store/definitions";
import classes from "./styles/ConversationEnded.module.scss";
import type { Transcript } from "./Transcript";

export const ConversationEnded = () => {
    const dispatch = useDispatch();
    const { messages, users, preEngagementData, transcriptConfig, serverUrl } = useSelector((state: AppState) => ({
        messages: state.chat.messages,
        users: state.chat.users,
        preEngagementData: state.chat.conversation?.attributes.pre_engagement_data,
        transcriptConfig: state.config.transcript,
        serverUrl: state.config.serverUrl
    }));

const handleStartNewChat = async () => {
    try {
        sessionDataHandler.clear();
        dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));

        const response = await fetch(`${serverUrl}/initWebchat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                formData: { 
                    friendlyName: "Customer",
                    query: "Hello"
                } 
            })
        });

        if (!response.ok) throw new Error("Webchat init failed");

        const { token, conversationSid } = await response.json();

        // Store the new session data
        sessionDataHandler.fetchAndStoreNewSession({ formData: { token, conversationSid } });
        
        // Initialize the session properly using initSession action
        await dispatch(initSession({ token, conversationSid }));

        dispatch(changeEngagementPhase({ phase: EngagementPhase.MessagingCanvas }));
    } catch (err) {
        console.error("Failed to start new chat:", err);
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
    }
};

    let TranscriptComponent: typeof Transcript | undefined = undefined;

    if (process.env.DOWNLOAD_TRANSCRIPT_ENABLED === "true" || process.env.EMAIL_TRANSCRIPT_ENABLED === "true") {
        ({ Transcript: TranscriptComponent } = require("./Transcript"));
    }

    return (
        <Box className={classes.container}>
            {TranscriptComponent ? (
                <TranscriptComponent
                    messages={messages}
                    preEngagementData={preEngagementData}
                    users={users}
                    transcriptConfig={transcriptConfig}
                />
            ) : (
                <Fragment />
            )}
            <Button variant="primary" data-test="start-new-chat-button" onClick={handleStartNewChat}>
            התחל צ'אט חדש
            </Button>
        </Box>
    );
};
