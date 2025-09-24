import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: { name: "John Doe", _id: 123 },
  isLoggedIn: false,
  isLoading: false,
  login: () => {
    set({ isLoggedIn: true });
  },
  logout: () => {
    set({ isLoggedIn: false });
  },
}));
