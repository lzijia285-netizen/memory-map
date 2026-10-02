import { CalendarDays, CircleUserRound, Clock3, Heart, House, Map, Plus, UsersRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { BottomNav } from "../navigation/BottomNav";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { to: "/home", label: "Home", icon: House },
  { to: "/timeline", label: "Timeline", icon: Clock3 },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/map", label: "Map", icon: Map },
  { to: "/friends", label: "Friends", icon: UsersRound },
  { to: "/profile", label: "Profile", icon: CircleUserRound },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "brand-mark--compact" : ""}`}>
      <span className="brand-mark__icon" aria-hidden="true"><Map size={20} strokeWidth={2.1} /></span>
      {!compact && <span>Memory Map</span>}
    </div>
  );
}

function DesktopSidebar() {
  const { user } = useAuth();
  const initials = (user?.name || "Friend").slice(0, 2).toUpperCase();
  return (
    <aside className="desktop-sidebar">
      <BrandMark />
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `desktop-nav__link ${isActive ? "is-active" : ""}`}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink className="desktop-add" to="/new"><Plus size={20} /> Add memory</NavLink>
      <div className="sidebar-profile">
        <div className="avatar avatar--small">{initials}</div>
        <div><strong>{user?.name || "Friend"}</strong><span>Private space</span></div>
      </div>
    </aside>
  );
}

function ContextPanel() {
  const now = new Date();
  return (
    <aside className="context-panel">
      <div className="context-panel__top"><span>{now.toLocaleDateString("en-AU", { weekday: "long" })}</span><strong>{now.getDate()}</strong><span>{now.toLocaleDateString("en-AU", { month: "long" })}</span></div>
      <div className="context-block">
        <div className="eyebrow">ON THIS DAY</div>
        <img src="./memories/seoul-cafe.png" alt="Coffee by a rainy window" />
        <strong>Rainy Seoul Café</strong>
        <span>One year ago · Seongsu</span>
      </div>
      <div className="context-block context-block--friends">
        <div className="eyebrow">CLOSE FRIENDS</div>
        <div className="friend-stack"><span>MI</span><span>JU</span><span>SA</span><i>+7</i></div>
        <p>Three friends shared something this week.</p>
        <NavLink to="/friends"><Heart size={16} /> See shared memories</NavLink>
      </div>
    </aside>
  );
}

export function AppShell() {
  return (
    <div className="app-shell">
      <DesktopSidebar />
      <main className="app-main"><Outlet /></main>
      <ContextPanel />
      <BottomNav />
    </div>
  );
}
