import { ChevronDown, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MemoryMap } from "../components/map/MemoryMap";
import { useMemories } from "../context/MemoryContext";
import { locations } from "../data/mockData";

export function MapPage() {
  const { memories } = useMemories();
  const [selected, setSelected] = useState("south-bank");
  const [sheetOpen, setSheetOpen] = useState(true);
  const location = locations.find((item) => item.id === selected) ?? locations[0];
  const related = memories.filter((memory) => memory.location.id === selected).slice(0, 3);
  const counts = memories.reduce<Record<string, number>>((acc, memory) => { acc[memory.location.id] = (acc[memory.location.id] ?? 0) + 1; return acc; }, {});
  const selectPin = (id: string) => { setSelected(id); setSheetOpen(true); };

  return (
    <div className="map-page">
      <div className="map-page__header"><PageHeader title="My Memory Map" eyebrow={`${memories.length} MEMORIES · ${new Set(memories.map((memory) => memory.location.id)).size} PLACES`} /><div className="map-filters"><button>2026 <ChevronDown size={15} /></button><button>All memories <ChevronDown size={15} /></button></div></div>
      <div className="map-page__canvas"><MemoryMap selectedId={selected} onSelect={selectPin} counts={counts} /></div>
      {sheetOpen && <aside className="map-sheet">
        <div className="map-sheet__handle" />
        <button className="map-sheet__close" type="button" onClick={() => setSheetOpen(false)} aria-label="Close"><X size={18} /></button>
        <div className="map-sheet__heading"><span><MapPin size={18} /></span><div><h2>{location.name}</h2><p>{related.length || 3} memories · {location.city}</p></div></div>
        <div className="map-sheet__list">{(related.length ? related : memories.slice(0,3)).map((memory) => <Link to={`/memory/${memory.id}`} key={memory.id}><img src={memory.photos[0]} alt="" /><span><strong>{memory.title}</strong><small>{new Date(memory.eventTime).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</small></span></Link>)}</div>
      </aside>}
    </div>
  );
}
