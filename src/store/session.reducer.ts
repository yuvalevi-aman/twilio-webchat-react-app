import { AnyAction, Reducer } from "redux";

import { EngagementPhase, SessionState, StudioFlowData } from "./definitions";
import {
    ACTION_CHANGE_ENGAGEMENT_PHASE,
    ACTION_CHANGE_EXPANDED_STATUS,
    ACTION_START_SESSION,
    ACTION_UPDATE_SESSION_DATA,
    ACTION_UPDATE_PRE_ENGAGEMENT_DATA,
    ACTION_SET_STUDIO_FLOW_DATA,
    ACTION_UPDATE_CHAT_HISTORY,
    SET_CONVERSATION_SID
} from "./actions/actionTypes";

const defaultStudioFlowData: StudioFlowData = {
    messageBody: "",
    currentWidget: "",
    messageAttributes: {
        widgetName: "",
        customAttribute: "",
        anotherFlag: false,
        buttons: []
    }
};

const initialState: SessionState = {
    currentPhase: EngagementPhase.Loading,
    expanded: false,
    token: undefined,
    conversationSid: undefined,
    conversationsClient: undefined,
    conversation: undefined,
    users: [],
    participants: [],
    messages: [],
    conversationState: undefined,
    preEngagementData: {
        name: '',
        email: '',
        query: ''
    },
    studioFlowData: defaultStudioFlowData,
    chatHistory: []
};

export const SessionReducer: Reducer<SessionState, AnyAction> = (
    state: SessionState = initialState,
    action: AnyAction
): SessionState => {
    switch (action.type) {
        case ACTION_START_SESSION:
            return {
                ...state,
                token: action.payload.token,
                conversationSid: action.payload.conversationSid,
                currentPhase: action.payload.currentPhase
            };

        case ACTION_UPDATE_SESSION_DATA:
            return {
                ...state,
                token: action.payload.token,
                conversationSid: action.payload.conversationSid
            };

        case ACTION_CHANGE_EXPANDED_STATUS:
            return {
                ...state,
                expanded: action.payload.expanded
            };

        case ACTION_CHANGE_ENGAGEMENT_PHASE:
            return {
                ...state,
                currentPhase: action.payload.currentPhase
            };

        case ACTION_UPDATE_PRE_ENGAGEMENT_DATA:
            return {
                ...state,
                preEngagementData: {
                    ...state.preEngagementData,
                    ...action.payload.preEngagementData
                }
            };

        case ACTION_SET_STUDIO_FLOW_DATA:
            return {
                ...state,
                studioFlowData: {
                    currentWidget: action.payload.studioFlowData.currentWidget,
                    messageBody: action.payload.studioFlowData.messageBody,
                    messageAttributes: action.payload.studioFlowData.messageAttributes
                }
            };

        case ACTION_UPDATE_CHAT_HISTORY:
            return {
                ...state,
                chatHistory: action.payload.chatHistory
            };

        case SET_CONVERSATION_SID:
            return {
                ...state,
                conversationSid: action.payload
            };

        default:
            return state;
    }
};
