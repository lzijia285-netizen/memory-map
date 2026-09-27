import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { MemoryProvider } from "./context/MemoryContext";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NewMemory } from "./pages/NewMemory";
import { LocationPicker } from "./pages/LocationPicker";
import { MapPage } from "./pages/MapPage";
import { Timeline } from "./pages/Timeline";
import { Calendar } from "./pages/Calendar";
import { Friends } from "./pages/Friends";
import { Profile } from "./pages/Profile";
import { MemoryDetail } from "./pages/MemoryDetail";

export default function App() {
  return (
    <MemoryProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/new" element={<NewMemory />} />
            <Route path="/location" element={<LocationPicker />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/memory/:id" element={<MemoryDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </HashRouter>
    </MemoryProvider>
  );
}
