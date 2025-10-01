import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:4000" : "/";

export const useAuthStore = create((set, get) => ({
  socket: null,
  authUser: null,
  onlineUsers: [],
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check-auth");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signUp: async (formData) => {
    try {
      set({ isSigningUp: true });
      const response = await axiosInstance.post("/auth/signup", formData);
      toast.success("Signup successful");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.response.data.message || "Error signing up");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
    try {
      set({ isLoggingIn: true });
      const response = await axiosInstance.post("/auth/login", formData);
      toast.success("Login successful");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response.data.message || "Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Logout successful");
      set({ authUser: null });
      get().disconnectSocket();
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response.data.message || "Error logging out");
    }
  },
  updateProfile: async (formData) => {
    try {
      set({ isUpdatingProfile: true });
      const response = await axiosInstance.put(
        "/auth/update-profile",
        formData
      );
      toast.success("Profile updated successfully");
      set({ authUser: response.data });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response.data.message || "Error updating profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Global message listener for real-time updates
    socket.on("newMessage", (newMessage) => {
      const { handleIncomingMessage } = useChatStore.getState();
      handleIncomingMessage(newMessage);
    });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
