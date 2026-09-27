import { ArrowRight, Camera, MapPin, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { MemoryCard } from "../components/memory/MemoryCard";
import { useMemories } from "../context/MemoryContext";

export function Home() {
  const { memories } = useMemories();
  return (
    <div className="page page--home">
      <header className="home-header">
        <div>
          <p className="page-kicker">Sunday, 27 September</p>
          <h1>Good evening, Alex</h1>
        </div>
        <Link to="/profile" className="avatar" aria-label="Open profile">AL</Link>
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
      </section>

      <section className="month-panel">
        <div className="month-panel__title"><span className="eyebrow">THIS MONTH</span><h2>September, so far</h2></div>
        <div className="month-stats">
          <div><strong>12</strong><span>Memories</span></div>
          <div><strong>4</strong><span>Places</span></div>
          <div><strong>36</strong><span>Photos</span></div>
        </div>
        <div className="month-panel__trail">
          <span><Camera size={15} /> A full month</span>
          <span><MapPin size={15} /> Brisbane</span>
        </div>
      </section>
    </div>
  );
}
