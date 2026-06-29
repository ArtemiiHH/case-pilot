import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMe } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddCase from "./pages/AddCase";
import CaseDetail from "./pages/CaseDetail";
import ClientTracking from "./pages/ClientTracking";
import Settings from "./pages/Settings";

function ProtectedRoute({ authed, children }) {
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const [authed, setAuthed] = useState(null); // null = checking, true/false = resolved

  useEffect(() => {
    getMe()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;

  return (
    <BrowserRouter>
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
            <ProtectedRoute authed={authed}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/active"
          element={
            <ProtectedRoute authed={authed}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/resolved"
          element={
            <ProtectedRoute authed={authed}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-case"
          element={
            <ProtectedRoute authed={authed}>
              <AddCase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cases/:id"
          element={
            <ProtectedRoute authed={authed}>
              <CaseDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/case/:token" element={<ClientTracking />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute authed={authed}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<Navigate to={authed ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
