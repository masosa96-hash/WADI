import { createBrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./config/supabase";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

// Wrapper componente to handle initial auth check
const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const { setUser, loginAsGuest } = useAuthStore();

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);

      if (!session) {
        // If no user, login as guest automatically
        loginAsGuest().then(() => setReady(true));
      } else {
        setReady(true);
      }
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, loginAsGuest]);

  if (!ready) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app)",
          color: "var(--text-primary)",
        }}
      >
        Cargando WADI...
      </div>
    );
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthLoader>
        <Projects />
      </AuthLoader>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthLoader>
        <Login />
      </AuthLoader>
    ),
  },
  {
    path: "/projects",
    element: (
      <AuthLoader>
        <Projects />
      </AuthLoader>
    ),
  },
  {
    path: "/projects/:id",
    element: (
      <AuthLoader>
        <ProjectDetail />
      </AuthLoader>
    ),
  },
]);
