import { useDispatch, useSelector } from "react-redux";
import { CustomizationProvider, CustomizationProviderProps } from "@twilio-paste/core/customization";
import { CSSProperties, FC, useEffect } from "react";

import { RootContainer } from "./RootContainer";
import { AppState, ConfigState, EngagementPhase } from "../store/definitions";
import { sessionDataHandler } from "../sessionDataHandler";
import { initSession } from "../store/actions/initActions";
import { changeEngagementPhase } from "../store/actions/genericActions";

const AnyCustomizationProvider: FC<CustomizationProviderProps & { style: CSSProperties }> = CustomizationProvider;

export function WebchatWidget() {
    const theme = useSelector((state: AppState) => state.config.theme);
    const config = useSelector((state: AppState) => state.config);
    const dispatch = useDispatch();

    useEffect(() => {
        const startChatAutomatically = async () => {
            try {
                const response = await fetch(`${config.serverUrl}/initWebchat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        formData: {
                            friendlyName: "Customer",
                            query: ""
                        }
                    })
                });

                if (!response.ok) throw new Error("Webchat init failed");

                const { token, conversationSid } = await response.json();
                sessionDataHandler.fetchAndStoreNewSession({ formData: { token, conversationSid } });
                dispatch(initSession({ token, conversationSid }));
            } catch (err) {
                console.error("Auto-start failed:", err);
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
            }
        };

        const data = sessionDataHandler.tryResumeExistingSession();
        if (data) {
            try {
                dispatch(initSession({ token: data.token, conversationSid: data.conversationSid }));
            } catch (e) {
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
            }
        } else if (!config?.showPreEngagementForm) {
            startChatAutomatically();
        } else {
            dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    }, [dispatch, config]);

    return (
        <AnyCustomizationProvider
            baseTheme={theme?.isLight ? "default" : "dark"}
            theme={theme?.overrides}
            elements={{
                MESSAGE_INPUT: {
                    boxShadow: "none!important" as "none"
                },
                MESSAGE_INPUT_BOX: {
                    display: "inline-block",
                    boxShadow: "none"
                },
                ALERT: {
                    paddingTop: "space30",
                    paddingBottom: "space30"
                },
                BUTTON: {
                    "&[aria-disabled='true'][color='colorTextLink']": {
                        color: "colorTextLinkWeak"
                    }
                }
            }}
            style={{ minHeight: "100%", minWidth: "100%" }}
        >
            <RootContainer />
        </AnyCustomizationProvider>
    );
}
