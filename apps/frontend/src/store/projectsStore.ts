import { create } from "zustand";
import { useAuthStore } from "./authStore";

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const user = useAuthStore.getState().user;
      const query = user ? `?user_id=${user.id}` : "";

      const res = await fetch(`${API_URL}/api/projects${query}`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta inválida del servidor (no es JSON)");
      }

      const data = await res.json();
      set({ projects: data, loading: false });
    } catch (e) {
      console.error("Failed to fetch projects", e);
      set({ loading: false });
    }
  },

  createProject: async (name, description) => {
    try {
      const user = useAuthStore.getState().user;

      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          user_id: user?.id,
        }),
      });

      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          if (err.message) msg = err.message;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor devolvió un error inesperado (HTML).");
      }

      const data = await res.json();
      set((state) => ({ projects: [data, ...state.projects] }));
    } catch (e) {
      console.error("Failed to create project", e);
      throw e; // Re-throw so UI can handle it
    }
  },
}));
