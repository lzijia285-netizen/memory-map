import { Crosshair, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MemoryMap } from "../components/map/MemoryMap";
import { locations } from "../data/mockData";

export function LocationPicker() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("south-bank");
  const location = locations.find((item) => item.id === selected) ?? locations[0];
  const matches = useMemo(() => locations.filter((item) => `${item.name} ${item.city}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="page page--location">
      <PageHeader title="Add location" back />
      <button className="current-location" type="button" onClick={() => setSelected("south-bank")}><Crosshair size={18} /> Use current location</button>
      <div className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a place" /></div>
      {query && <div className="search-results">{matches.map((item) => <button key={item.id} type="button" onClick={() => { setSelected(item.id); setQuery(""); }}><MapPin size={16} /><span><strong>{item.name}</strong><small>{item.city}, {item.country}</small></span></button>)}</div>}
      <MemoryMap picker selectedId={selected} onSelect={setSelected} />
      <div className="location-card"><div><span className="location-card__pin"><MapPin size={19} /></span><span><strong>{location.name}</strong><small>{location.city}, {location.country}</small></span></div><button className="primary-button" onClick={() => navigate(`/new?location=${selected}`)}>Confirm location</button></div>
    </div>
  );
}
