import { useEffect } from "react";

export const useNotifications = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, options = {}) => {
    if (!("Notification" in window)) return null;

    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/avatar.png",
        ...options,
      });
      notification.onclick = () => {
        window.focus();
      };
    }

    return null;
  };

  return { showNotification };
};
