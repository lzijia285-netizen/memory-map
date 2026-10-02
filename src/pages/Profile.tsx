import { ChevronRight, CircleUserRound, Images, LockKeyhole, LogOut, Map, Settings, UsersRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemories } from "../context/MemoryContext";
import { useAuth } from "../context/AuthContext";

const menu = [
  { id: "memories", label: "My memories", detail: "All of your saved moments", icon: Images },
  { id: "map", label: "My map", detail: "18 places remembered", icon: Map },
  { id: "friends", label: "Friends", detail: "10 people in your circle", icon: UsersRound },
  { id: "privacy", label: "Privacy", detail: "Memories are private by default", icon: LockKeyhole },
  { id: "settings", label: "Settings", detail: "Notifications and preferences", icon: Settings },
];

export function Profile() {
  const { memories } = useMemories();
  const navigate = useNavigate();
  const { user, signOut, cloudEnabled } = useAuth();
  const [active, setActive] = useState("privacy");
  const photoCount = memories.reduce((total, memory) => total + memory.photos.length, 0);
  const placeCount = new Set(memories.map((memory) => memory.location.id)).size;
  return (
    <div className="page page--profile">
      <section className="profile-hero">
        <div className="profile-avatar"><CircleUserRound size={42} /></div>
        <div><p className="page-kicker">YOUR MEMORY MAP</p><h1>{user?.name || "Friend"}</h1><span>{cloudEnabled ? "Secure cloud account" : "Preview account"} · Brisbane</span></div>
      </section>
      <section className="profile-stats"><div><strong>{memories.length}</strong><span>Memories</span></div><div><strong>{photoCount}</strong><span>Photos</span></div><div><strong>{placeCount}</strong><span>Places</span></div></section>
      <section className="year-card"><div><p className="eyebrow">2026 IN REVIEW</p><h2>A year of little moments</h2></div><div><span><strong>40</strong> Memories</span><span><strong>12</strong> Places</span><span><strong>268</strong> Photos</span></div></section>
      <section className="profile-menu">{menu.map(({ id, label, detail, icon: Icon }) => <button type="button" key={id} className={active === id ? "is-active" : ""} onClick={() => setActive(id)}><span className="profile-menu__icon"><Icon size={19} /></span><span><strong>{label}</strong><small>{detail}</small></span><ChevronRight size={17} /></button>)}<button className="profile-logout" type="button" onClick={async () => { await signOut(); navigate("/login"); }}><span className="profile-menu__icon"><LogOut size={19} /></span><span><strong>Log out</strong><small>Return to the invitation screen</small></span><ChevronRight size={17} /></button></section>
    </div>
  );
}
