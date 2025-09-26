import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios.js";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,
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
      set({ allContacts: response.data });
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error(error.response.data.message || "Error fetching contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    try {
      set({ isUsersLoading: true });
      const response = await axiosInstance.get("/messages/chats");
      set({ chats: response.data });
    } catch (error) {
      console.error("Error fetching chat partners:", error);
      toast.error(
        error.response.data.message || "Error fetching chat partners"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },
}));
