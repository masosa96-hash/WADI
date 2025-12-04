import { create } from "zustand";
import { supabase } from "../config/supabase";

interface AuthState {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  signIn: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ user: data.user, loading: false });
    return { data, error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
