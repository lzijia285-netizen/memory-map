import { Crosshair, LoaderCircle, MapPin, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { MemoryMap } from "../components/map/MemoryMap";
import { locations as savedLocations } from "../data/mockData";
import type { Location } from "../types/memory";

const LOCATION_KEY = "memory-map-selected-location";

export function LocationPicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Location>(() => {
    try { return JSON.parse(sessionStorage.getItem(LOCATION_KEY) || "null") as Location || savedLocations[0]; }
    catch { return savedLocations[0]; }
  });
  const [results, setResults] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const mapLocations = useMemo(() => [selected, ...savedLocations.filter((item) => item.id !== selected.id)], [selected]);

  const search = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setMessage("");
    try {
      const params = new URLSearchParams({ q: query.trim(), format: "jsonv2", limit: "5", addressdetails: "1" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!response.ok) throw new Error();
      const data = await response.json() as Array<{ osm_id: number; display_name: string; lat: string; lon: string; name?: string; address?: { city?: string; town?: string; state?: string; country?: string } }>;
      setResults(data.map((item) => ({ id: `osm-${item.osm_id}`, name: item.name || item.display_name.split(",")[0], city: item.address?.city || item.address?.town || item.address?.state || "Pinned place", country: item.address?.country || "", latitude: Number(item.lat), longitude: Number(item.lon) })));
      if (!data.length) setMessage("No places found. Try a nearby landmark or suburb.");
    } catch {
      setMessage("Place search is resting. You can still tap the map to choose a location.");
    } finally {
      setSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setMessage("Current location is not available in this browser."); return; }
    navigator.geolocation.getCurrentPosition(({ coords }) => setSelected({ id: "current-location", name: "Current location", city: "Pinned from this device", country: "", latitude: coords.latitude, longitude: coords.longitude }), () => setMessage("Location permission was not granted. Tap the map instead."));
  };

  const chooseCoordinate = (longitude: number, latitude: number) => setSelected({ id: "custom-pin", name: "Pinned location", city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, country: "", latitude, longitude });
  const confirm = () => {
    sessionStorage.setItem(LOCATION_KEY, JSON.stringify(selected));
    navigate(`/new?${editId ? `edit=${encodeURIComponent(editId)}&` : ""}location=${encodeURIComponent(selected.id)}`);
  };

  return (
    <div className="page page--location">
      <PageHeader title="Add location" back />
      <button className="current-location" type="button" onClick={useCurrentLocation}><Crosshair size={18} /> Use current location</button>
      <form className="search-field" onSubmit={search}><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a place, then press Enter" /><button type="submit" aria-label="Search places">{searching ? <LoaderCircle className="spin" size={18} /> : "Search"}</button></form>
      {message && <p className="location-message">{message}</p>}
      {results.length > 0 && <div className="search-results">{results.map((item) => <button key={item.id} type="button" onClick={() => { setSelected(item); setResults([]); setQuery(""); }}><MapPin size={16} /><span><strong>{item.name}</strong><small>{item.city}{item.country ? `, ${item.country}` : ""}</small></span></button>)}</div>}
      <MemoryMap picker selectedId={selected.id} locations={mapLocations} onSelect={(id) => { const location = mapLocations.find((item) => item.id === id); if (location) setSelected(location); }} onCoordinateSelect={chooseCoordinate} />
      <div className="location-card"><div><span className="location-card__pin"><MapPin size={19} /></span><span><strong>{selected.name}</strong><small>{selected.city}{selected.country ? `, ${selected.country}` : ""}</small></span></div><button className="primary-button" onClick={confirm}>Confirm location</button></div>
    </div>
  );
}
