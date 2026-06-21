import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddCase from './pages/AddCase'
import CaseDetail from './pages/CaseDetail'
import ClientTracking from './pages/ClientTracking'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/dashboard"          element={<Dashboard />} />
        <Route path="/dashboard/active"   element={<Dashboard />} />
        <Route path="/dashboard/resolved" element={<Dashboard />} />
        <Route path="/add-case"    element={<AddCase />} />
        <Route path="/cases/:id"   element={<CaseDetail />} />
        <Route path="/case/:token" element={<ClientTracking />} />
        <Route path="/settings"    element={<Settings />} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
