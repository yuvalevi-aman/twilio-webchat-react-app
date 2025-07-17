import { Box } from "@twilio-paste/core/box";
import { useDispatch, useSelector } from "react-redux";

import { ChatBubbleIcon } from "../icons/ChatBubbleIcon";
import { changeExpandedStatus, setStudioFlowData } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import classes from "./styles/EntryPoint.module.scss";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

    const handleClick = async () => {
        dispatch(changeExpandedStatus({ expanded: !expanded }));

        try {
            const response = await fetch('https://serverless-web-chat-6188.twil.io/init-web-chat', {
                method: 'GET',
                mode: 'cors'
            });
            const data = await response.json();

            console.log('Studio Flow data:', data);

            dispatch(setStudioFlowData({
                currentWidget: data.currentWidget,
                messageBody: data.messageBody,
                messageAttributes: data.messageAttributes
            }));
        } catch (err) {
            console.error('Failed to fetch Studio Flow data', err);
        }
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
