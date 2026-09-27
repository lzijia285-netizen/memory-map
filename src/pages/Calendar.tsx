import { ChevronLeft, ChevronRight, Clock3, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useMemories } from "../context/MemoryContext";

const days = Array.from({ length: 35 }, (_, index) => index < 1 ? null : index > 30 ? null : index);
const memoryDays = [2, 18, 26];

export function Calendar() {
  const { memories } = useMemories();
  const [selectedDay, setSelectedDay] = useState<number | null>(26);
  const selectedMemories = selectedDay === 26 ? memories.slice(0, 2) : memories.filter((memory) => new Date(memory.eventTime).getDate() === selectedDay).slice(0, 2);

  return (
    <div className="page page--calendar">
      <PageHeader title="Calendar" eyebrow="YOUR DAYS" />
      <div className="view-switch"><NavLink to="/timeline"><Clock3 size={15} /> Timeline</NavLink><NavLink to="/calendar">Calendar</NavLink></div>
      <section className="calendar-card">
        <header><button className="icon-button" aria-label="Previous month"><ChevronLeft size={19} /></button><h2>September <span>2026</span></h2><button className="icon-button" aria-label="Next month"><ChevronRight size={19} /></button></header>
        <div className="calendar-weekdays">{["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid">{days.map((day, index) => day ? <button key={day} type="button" className={`${memoryDays.includes(day) ? "has-memory" : ""} ${selectedDay === day ? "is-selected" : ""}`} onClick={() => setSelectedDay(day)}><span>{day}</span>{memoryDays.includes(day) && <i />}</button> : <span key={`blank-${index}`} />)}</div>
      </section>
      <section className="calendar-legend"><span><i /> Memory added</span><span>{memoryDays.length} days remembered</span></section>
      {selectedDay && <aside className="day-sheet">
        <button className="day-sheet__close icon-button" type="button" onClick={() => setSelectedDay(null)} aria-label="Close"><X size={17} /></button>
        <p className="page-kicker">{selectedDay} SEPTEMBER</p><h2>{selectedMemories.length || 1} {selectedMemories.length === 1 ? "memory" : "memories"}</h2>
        <div className="day-sheet__list">{(selectedMemories.length ? selectedMemories : memories.slice(2,3)).map((memory) => <Link key={memory.id} to={`/memory/${memory.id}`}><img src={memory.photos[0]} alt="" /><span><strong>{memory.title}</strong><small><MapPin size={12} /> {memory.location.name}</small></span><span>{memory.mood}</span></Link>)}</div>
      </aside>}
    </div>
  );
}
