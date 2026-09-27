import { LocateFixed, MapPin } from "lucide-react";
import { locations } from "../../data/mockData";

const pinPositions: Record<string, { left: string; top: string; count: number }> = {
  "south-bank": { left: "54%", top: "57%", count: 8 },
  "new-farm": { left: "75%", top: "34%", count: 6 },
  parkinson: { left: "30%", top: "73%", count: 4 },
  seoul: { left: "24%", top: "27%", count: 5 },
  gyeongju: { left: "69%", top: "76%", count: 3 },
};

export function MemoryMap({ selectedId, onSelect, picker = false }: { selectedId?: string; onSelect?: (id: string) => void; picker?: boolean }) {
  const shown = picker ? locations.slice(0, 3) : locations;
  return (
    <div className={`memory-map ${picker ? "memory-map--picker" : ""}`}>
      <svg className="memory-map__drawing" viewBox="0 0 800 600" preserveAspectRatio="none" aria-hidden="true">
        <path className="map-river" d="M-40 470 C140 370 205 475 350 370 C510 250 570 350 850 150" />
        <path className="map-road map-road--wide" d="M-30 165 C180 210 250 120 500 160 C650 185 720 120 850 90" />
        <path className="map-road" d="M110 -20 C170 110 165 250 300 330 C410 395 455 520 470 650" />
        <path className="map-road" d="M-50 560 C90 480 240 505 360 450 C500 390 655 440 840 350" />
        <path className="map-path" d="M20 310 C130 290 200 340 280 250 S420 130 560 230 S690 310 810 270" />
        <g className="map-blocks">
          <rect x="45" y="65" width="115" height="72" rx="13" /><rect x="190" y="53" width="95" height="93" rx="14" />
          <rect x="600" y="65" width="135" height="88" rx="15" /><rect x="532" y="238" width="110" height="75" rx="14" />
          <rect x="80" y="372" width="115" height="90" rx="16" /><rect x="585" y="450" width="145" height="72" rx="14" />
        </g>
      </svg>
      <div className="map-label map-label--river">Brisbane River</div>
      <div className="map-label map-label--city">BRISBANE</div>
      {shown.map((location) => {
        const position = pinPositions[location.id];
        return (
          <button
            key={location.id}
            type="button"
            className={`map-pin ${selectedId === location.id ? "is-selected" : ""}`}
            style={{ left: position.left, top: position.top }}
            onClick={() => onSelect?.(location.id)}
            aria-label={`${location.name}, ${position.count} memories`}
          >
            <span><MapPin size={17} fill="currentColor" /></span>
            {!picker && <b>{position.count}</b>}
          </button>
        );
      })}
      {picker && <span className="map-center-pin"><MapPin size={31} fill="currentColor" /></span>}
      <button className="map-locate" type="button" aria-label="Center on current location"><LocateFixed size={19} /></button>
    </div>
  );
}
