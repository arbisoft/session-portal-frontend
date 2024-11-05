import { create } from 'zustand';
import { User } from '../types/user';

interface UserState {
    user: User | undefined;
    status: string | undefined;
    error: string | undefined;
    setUser: (user: User) => void;
    setStatus: (status: string | undefined) => void;
    setError: (error: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: undefined,
    status: undefined,
    error: undefined,
    setUser: (user: User) => set({ user: user }),
    setStatus: (status: string | undefined) => set({ status: status }),
    setError: (error: string) => set({ error: error }),
}));
