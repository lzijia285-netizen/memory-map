import { CalendarDays, MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useMemories } from "../context/MemoryContext";

export function Timeline() {
  const { memories } = useMemories();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => memories.filter((memory) => `${memory.title} ${memory.location.name} ${memory.location.city}`.toLowerCase().includes(query.toLowerCase())), [memories, query]);
  const groups = filtered.reduce<Record<string, typeof memories>>((acc, memory) => {
    const label = new Date(memory.eventTime).toLocaleDateString("en-AU", { month: "long" });
    (acc[label] ||= []).push(memory);
    return acc;
  }, {});

  return (
    <div className="page page--timeline">
      <PageHeader title="Timeline" eyebrow="2026" action={<button className="icon-button" type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search">{searchOpen ? <X size={20} /> : <Search size={20} />}</button>} />
      {searchOpen && <div className="search-field timeline-search"><Search size={18} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your memories" /></div>}
      <div className="view-switch"><NavLink to="/timeline">Timeline</NavLink><NavLink to="/calendar"><CalendarDays size={15} /> Calendar</NavLink></div>
      <div className="year-marker"><span>2026</span><i /></div>
      <div className="timeline-list">
        {Object.entries(groups).map(([month, monthMemories]) => (
          <section key={month} className="timeline-month">
            <h2>{month}</h2>
            <div>{monthMemories.map((memory) => {
              const date = new Date(memory.eventTime);
              return <Link className="timeline-entry" to={`/memory/${memory.id}`} key={memory.id}>
                <time><strong>{date.getDate().toString().padStart(2, "0")}</strong><span>{date.toLocaleDateString("en-AU", { weekday: "short" })}</span></time>
                <span className="timeline-entry__dot" />
                <img src={memory.photos[0]} alt="" />
                <span className="timeline-entry__copy"><strong>{memory.title}</strong><small><MapPin size={13} /> {memory.location.city}</small></span>
                <span className="timeline-entry__mood">{memory.mood}</span>
              </Link>;
            })}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
