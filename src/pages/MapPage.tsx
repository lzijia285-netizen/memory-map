import { ChevronDown, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MemoryMap } from "../components/map/MemoryMap";
import { useMemories } from "../context/MemoryContext";

const placeKey = (latitude: number, longitude: number) => `${latitude.toFixed(5)}:${longitude.toFixed(5)}`;

export function MapPage() {
  const { memories } = useMemories();
  const [selected, setSelected] = useState("");
  const [sheetOpen, setSheetOpen] = useState(true);
  const places = Array.from(new Map(memories.map((memory) => {
    const key = placeKey(memory.location.latitude, memory.location.longitude);
    return [key, { ...memory.location, id: key }] as const;
  })).values());
  const selectedId = places.some((place) => place.id === selected) ? selected : places[0]?.id;
  const location = places.find((item) => item.id === selectedId);
  const related = memories.filter((memory) => placeKey(memory.location.latitude, memory.location.longitude) === selectedId);
  const counts = memories.reduce<Record<string, number>>((acc, memory) => { const key = placeKey(memory.location.latitude, memory.location.longitude); acc[key] = (acc[key] ?? 0) + 1; return acc; }, {});
  const selectPin = (id: string) => { setSelected(id); setSheetOpen(true); };

  return (
    <div className="map-page">
      <div className="map-page__header"><PageHeader title="My Memory Map" eyebrow={`${memories.length} MEMORIES · ${places.length} PLACES`} /><div className="map-filters"><button>2026 <ChevronDown size={15} /></button><button>All memories <ChevronDown size={15} /></button></div></div>
      <div className="map-page__canvas"><MemoryMap selectedId={selectedId} onSelect={selectPin} counts={counts} locations={places} /></div>
      {sheetOpen && location && <aside className="map-sheet">
        <div className="map-sheet__handle" />
        <button className="map-sheet__close" type="button" onClick={() => setSheetOpen(false)} aria-label="Close"><X size={18} /></button>
        <div className="map-sheet__heading"><span><MapPin size={18} /></span><div><h2>{location.name}</h2><p>{related.length} {related.length === 1 ? "memory" : "memories"} · {location.city}</p></div></div>
        <div className="map-sheet__list">{related.map((memory) => <Link to={`/memory/${memory.id}`} key={memory.id}>{memory.photos[0] ? <img src={memory.photos[0]} alt="" /> : <span className="map-sheet__placeholder"><MapPin size={18} /></span>}<span><strong>{memory.title}</strong><small>{new Date(memory.eventTime).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}</small></span></Link>)}</div>
      </aside>}
    </div>
  );
}
