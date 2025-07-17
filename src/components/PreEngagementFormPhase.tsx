import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";

import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { NotificationBar } from "./NotificationBar";
import { changeEngagementPhase, updatePreEngagementData } from "../store/actions/genericActions";
import OptionsList from "./OptionsList";
import containerClasses from "./styles/PreEngagementFormPhase.module.scss";
import classes from "./styles/OptionsList.module.scss";

export const PreEngagementFormPhase = () => {
    const dispatch = useDispatch();

    const { query, studioFlowData } = useSelector((state: AppState) => ({
        query: state.session.preEngagementData.query,
        studioFlowData: state.session.studioFlowData
    }));

    const title = studioFlowData.messageBody ? [studioFlowData.messageBody] : [];
    const options = studioFlowData.messageAttributes?.buttons?.map(btn => btn.label) || [];
    const date = [new Date().toLocaleDateString('he-IL')];

    const handleOptionClick = async (option: string) => {
        console.log('Selected option:', option);

        try {
            const response = await fetch('https://serverless-web-chat-6188.twil.io/follow-flow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentWidget: studioFlowData.currentWidget || 'init_web_chat',
                    selectedOption: option
                })
            });

            const data = await response.json();
            console.log('Next flow step data:', data);

            dispatch({
                type: 'ACTION_SET_STUDIO_FLOW_DATA',
                payload: {
                    studioFlowData: {
                        currentWidget: data.currentWidget,
                        messageBody: data.messageBody,
                        messageAttributes: data.messageAttributes
                    }
                }
            });

            dispatch(updatePreEngagementData({ query: option }));

            if (data.messageAttributes?.buttons?.some((btn: { value: string }) => btn.value === 'chat')) {
                dispatch(changeEngagementPhase({ phase: EngagementPhase.MessagingCanvas }));
            }

        } catch (err) {
            console.error('Failed to continue flow:', err);
        }
    };

    return (
        <>
            <Header />
            <NotificationBar />
            <Box className={containerClasses.optionsListContainer}>
                <OptionsList
                    options={date}
                    onOptionSelect={handleOptionClick}
                    buttonClassName={classes.dateButton}
                />

                <OptionsList
                    options={title}
                    onOptionSelect={handleOptionClick}
                    buttonClassName={classes.titleButton}
                />

                <Box>
                    <OptionsList
                        type="button"
                        options={options}
                        onOptionSelect={handleOptionClick}
                        buttonClassName={classes.optionButton}
                    />
                </Box>
            </Box>
        </>
    );
};
