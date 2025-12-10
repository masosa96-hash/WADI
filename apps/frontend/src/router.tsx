import { createBrowserRouter } from "react-router-dom";
import { AuthLoader } from "./components/AuthLoader";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ChatPage from "./pages/ChatPage";

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
  {
    path: "/chat",
    element: (
      <AuthLoader>
        <ChatPage />
      </AuthLoader>
    ),
  },
]);
