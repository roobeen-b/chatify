import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check-auth");
      set({ authUser: response.data });
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
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error(error.response.data.message || "Error logging out");
    }
  },
}));
