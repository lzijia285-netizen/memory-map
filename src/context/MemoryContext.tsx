import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialMemories, locations, users } from "../data/mockData";
import type { Location, Memory, Visibility } from "../types/memory";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

interface NewMemoryInput {
  title: string;
  content: string;
  eventTime: string;
  locationId: string;
  location?: Location;
  photos: string[];
  photoFiles?: File[];
  mood: string;
  visibility: Visibility;
  tags: string[];
  people: string[];
}

interface MemoryContextValue {
  memories: Memory[];
  addMemory: (input: NewMemoryInput) => Promise<Memory>;
  updateMemory: (id: string, input: NewMemoryInput) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
}

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>(supabase ? [] : initialMemories);
  const { user } = useAuth();

  useEffect(() => {
    if (!supabase) return;
    if (!user) { setMemories([]); return; }
    let active = true;
    setMemories([]);
    void supabase.from("memories").select("*, memory_people(display_name), memory_photos(storage_path, sort_order), author:profiles!memories_owner_id_fkey(display_name)").order("event_time", { ascending: false }).then(async ({ data, error }) => {
      if (!active || error || !data) return;
      const mapped: Memory[] = await Promise.all(data.map(async (row) => {
        const paths = Array.isArray(row.memory_photos)
          ? [...row.memory_photos].sort((a, b) => a.sort_order - b.sort_order).map((photo) => String(photo.storage_path))
          : [];
        const { data: signed } = paths.length ? await supabase!.storage.from("memory-photos").createSignedUrls(paths, 86400) : { data: [] };
        const authorName = String(row.author?.display_name ?? "Friend");
        return {
        id: String(row.id),
        title: String(row.title),
        content: String(row.content ?? ""),
        eventTime: String(row.event_time),
        createdAt: String(row.created_at),
        location: { id: `db-${row.id}`, name: String(row.location_name), city: String(row.location_city ?? ""), country: String(row.location_country ?? ""), latitude: Number(row.latitude), longitude: Number(row.longitude) },
        photos: signed?.map((photo) => photo.signedUrl).filter((url): url is string => Boolean(url)) ?? [],
        mood: String(row.mood ?? "😊"),
        moodLabel: String(row.mood_label ?? "A memory"),
        visibility: row.visibility === "Friends" ? "Friends" : "Only Me",
        tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
        people: Array.isArray(row.memory_people) ? row.memory_people.map((person: { display_name?: string }) => person.display_name).filter(Boolean) as string[] : [],
        user: { id: String(row.owner_id), name: authorName, initials: authorName.slice(0, 2).toUpperCase(), color: "#BCEFD8" },
      }; }));
      if (active) setMemories(mapped);
    });
    return () => { active = false; };
  }, [user]);

  const addMemory = useCallback(async (input: NewMemoryInput) => {
    if (supabase && !user) throw new Error("Sign in before saving a memory.");
    const location = input.location ?? locations.find((item) => item.id === input.locationId) ?? locations[0];
    const memory: Memory = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      location,
      photos: input.photos,
      moodLabel: "A new memory",
      user: user ? { id: user.id, name: user.name, initials: user.name.slice(0, 2).toUpperCase(), color: "#BCEFD8" } : users[0],
    };
    if (supabase && user) {
      const client = supabase;
      const uploadedPaths: string[] = [];
      const cleanup = async () => {
        if (uploadedPaths.length) await client.storage.from("memory-photos").remove(uploadedPaths);
      };
      for (const file of input.photoFiles ?? []) {
        const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
        const path = `${user.id}/${memory.id}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage.from("memory-photos").upload(path, file, { contentType: file.type || "image/jpeg" });
        if (error) { await cleanup(); throw error; }
        uploadedPaths.push(path);
      }
      const { error } = await supabase.from("memories").insert({
        id: memory.id, owner_id: user.id, title: memory.title, content: memory.content,
        event_time: memory.eventTime, location_name: memory.location.name, location_city: memory.location.city,
        location_country: memory.location.country, latitude: memory.location.latitude, longitude: memory.location.longitude,
        mood: memory.mood, mood_label: memory.moodLabel, visibility: memory.visibility, tags: memory.tags,
      });
      if (error) { await cleanup(); throw error; }
      const [peopleResult, photosResult] = await Promise.all([
        memory.people.length ? supabase.from("memory_people").insert(memory.people.map((displayName) => ({ memory_id: memory.id, display_name: displayName }))) : Promise.resolve({ error: null }),
        uploadedPaths.length ? supabase.from("memory_photos").insert(uploadedPaths.map((storagePath, sortOrder) => ({ memory_id: memory.id, storage_path: storagePath, sort_order: sortOrder }))) : Promise.resolve({ error: null }),
      ]);
      if (peopleResult.error || photosResult.error) {
        await supabase.from("memories").delete().eq("id", memory.id);
        await cleanup();
        throw peopleResult.error || photosResult.error;
      }
      if (uploadedPaths.length) {
        const { data: signed } = await supabase.storage.from("memory-photos").createSignedUrls(uploadedPaths, 86400);
        memory.photos = signed?.map((photo) => photo.signedUrl).filter((url): url is string => Boolean(url)) ?? [];
      }
    }
    setMemories((current) => [memory, ...current]);
    return memory;
  }, [user]);

  const updateMemory = useCallback(async (id: string, input: NewMemoryInput) => {
    const original = memories.find((item) => item.id === id);
    if (!original) throw new Error("This memory is unavailable.");
    if (user && original.user.id !== user.id) throw new Error("Only the author can edit this memory.");
    if (input.photoFiles?.length) throw new Error("Adding photos while editing is not available yet.");
    const location = input.location ?? locations.find((item) => item.id === input.locationId) ?? original.location;
    if (supabase) {
      if (!user) throw new Error("Sign in before editing a memory.");
      const { error } = await supabase.from("memories").update({
        title: input.title, content: input.content, event_time: input.eventTime,
        location_name: location.name, location_city: location.city, location_country: location.country,
        latitude: location.latitude, longitude: location.longitude, mood: input.mood,
        visibility: input.visibility, tags: input.tags, updated_at: new Date().toISOString(),
      }).eq("id", id).eq("owner_id", user.id);
      if (error) throw error;
      const { error: peopleDeleteError } = await supabase.from("memory_people").delete().eq("memory_id", id);
      if (peopleDeleteError) throw peopleDeleteError;
      if (input.people.length) {
        const { error: peopleInsertError } = await supabase.from("memory_people").insert(input.people.map((displayName) => ({ memory_id: id, display_name: displayName })));
        if (peopleInsertError) throw peopleInsertError;
      }
    }
    setMemories((current) => current.map((item) => item.id === id ? {
      ...item, title: input.title, content: input.content, eventTime: input.eventTime,
      location, mood: input.mood, visibility: input.visibility, tags: input.tags, people: input.people,
    } : item));
  }, [memories, user]);

  const deleteMemory = useCallback(async (id: string) => {
    const original = memories.find((item) => item.id === id);
    if (!original) throw new Error("This memory is unavailable.");
    if (user && original.user.id !== user.id) throw new Error("Only the author can delete this memory.");
    if (supabase) {
      if (!user) throw new Error("Sign in before deleting a memory.");
      const { data: photos, error: photosError } = await supabase.from("memory_photos").select("storage_path").eq("memory_id", id);
      if (photosError) throw photosError;
      const { error } = await supabase.from("memories").delete().eq("id", id).eq("owner_id", user.id);
      if (error) throw error;
      const paths = photos?.map((photo) => String(photo.storage_path)) ?? [];
      if (paths.length) await supabase.storage.from("memory-photos").remove(paths);
    }
    setMemories((current) => current.filter((item) => item.id !== id));
  }, [memories, user]);

  const value = useMemo<MemoryContextValue>(() => ({
    memories,
    addMemory,
    updateMemory,
    deleteMemory,
  }), [addMemory, deleteMemory, memories, updateMemory]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const safeRegister = (tool: WebMCPTool) => {
      void Promise.resolve(modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    };

    safeRegister({
      name: "list_recent_memories",
      title: "List recent memories",
      description: "Read the most recent Memory Map entries currently visible in this prototype.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => memories.slice(0, 5).map(({ id, title, eventTime, location, mood }) => ({ id, title, eventTime, location: location.name, mood })),
    });
    safeRegister({
      name: "start_memory_creation",
      title: "Start a new memory",
      description: "Open the same New Memory editor used by the visible Add Memory button.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: () => { window.location.hash = "/new"; return { status: "ready", route: "/new" }; },
    });
    safeRegister({
      name: "create_memory",
      title: "Create memory",
      description: "Add one memory to the current in-browser prototype using the same state as the visible editor.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1 },
          content: { type: "string", minLength: 1 },
          locationId: { type: "string", enum: locations.map((item) => item.id) },
          mood: { type: "string" },
          visibility: { type: "string", enum: ["Only Me", "Friends"] },
        },
        required: ["title", "content", "locationId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        if (!input || typeof input !== "object") throw new Error("Memory details are required.");
        const data = input as Record<string, unknown>;
        if (typeof data.title !== "string" || !data.title.trim() || typeof data.content !== "string" || !data.content.trim()) throw new Error("Title and content are required.");
        if (typeof data.locationId !== "string" || !locations.some((item) => item.id === data.locationId)) throw new Error("Choose a valid Memory Map location.");
        const memory = await addMemory({
          title: data.title.trim(),
          content: data.content.trim(),
          locationId: data.locationId,
          eventTime: new Date().toISOString(),
          photos: [],
          mood: typeof data.mood === "string" ? data.mood : "😊",
          visibility: data.visibility === "Friends" ? "Friends" : "Only Me",
          tags: [],
          people: [],
        });
        return { id: memory.id, title: memory.title, status: "created" };
      },
    });

    return () => lifecycle.abort();
  }, [addMemory, memories]);

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>;
}

export function useMemories() {
  const context = useContext(MemoryContext);
  if (!context) throw new Error("useMemories must be used inside MemoryProvider");
  return context;
}
