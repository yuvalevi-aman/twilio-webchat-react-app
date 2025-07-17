import { Box } from "@twilio-paste/core/box";
import { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

import { initSession } from "../store/actions/initActions";
import { sessionDataHandler } from "../sessionDataHandler";
import { AppState, EngagementPhase } from "../store/definitions";
import { Header } from "./Header";
import { NotificationBar } from "./NotificationBar";
import { addNotification, changeEngagementPhase } from "../store/actions/genericActions";
import { notifications } from "../notifications";
import  OptionsList from "./OptionsList";
import containerClasses from "./styles/PreEngagementFormPhase.module.scss";
import classes from "./styles/OptionsList.module.scss";

export const PreEngagementFormPhase = () => {
    const dispatch = useDispatch();
    const { name, email, query } = useSelector((state: AppState) => state.session.preEngagementData) || {};
    const title = ['ברוכים הבאים לשירות הדיגיטלי שלנו'];
    const options = ['כתבו לנו במייל', 'שלחו לנו הודעה בוואטסאפ', 'המשיכו כאן בצ׳אט', 'דברו איתנו באמצעות מסנג׳ר או פייסבוק'];
    const submitButtonText = ['המשיכו כאן בצ׳אט'];
    const date = ['היום'];
    const handleOptionClick = (option: string) => {
        console.log('Selected option:', option);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        dispatch(changeEngagementPhase({ phase: EngagementPhase.Loading }));
        try {
            const data = await sessionDataHandler.fetchAndStoreNewSession({
                formData: {
                    friendlyName: name,
                    email,
                    query
                }
            });
            dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));

            

        } catch (err) {
            dispatch(addNotification(notifications.failedToInitSessionNotification((err as Error).message)));
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };

   

    return (
        <>
            <Header />
            <NotificationBar />
            <Box as="form" data-test="pre-engagement-chat-form" onSubmit={ handleSubmit} className={containerClasses.optionsListContainer}>
               <OptionsList options={date} onOptionSelect={handleOptionClick} buttonClassName={classes.dateButton} />

                <OptionsList options={title} onOptionSelect={handleOptionClick} buttonClassName={classes.titleButton} />
                <Box >
                    <OptionsList type="button" options={options} onOptionSelect={handleOptionClick} buttonClassName={classes.optionButton} />
                </Box>
                <OptionsList options={submitButtonText} onOptionSelect={handleOptionClick} buttonClassName={classes.submitButton}  type="submit" data-test="pre-engagement-start-chat-button"/>
            </Box>
        </>
    );
};
