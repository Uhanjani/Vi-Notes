import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import WorkspaceView from "./views/WorkspaceView";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/workspace" replace />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/register" element={<RegisterView />} />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspaceView />
          </ProtectedRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default App;
