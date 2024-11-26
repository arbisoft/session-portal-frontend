import { create } from "zustand";
import { User } from "@/types/user";
import { fetchCurrentUser } from "@/services/api/fetch-current-user";
import { clearTokenCookies } from "@/services/api/clear-tokens-cookies";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
  setisLoading: (authState: boolean) => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      const fetchedUser = await fetchCurrentUser();

      set({
        user: fetchedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await clearTokenCookies();
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      set({ isAuthenticated: true });
    }
  },

  setisLoading: (authState: boolean) => {
    set({
      isLoading: authState,
    });
  },
}));

export default useAuthStore;
