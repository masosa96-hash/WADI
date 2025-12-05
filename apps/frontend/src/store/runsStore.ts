import { create } from "zustand";

interface Run {
  id: string;
  input: string;
  output: string;
  created_at: string;
}

interface RunsState {
  runs: Run[];
  loading: boolean;
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string) => Promise<void>;
}

export const useRunsStore = create<RunsState>((set) => ({
  runs: [],
  loading: false,

  fetchRuns: async (projectId) => {
    set({ loading: true });

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/runs`
    );
    const data = await res.json();

    set({ runs: data, loading: false });
  },

  createRun: async (projectId, input) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/projects/${projectId}/runs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      }
    );

    const data = await res.json();

    set((state) => ({ runs: [data, ...state.runs] }));
  },
}));
