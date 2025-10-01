import { useEffect } from "react";

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission when component mounts
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, options = {}) => {
    if (!("Notification" in window)) return null;

    if (Notification.permission === "granted") {
      return new Notification(title, {
        icon: "/avatar.png",
        ...options,
      });
    }

    return null;
  };

  return { showNotification };
};
