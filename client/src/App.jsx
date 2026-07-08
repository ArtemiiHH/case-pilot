import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddCase from "./pages/AddCase";
import CaseDetail from "./pages/CaseDetail";
import ClientTracking from "./pages/ClientTracking";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status === "unauthed") return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { status } = useAuth();

  if (status === "loading") return null;
  const authed = status === "authed";

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={authed ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/login"
        element={authed ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/active"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/resolved"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-case"
        element={
          <ProtectedRoute>
            <AddCase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetail />
          </ProtectedRoute>
        }
      />
      <Route path="/case/:token" element={<ClientTracking />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={authed ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
