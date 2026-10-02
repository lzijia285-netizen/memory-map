import { ArrowRight, Camera, MapPin, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MemoryCard } from "../components/memory/MemoryCard";
import { useMemories } from "../context/MemoryContext";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { memories } = useMemories();
  const { user, cloudEnabled } = useAuth();
  const now = new Date();
  const thisMonth = memories.filter((memory) => { const date = new Date(memory.eventTime); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); });
  const monthPlaces = new Set(thisMonth.map((memory) => memory.location.id)).size;
  const monthPhotos = thisMonth.reduce((total, memory) => total + memory.photos.length, 0);
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const initials = (user?.name || "Friend").slice(0, 2).toUpperCase();
  return (
    <div className="page page--home">
      <header className="home-header">
        <div>
          <p className="page-kicker">{now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{greeting}, {user?.name || "Friend"}</h1>
        </div>
        <Link to="/profile" className="avatar" aria-label="Open profile">{initials}</Link>
      </header>

      <Link to="/new" className="today-prompt">
        <span className="today-prompt__spark"><Sparkles size={20} /></span>
        <span><small>A moment worth keeping?</small><strong>What happened today?</strong></span>
        <span className="today-prompt__action"><Plus size={18} /> Add memory</span>
      </Link>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">YOUR DAYS</span><h2>Recent memories</h2></div>
          <Link to="/timeline">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="memory-grid">
          {memories.slice(0, 4).map((memory, index) => <MemoryCard key={memory.id} memory={memory} featured={index === 0} />)}
        </div>
        {memories.length === 0 && <div className="empty-memories"><Sparkles size={21} /><strong>Your map is ready for its first memory.</strong><Link to="/new">Add a moment</Link></div>}
      </section>

      <section className="month-panel">
        <div className="month-panel__title"><span className="eyebrow">THIS MONTH · {cloudEnabled ? "CLOUD" : "PREVIEW"}</span><h2>{now.toLocaleDateString("en-AU", { month: "long" })}, so far</h2></div>
        <div className="month-stats">
          <div><strong>{thisMonth.length}</strong><span>Memories</span></div>
          <div><strong>{monthPlaces}</strong><span>Places</span></div>
          <div><strong>{monthPhotos}</strong><span>Photos</span></div>
        </div>
        <div className="month-panel__trail">
          <span><Camera size={15} /> A full month</span>
          <span><MapPin size={15} /> Brisbane</span>
        </div>
      </section>
    </div>
  );
}
