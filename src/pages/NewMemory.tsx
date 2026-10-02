import { Camera, Check, ChevronRight, Clock3, ImagePlus, MapPin, ShieldCheck, Tag, UsersRound, X } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useMemories } from "../context/MemoryContext";
import { locations } from "../data/mockData";
import type { Location, Visibility } from "../types/memory";

const moods = ["😊", "🙂", "😐", "😔", "😴"];
const suggestedTags = ["Travel", "Friends", "Food"];

export function NewMemory() {
  const navigate = useNavigate();
  const { addMemory } = useMemories();
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("location") ?? "";
  const storedLocation = (() => { try { return JSON.parse(sessionStorage.getItem("memory-map-selected-location") || "null") as Location | null; } catch { return null; } })();
  const location = locations.find((item) => item.id === locationId) ?? (storedLocation?.id === locationId ? storedLocation : undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("😊");
  const [eventTime, setEventTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [tags, setTags] = useState<string[]>(["Friends"]);
  const [visibility, setVisibility] = useState<Visibility>("Only Me");
  const [photos, setPhotos] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [personInput, setPersonInput] = useState("");

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setPhotos(files.slice(0, 6).map((file) => URL.createObjectURL(file)));
  };
  const save = (event?: FormEvent) => {
    event?.preventDefault();
    addMemory({
      title: title.trim() || "Untitled memory",
      content: content.trim() || "A small moment worth remembering.",
      eventTime: new Date(eventTime).toISOString(),
      locationId: locationId || "south-bank",
      location,
      photos,
      mood,
      visibility,
      tags,
      people,
    });
    navigate("/home?saved=1");
  };

  return (
    <div className="page page--editor">
      <PageHeader title="New memory" back action={<button className="text-button" type="button" onClick={() => save()}>Save</button>} />
      <form className="memory-form" onSubmit={save}>
        <input ref={fileRef} className="sr-only" type="file" accept="image/*" multiple onChange={addPhotos} />
        <button type="button" className={`photo-drop ${photos.length ? "photo-drop--filled" : ""}`} onClick={() => fileRef.current?.click()}>
          {photos.length ? (
            <><img src={photos[0]} alt="Selected memory" /><span><Camera size={18} /> {photos.length} selected</span></>
          ) : (
            <><span className="photo-drop__icon"><ImagePlus size={25} /></span><strong>Add photos</strong><small>Choose up to 6 moments</small></>
          )}
        </button>

        <label className="field field--title"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give this moment a name" /></label>
        <label className="field"><span>What happened?</span><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="The details you want to remember…" /></label>

        <fieldset className="field-group"><legend>Mood</legend><div className="mood-picker">{moods.map((item) => <button type="button" key={item} onClick={() => setMood(item)} className={mood === item ? "is-selected" : ""} aria-label={`Choose ${item}`}>{item}</button>)}</div></fieldset>

        <label className="form-row"><span className="form-row__icon"><Clock3 size={19} /></span><span><small>Event time</small><strong>{new Date(eventTime).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</strong></span><input aria-label="Event date and time" type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></label>
        <Link className="form-row" to="/location"><span className="form-row__icon"><MapPin size={19} /></span><span><small>Location</small><strong>{location ? `${location.name}, ${location.city}` : "Add a location"}</strong></span><ChevronRight size={18} /></Link>

        <fieldset className="field-group"><legend><UsersRound size={16} /> People</legend><div className="people-input"><input value={personInput} onChange={(e) => setPersonInput(e.target.value)} placeholder="Add a friend, family member or pet" onKeyDown={(e) => { if (e.key === "Enter" && personInput.trim()) { e.preventDefault(); setPeople((current) => [...new Set([...current, personInput.trim()])]); setPersonInput(""); } }} /><button type="button" onClick={() => { if (personInput.trim()) { setPeople((current) => [...new Set([...current, personInput.trim()])]); setPersonInput(""); } }}>Add</button></div>{people.length > 0 && <div className="people-chips">{people.map((person) => <span key={person}>{person}<button type="button" aria-label={`Remove ${person}`} onClick={() => setPeople((current) => current.filter((item) => item !== person))}><X size={13} /></button></span>)}</div>}<small className="field-hint">Press Enter or Add. People do not need a Memory Map account.</small></fieldset>

        <fieldset className="field-group"><legend><Tag size={16} /> Tags</legend><div className="tag-picker">{suggestedTags.map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? "is-selected" : ""} onClick={() => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tags.includes(tag) && <Check size={13} />}{tag}</button>)}</div></fieldset>

        <fieldset className="field-group"><legend><ShieldCheck size={16} /> Visibility</legend><div className="segmented-control"><button type="button" onClick={() => setVisibility("Only Me")} className={visibility === "Only Me" ? "is-selected" : ""}>Only me</button><button type="button" onClick={() => setVisibility("Friends")} className={visibility === "Friends" ? "is-selected" : ""}>Friends</button></div></fieldset>
        <button className="primary-button editor-save" type="submit">Save memory <Check size={18} /></button>
      </form>
    </div>
  );
}
