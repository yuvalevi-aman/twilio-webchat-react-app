import { useSelector } from "react-redux";
import { AppState } from "../store/definitions";
import { MessageInput } from "./MessageInput";

type CustomMessageAttributes = {
  showInput?: boolean;
};

export const ConditionalMessageInput = () => {
  const messages = useSelector((state: AppState) => state.chat.messages);

  const shouldShowInput = messages?.some((msg) => {
    const attrs = msg.attributes as CustomMessageAttributes;
    return attrs?.showInput === true;
  });

  if (!shouldShowInput) return null;

  return <MessageInput />;
};
