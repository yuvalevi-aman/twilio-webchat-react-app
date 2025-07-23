import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from 'react';

import { initSession } from "../store/actions/initActions";
import { AppState, ChatStep } from "../store/definitions";
import { Header } from "./Header";
import { NotificationBar } from "./NotificationBar";
import { updatePreEngagementData, setStudioFlowData, updateChatHistory } from "../store/actions/genericActions";
import OptionsList from "./OptionsList";
import SelectedMessage from "./SelectedMessage";
import containerClasses from "./styles/PreEngagementFormPhase.module.scss";
import classes from "./styles/OptionsList.module.scss";

export const PreEngagementFormPhase = () => {
    const dispatch = useDispatch();
    const token = useSelector((state: AppState) => state.session.token);
    const conversationSid = useSelector((state: AppState) => state.session.conversationSid);
    const conversation = useSelector((state: AppState) => state.chat.conversation);
    const studioFlowData = useSelector((state: AppState) => state.session.studioFlowData);
    const chatHistory = useSelector((state: AppState) => state.session.chatHistory);
    const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatHistory.length === 0 && studioFlowData.messageBody && studioFlowData.currentWidget) {
            const initialStep: ChatStep = {
                botMessage: studioFlowData.messageBody,
                options: studioFlowData.messageAttributes?.buttons?.map(btn => btn.label) || [],
                widgetId: studioFlowData.currentWidget,
                botTimestamp: new Date()
            };
            dispatch(updateChatHistory([initialStep]));
        }
    }, [studioFlowData, chatHistory, dispatch]);

    const handleOptionClick = async (option: string) => {
        if (!conversationSid) {
            console.error('Conversation SID is missing. Flow will not proceed.');
            return;
        }

        try {
            if (conversation) {
                await conversation.sendMessage(option);
            }

            dispatch(updatePreEngagementData({ query: option }));

            const response = await fetch('https://serverless-web-chat-6188.twil.io/follow-flow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentWidget: studioFlowData.currentWidget || 'init_web_chat',
                    selectedOption: option,
                    conversationSid 
                })
            });

            const data = await response.json();

            if (!data.success) {
                console.error('Flow response error:', data.error);
                return;
            }


            const updatedHistory = chatHistory.map(step =>
                step.widgetId === studioFlowData.currentWidget
                    ? { ...step, userResponse: option, userTimestamp: new Date() }
                    : step
            );

            const newStep: ChatStep = {
                botMessage: data.messageBody,
                options: data.messageAttributes?.buttons?.map((btn: { label: string }) => btn.label) || [],
                widgetId: data.currentWidget,
                botTimestamp: new Date()
            };

            const fullHistory = [...updatedHistory, newStep];
            dispatch(updateChatHistory(fullHistory));

            dispatch(setStudioFlowData({
                currentWidget: data.currentWidget,
                messageBody: data.messageBody,
                messageAttributes: data.messageAttributes
            }));

         if (
              data.messageAttributes?.buttons?.some((btn: { value: string }) => btn.value === 'chat') &&
              token &&
              conversationSid
            ) {
              dispatch(initSession({ token, conversationSid }));
            }
        } catch (error) {
            console.error('Error continuing flow:', error);
        }
    };

    useEffect(() => {
        if (lastUserResponseRef.current) {
            lastUserResponseRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [chatHistory]);

    return (
        <>
            <Header />
            <NotificationBar />

            <Box className={containerClasses.optionsListContainer}>
                {chatHistory.map((step) => (
                    <Box key={step.widgetId} className={containerClasses.chatStep}>
                        <Box className={containerClasses.botMessageContainer}>
                            <Box className={containerClasses.botMessageText}>
                                {step.botMessage}
                            </Box>
                            <Box className={containerClasses.timestampInside}>
                                {step.botTimestamp.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </Box>
                        </Box>

                        <OptionsList
                            options={step.options}
                            onOptionSelect={handleOptionClick}
                            buttonClassName={classes.optionButton}
                        />

                        {step.userResponse && (
                            <div ref={lastUserResponseRef}>
                                <SelectedMessage value={step.userResponse} timestamp={step.userTimestamp} />
                            </div>
                        )}
                    </Box>
                ))}
            </Box>
        </>
    );
};
