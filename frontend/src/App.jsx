import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Vagues from "./pages/Vagues";
import Niveaux from "./pages/Niveaux";
import Planning from "./pages/Planning";
import InscriptionEtudiant from "./pages/auth/InscriptionEtudiant";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />

        <Route path="/inscription-etudiant" element={<InscriptionEtudiant />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["admin", "secretaire"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vagues"
            element={
              <ProtectedRoute roles={["admin", "secretaire", "enseignant"]}>
                <Vagues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/niveaux"
            element={
              <ProtectedRoute roles={["admin", "secretaire"]}>
                <Niveaux />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <ProtectedRoute roles={["admin", "secretaire", "enseignant"]}>
                <Planning />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
