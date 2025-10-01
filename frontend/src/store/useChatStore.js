import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isSendingMessage: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
  unreadCounts: JSON.parse(localStorage.getItem("unreadCounts") || "{}"),
  toggleSound: () => {
    const newValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", newValue);
    set({ isSoundEnabled: newValue });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  getAllContacts: async () => {
    try {
      set({ isUsersLoading: true });
      const response = await axiosInstance.get("/messages/contacts");
      set({ allContacts: response?.data });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error(error.response?.data?.message || "Error fetching contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    try {
      set({ isUsersLoading: true });
      const response = await axiosInstance.get("/messages/chats");
      set({ chats: response?.data });
    } catch (error) {
      console.error("Error fetching chat partners:", error);
      toast.error(
        error.response?.data?.message || "Error fetching chat partners"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagesByUserId: async (userId) => {
    try {
      set({ isMessagesLoading: true });
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response?.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      isOptimistic: true,
      senderId: authUser._id,
      text: messageData.text,
      image: messageData.image,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      set({ isSendingMessage: true });
      const response = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set((state) => ({
        messages: [
          ...state.messages.filter((msg) => msg._id !== tempId),
          response?.data,
        ],
      }));
    } catch (error) {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Error sending message");
    } finally {
      set({ isSendingMessage: false });
    }
  },
  markAsRead: (chatId) => {
    if (!chatId) return;

    set((state) => {
      const newUnreadCounts = { ...state.unreadCounts };
      delete newUnreadCounts[chatId];
      localStorage.setItem("unreadCounts", JSON.stringify(newUnreadCounts));
      return { unreadCounts: newUnreadCounts };
    });
  },

  handleIncomingMessage: (newMessage) => {
    const { selectedUser, isSoundEnabled, messages, unreadCounts } = get();
    const currentUserId = useAuthStore.getState().authUser?._id;
    const isFromCurrentUser = newMessage.senderId === currentUserId;

    const chatId = [newMessage.senderId, newMessage.receiverId]
      .sort()
      .join("_");

    // Add message to current chat if it belongs to the active conversation
    const isActiveChat =
      selectedUser &&
      (newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id);

    if (isActiveChat) {
      set({ messages: [...messages, newMessage] });
    }

    // For new messages not from current user
    if (!isFromCurrentUser) {
      // Update unread count if not in active chat
      if (!isActiveChat) {
        const newUnreadCounts = {
          ...unreadCounts,
          [chatId]: (unreadCounts[chatId] || 0) + 1,
        };
        localStorage.setItem("unreadCounts", JSON.stringify(newUnreadCounts));
        set({ unreadCounts: newUnreadCounts });

        if (Notification.permission === "granted" && document.hidden) {
          const senderName = newMessage.senderName || "Someone";
          const notification = new Notification(
            `New message from ${senderName}`,
            {
              body: newMessage.text || "Sent an image",
              icon: newMessage.image || "/avatar.png",
            }
          );

          notification.onclick = () => {
            window.focus();
          };
        }

        if (isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch((error) => {
            console.error("Error playing notification sound:", error);
          });
        }
      }
    }
  },
}));
