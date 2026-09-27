import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Memory } from "../../types/memory";

export function MemoryCard({ memory, featured = false }: { memory: Memory; featured?: boolean }) {
  const date = new Date(memory.eventTime);
  return (
    <Link to={`/memory/${memory.id}`} className={`memory-card ${featured ? "memory-card--featured" : ""}`}>
      <div className="memory-card__image-wrap">
        <img src={memory.photos[0]} alt="" className="memory-card__image" />
        <span className="memory-card__mood" aria-label={memory.moodLabel}>{memory.mood}</span>
      </div>
      <div className="memory-card__body">
        <div>
          <h3>{memory.title}</h3>
          <p><MapPin size={14} /> {memory.location.name}, {memory.location.city}</p>
        </div>
        <time dateTime={memory.eventTime}>{date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</time>
      </div>
    </Link>
  );
}
