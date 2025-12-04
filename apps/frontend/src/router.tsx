import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

export const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/projects", element: <Projects /> },
  { path: "/projects/:id", element: <ProjectDetail /> },
]);

