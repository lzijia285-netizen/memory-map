import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { MemoryProvider } from "./context/MemoryContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NewMemory } from "./pages/NewMemory";
import { Timeline } from "./pages/Timeline";
import { Calendar } from "./pages/Calendar";
import { Friends } from "./pages/Friends";
import { Profile } from "./pages/Profile";
import { MemoryDetail } from "./pages/MemoryDetail";
import { AuthProvider, useAuth } from "./context/AuthContext";

const LocationPicker = lazy(() => import("./pages/LocationPicker").then((module) => ({ default: module.LocationPicker })));
const MapPage = lazy(() => import("./pages/MapPage").then((module) => ({ default: module.MapPage })));

function ProtectedApp() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="app-loading"><span /><p>Opening your memory map…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <MemoryProvider>
        <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedApp />}>
            <Route element={<AppShell />}>
              <Route path="/home" element={<Home />} />
              <Route path="/new" element={<NewMemory />} />
              <Route path="/location" element={<Suspense fallback={<div className="app-loading"><span /><p>Opening the map…</p></div>}><LocationPicker /></Suspense>} />
              <Route path="/map" element={<Suspense fallback={<div className="app-loading"><span /><p>Opening the map…</p></div>}><MapPage /></Suspense>} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/memory/:id" element={<MemoryDetail />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        </HashRouter>
      </MemoryProvider>
    </AuthProvider>
  );
}
