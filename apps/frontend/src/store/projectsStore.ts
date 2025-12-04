import { create } from "zustand";

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

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`);
    const data = await res.json();

    set({ projects: data, loading: false });
  },

  createProject: async (name, description) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const data = await res.json();

    set((state) => ({ projects: [data, ...state.projects] }));
  },
}));
