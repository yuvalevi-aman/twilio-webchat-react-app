import { useDispatch, useSelector } from "react-redux";
import { CustomizationProvider, CustomizationProviderProps } from "@twilio-paste/core/customization";
import { FC, useEffect } from "react";

import { RootContainer } from "./RootContainer";
import { AppState, EngagementPhase } from "../store/definitions";
import { sessionDataHandler } from "../sessionDataHandler";
import { initSession } from "../store/actions/initActions";
import { changeEngagementPhase } from "../store/actions/genericActions";

const AnyCustomizationProvider: FC<CustomizationProviderProps> = CustomizationProvider;

export function WebchatWidget() {
    const theme = useSelector((state: AppState) => state.config.theme);
    const dispatch = useDispatch();

    useEffect(() => {
        const data = sessionDataHandler.tryResumeExistingSession();
        if (data) {
            try {
                dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
            } catch (e) {
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
            }
        } else {
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    }, [dispatch]);

    return (
        <AnyCustomizationProvider
            baseTheme={theme?.isLight ? "default" : "dark"}
            theme={theme?.overrides}
        >
            <RootContainer />
        </AnyCustomizationProvider>
    );
}
