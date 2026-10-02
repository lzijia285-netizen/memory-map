import { CircleUserRound, Clock3, House, Map, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/home", label: "Home", icon: House },
  { to: "/timeline", label: "Timeline", icon: Clock3 },
  { to: "/map", label: "Map", icon: Map },
  { to: "/profile", label: "Me", icon: CircleUserRound },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {links.slice(0, 2).map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          <Icon size={21} strokeWidth={1.9} />
          <span>{label}</span>
        </NavLink>
      ))}
      <NavLink to="/new" className="bottom-nav__add" aria-label="Add memory">
        <Plus size={28} strokeWidth={2} />
      </NavLink>
      {links.slice(2).map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          <Icon size={21} strokeWidth={1.9} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
