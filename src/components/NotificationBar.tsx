import { Box } from "@twilio-paste/core/box";
import { useSelector } from "react-redux";

import { AppState } from "../store/definitions";
import { NotificationBarItem } from "./NotificationBarItem";
import styles from "./styles/NotificationBar.module.scss";

export const NotificationBar = () => {
    const notifications = useSelector((store: AppState) => store.notifications);

    return (
        <Box className={styles.notificationBarContainer}>
            <Box className={styles.notificationBar}>
                {notifications.map((notification) => (
                    <NotificationBarItem key={notification.id} {...notification} />
                ))}
            </Box>
        </Box>
    );
};
