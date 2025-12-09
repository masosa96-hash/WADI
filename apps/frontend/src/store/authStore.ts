import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (email: string, password: string) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signUp: (email: string, password: string) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginAsGuest: () => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convertGuestToUser: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  signIn: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ user: data.user, loading: false });
    return { data, error };
  },

  signUp: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    set({ user: data.user, loading: false });
    return { data, error };
  },

  loginAsGuest: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) console.error("Error login anónimo:", error);
    set({ user: data.user, loading: false });
    return { data, error };
  },

  convertGuestToUser: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.updateUser({
      email: email,
      password: password,
    });
    set({ user: data.user, loading: false });
    return { data, error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
