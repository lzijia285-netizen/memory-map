import { ArrowRight, Heart, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useMemories } from "../context/MemoryContext";
import { users } from "../data/mockData";

export function Friends() {
  const { memories } = useMemories();
  const shared = memories.filter((memory) => memory.user.id !== "alex").slice(0, 3);
  const [liked, setLiked] = useState<string[]>([]);
  return (
    <div className="page page--friends">
      <PageHeader title="Friends" eyebrow="YOUR SMALL CIRCLE" action={<span className="friend-count"><UsersRound size={16} /> 10</span>} />
      <section className="section-block friends-shared">
        <div className="section-heading"><div><span className="eyebrow">RECENTLY SHARED</span><h2>From your friends</h2></div></div>
        <div className="shared-grid">{shared.map((memory) => {
          const isLiked = liked.includes(memory.id);
          return <article className="shared-card" key={memory.id}>
            <div className="shared-card__user"><span className="avatar avatar--small" style={{ background: memory.user.color }}>{memory.user.initials}</span><span><strong>{memory.user.name}</strong><small>shared with friends</small></span></div>
            <Link to={`/memory/${memory.id}`} className="shared-card__image"><img src={memory.photos[0]} alt="" /><span>{memory.mood}</span></Link>
            <div className="shared-card__copy"><Link to={`/memory/${memory.id}`}><h3>{memory.title}</h3><p>{memory.location.city} · {new Date(memory.eventTime).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p></Link><div><button className={isLiked ? "is-liked" : ""} type="button" onClick={() => setLiked((current) => isLiked ? current.filter((id) => id !== memory.id) : [...current, memory.id])}><Heart size={17} fill={isLiked ? "currentColor" : "none"} /> {(memory.likes ?? 0) + (isLiked ? 1 : 0)}</button><Link to={`/memory/${memory.id}`}>View <ArrowRight size={15} /></Link></div></div>
          </article>;
        })}</div>
      </section>
      <section className="friends-list"><div className="section-heading"><div><span className="eyebrow">YOUR FRIENDS</span><h2>Close circle</h2></div></div>{users.concat([{ id: "sam", name: "Sam", initials: "SA", color: "#F4DCF8" }]).map((friend, index) => <div className="friend-row" key={friend.id}><span className="avatar avatar--small" style={{ background: friend.color }}>{friend.initials}</span><span><strong>{friend.name}</strong><small>{index === 0 ? "You" : `${8 - index} shared memories`}</small></span><span className="friend-row__status">{index === 0 ? "" : "Friend"}</span></div>)}</section>
    </div>
  );
}
