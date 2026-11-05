import { ArrowLeft, CalendarDays, Edit3, LockKeyhole, MapPin, Share2, UsersRound } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMemories } from "../context/MemoryContext";

export function MemoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { memories } = useMemories();
  const memory = memories.find((item) => item.id === id);
  if (!memory) return <div className="page"><p>This memory is unavailable.</p><Link to="/home">Back to home</Link></div>;
  const date = new Date(memory.eventTime);
  return (
    <div className="detail-page">
      <div className="detail-hero">
        {memory.photos[0] ? <img src={memory.photos[0]} alt={memory.title} /> : <div className="detail-hero__placeholder"><MapPin size={72} /></div>}
        <div className="detail-hero__shade" />
        <button className="detail-control" type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <button className="detail-control detail-control--right" type="button" aria-label="Share"><Share2 size={19} /></button>
        <div className="detail-hero__caption"><span>{memory.mood} {memory.moodLabel}</span><h1>{memory.title}</h1></div>
      </div>
      <article className="detail-body">
        <div className="detail-meta"><span><CalendarDays size={18} /><span><small>When</small><strong>{date.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })} · {date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}</strong></span></span><span><MapPin size={18} /><span><small>Where</small><strong>{memory.location.name}, {memory.location.city}</strong></span></span>{memory.people.length > 0 && <span><UsersRound size={18} /><span><small>With</small><strong>{memory.people.join(", ")}</strong></span></span>}</div>
        <p className="detail-copy">{memory.content}</p>
        {memory.photos.length > 1 && <div className="detail-gallery">{memory.photos.slice(1).map((image, index) => <img src={image} alt={`${memory.title} ${index + 2}`} key={image} />)}</div>}
        <div className="detail-tags">{memory.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="detail-privacy"><LockKeyhole size={17} /><span><strong>{memory.visibility}</strong><small>{memory.visibility === "Only Me" ? "Visible only to you" : "Shared with your close friends"}</small></span></div>
        <Link className="primary-button detail-edit" to={`/new?edit=${memory.id}`}><Edit3 size={17} /> Edit memory</Link>
      </article>
    </div>
  );
}
