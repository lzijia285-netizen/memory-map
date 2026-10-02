import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl, type MapMouseEvent } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { locations as defaultLocations } from "../../data/mockData";
import type { Location } from "../../types/memory";

setWorkerUrl(workerUrl);

interface MemoryMapProps {
  selectedId?: string;
  onSelect?: (id: string) => void;
  onCoordinateSelect?: (longitude: number, latitude: number) => void;
  picker?: boolean;
  locations?: Location[];
  counts?: Record<string, number>;
}

export function MemoryMap({ selectedId, onSelect, onCoordinateSelect, picker = false, locations = defaultLocations, counts = {} }: MemoryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [153.0234, -27.481],
      zoom: picker ? 13 : 10.4,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => setMapReady(true));
    map.on("click", (event: MapMouseEvent) => {
      if (picker) onCoordinateSelect?.(event.lngLat.lng, event.lngLat.lat);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [picker, onCoordinateSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = locations.map((location) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `real-map-pin${selectedId === location.id ? " is-selected" : ""}`;
      button.setAttribute("aria-label", `${location.name}, ${counts[location.id] ?? 0} memories`);
      const count = counts[location.id];
      button.innerHTML = `<span aria-hidden="true">${picker ? "●" : count || "●"}</span><b>${location.name}</b>`;
      button.addEventListener("click", (event) => { event.stopPropagation(); onSelect?.(location.id); });
      return new Marker({ element: button, anchor: "bottom" }).setLngLat([location.longitude, location.latitude]).addTo(map);
    });
    if (picker && selected) map.easeTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(map.getZoom(), 13), duration: 650 });
    if (!picker && selected) map.easeTo({ center: [selected.longitude, selected.latitude], zoom: 10.6, duration: 800 });
  }, [counts, locations, mapReady, onSelect, picker, selected, selectedId]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 });
      onCoordinateSelect?.(coords.longitude, coords.latitude);
    });
  };

  return (
    <div className={`memory-map memory-map--real ${picker ? "memory-map--picker" : ""}`}>
      <div ref={containerRef} className="memory-map__canvas" aria-label="Interactive memory map" />
      {!mapReady && <div className="map-loading"><span /><p>Drawing your map…</p></div>}
      <button className="map-locate" type="button" onClick={locate} aria-label="Use current location"><LocateFixed size={19} /></button>
      {picker && <div className="map-picker-hint">Tap anywhere to place the pin</div>}
    </div>
  );
}
