import { Camera, Check, ChevronRight, Clock3, ImagePlus, MapPin, ShieldCheck, Tag, UsersRound, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { useMemories } from "../context/MemoryContext";
import { locations } from "../data/mockData";
import type { Location, Visibility } from "../types/memory";

const moods = ["😊", "🙂", "😐", "😔", "😴"];
const suggestedTags = ["Travel", "Friends", "Food"];
type EditorDraft = { key: string; title: string; content: string; mood: string; eventTime: string; tags: string[]; visibility: Visibility; people: string[]; personInput: string; photoFiles: File[]; locationId: string };
let pendingDraft: EditorDraft | null = null;

export function NewMemory() {
  const navigate = useNavigate();
  const { memories, addMemory, updateMemory } = useMemories();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const existing = memories.find((item) => item.id === editId);
  const draft = pendingDraft?.key === (editId ?? "new") ? pendingDraft : null;
  const locationId = searchParams.get("location") ?? draft?.locationId ?? existing?.location.id ?? "";
  const storedLocation = (() => { try { return JSON.parse(sessionStorage.getItem("memory-map-selected-location") || "null") as Location | null; } catch { return null; } })();
  const location = locations.find((item) => item.id === locationId) ?? (storedLocation?.id === locationId ? storedLocation : undefined) ?? (existing?.location.id === locationId ? existing.location : undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedEdit = useRef(Boolean(draft || existing));
  const [title, setTitle] = useState(draft?.title ?? existing?.title ?? "");
  const [content, setContent] = useState(draft?.content ?? existing?.content ?? "");
  const [mood, setMood] = useState(draft?.mood ?? existing?.mood ?? "😊");
  const [eventTime, setEventTime] = useState(() => draft?.eventTime ?? (existing ? new Date(new Date(existing.eventTime).getTime() - new Date(existing.eventTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : (() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  })()));
  const [tags, setTags] = useState<string[]>(draft?.tags ?? existing?.tags ?? ["Friends"]);
  const [visibility, setVisibility] = useState<Visibility>(draft?.visibility ?? existing?.visibility ?? "Only Me");
  const [photos, setPhotos] = useState<string[]>(() => draft?.photoFiles.map((file) => URL.createObjectURL(file)) ?? existing?.photos ?? []);
  const [photoFiles, setPhotoFiles] = useState<File[]>(draft?.photoFiles ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [people, setPeople] = useState<string[]>(draft?.people ?? existing?.people ?? []);
  const [personInput, setPersonInput] = useState(draft?.personInput ?? "");

  useEffect(() => {
    if (!editId || !existing || loadedEdit.current) return;
    loadedEdit.current = true;
    setTitle(existing.title); setContent(existing.content); setMood(existing.mood);
    const date = new Date(existing.eventTime); date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    setEventTime(date.toISOString().slice(0, 16));
    setTags(existing.tags); setVisibility(existing.visibility); setPhotos(existing.photos); setPeople(existing.people);
  }, [editId, existing]);

  const keepDraft = () => {
    pendingDraft = { key: editId ?? "new", title, content, mood, eventTime, tags, visibility, people, personInput, photoFiles, locationId };
    if (location) sessionStorage.setItem("memory-map-selected-location", JSON.stringify(location));
  };

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 6);
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Each photo must be smaller than 10 MB.");
      return;
    }
    setError("");
    setPhotoFiles(files);
    setPhotos([...(editId ? existing?.photos ?? [] : []), ...files.map((file) => URL.createObjectURL(file))]);
  };
  useEffect(() => () => { photos.filter((url) => url.startsWith("blob:")).forEach((url) => URL.revokeObjectURL(url)); }, [photos]);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    if (saving) return;
    if (editId && !existing) { setError("This memory is still loading. Please try again."); return; }
    setSaving(true);
    setError("");
    try {
      const input = {
      title: title.trim() || "Untitled memory",
      content: content.trim() || "A small moment worth remembering.",
      eventTime: new Date(eventTime).toISOString(),
      locationId: locationId || "south-bank",
      location,
      photos,
      photoFiles,
      mood,
      visibility,
      tags,
      people,
      };
      if (editId) await updateMemory(editId, input);
      else await addMemory(input);
      pendingDraft = null;
      navigate(editId ? `/memory/${editId}` : "/home?saved=1");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this memory. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page--editor">
      <PageHeader title={editId ? "Edit memory" : "New memory"} back action={<button className="text-button" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save"}</button>} />
      <form className="memory-form" onSubmit={save}>
        <input ref={fileRef} className="sr-only" type="file" accept="image/*" multiple onChange={addPhotos} />
        <button type="button" className={`photo-drop ${photos.length ? "photo-drop--filled" : ""}`} disabled={Boolean(editId)} onClick={() => fileRef.current?.click()}>
          {photos.length ? (
            <><img src={photos[0]} alt="Selected memory" /><span><Camera size={18} /> {photos.length} selected</span></>
          ) : (
            <><span className="photo-drop__icon"><ImagePlus size={25} /></span><strong>{editId ? "No photos yet" : "Add photos"}</strong><small>{editId ? "Photo editing is coming later" : "Choose up to 6 moments"}</small></>
          )}
        </button>

        <label className="field field--title"><span>Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give this moment a name" /></label>
        <label className="field"><span>What happened?</span><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="The details you want to remember…" /></label>

        <fieldset className="field-group"><legend>Mood</legend><div className="mood-picker">{moods.map((item) => <button type="button" key={item} onClick={() => setMood(item)} className={mood === item ? "is-selected" : ""} aria-label={`Choose ${item}`}>{item}</button>)}</div></fieldset>

        <label className="form-row"><span className="form-row__icon"><Clock3 size={19} /></span><span><small>Event time</small><strong>{new Date(eventTime).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</strong></span><input aria-label="Event date and time" type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></label>
        <Link className="form-row" to={editId ? `/location?edit=${encodeURIComponent(editId)}` : "/location"} onClick={keepDraft}><span className="form-row__icon"><MapPin size={19} /></span><span><small>Location</small><strong>{location ? `${location.name}, ${location.city}` : "Add a location"}</strong></span><ChevronRight size={18} /></Link>

        <fieldset className="field-group"><legend><UsersRound size={16} /> People</legend><div className="people-input"><input value={personInput} onChange={(e) => setPersonInput(e.target.value)} placeholder="Add a friend, family member or pet" onKeyDown={(e) => { if (e.key === "Enter" && personInput.trim()) { e.preventDefault(); setPeople((current) => [...new Set([...current, personInput.trim()])]); setPersonInput(""); } }} /><button type="button" onClick={() => { if (personInput.trim()) { setPeople((current) => [...new Set([...current, personInput.trim()])]); setPersonInput(""); } }}>Add</button></div>{people.length > 0 && <div className="people-chips">{people.map((person) => <span key={person}>{person}<button type="button" aria-label={`Remove ${person}`} onClick={() => setPeople((current) => current.filter((item) => item !== person))}><X size={13} /></button></span>)}</div>}<small className="field-hint">Press Enter or Add. People do not need a Memory Map account.</small></fieldset>

        <fieldset className="field-group"><legend><Tag size={16} /> Tags</legend><div className="tag-picker">{suggestedTags.map((tag) => <button type="button" key={tag} className={tags.includes(tag) ? "is-selected" : ""} onClick={() => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tags.includes(tag) && <Check size={13} />}{tag}</button>)}</div></fieldset>

        <fieldset className="field-group"><legend><ShieldCheck size={16} /> Visibility</legend><div className="segmented-control"><button type="button" onClick={() => setVisibility("Only Me")} className={visibility === "Only Me" ? "is-selected" : ""}>Only me</button><button type="button" onClick={() => setVisibility("Friends")} className={visibility === "Friends" ? "is-selected" : ""}>Friends</button></div></fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button editor-save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save memory"} <Check size={18} /></button>
      </form>
    </div>
  );
}
