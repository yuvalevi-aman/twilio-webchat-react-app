import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { ChatBubbleIcon } from "../icons/ChatBubbleIcon";
import { changeExpandedStatus, setStudioFlowData, setConversationSid } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import classes from "./styles/EntryPoint.module.scss";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

const startStudioFlow = async () => {
    try {
        const response = await fetch('https://serverless-web-chat-6188.twil.io/init-web-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: '',
                from: '',
                instanceSid: process.env.REACT_APP_TWILIO_INSTANCE_SID,
                channelSid: process.env.REACT_APP_TWILIO_CHANNEL_SID
            })
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Studio Flow init failed:', data.error);
            return;
        }

        if (data.conversationSid) {
            dispatch(setConversationSid(data.conversationSid));
        }

        if (data.initWidget) {
            dispatch(setStudioFlowData({
                currentWidget: data.initWidget.currentWidget,
                messageBody: data.initWidget.messageBody,
                messageAttributes: data.initWidget.messageAttributes
            }));
        }
    } catch (err) {
        console.error('Failed to start Studio Flow', err);
    }
};
    useEffect(() => {
        startStudioFlow();
    }, []);

    const handleClick = () => {
        dispatch(changeExpandedStatus({ expanded: !expanded }));
    };

    return (
        <>
            {!expanded &&
                <Box
                    as="button"
                    data-test="entry-point-button"
                    onClick={handleClick}
                    className={classes.containerStyles}
                >
                    <ChatBubbleIcon />
                </Box>
            }
        </>
    );
};
