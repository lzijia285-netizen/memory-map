import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialMemories, locations, users } from "../data/mockData";
import type { Memory, Visibility } from "../types/memory";

interface NewMemoryInput {
  title: string;
  content: string;
  eventTime: string;
  locationId: string;
  photos: string[];
  mood: string;
  visibility: Visibility;
  tags: string[];
}

interface MemoryContextValue {
  memories: Memory[];
  addMemory: (input: NewMemoryInput) => Memory;
}

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState(initialMemories);

  const addMemory = useCallback((input: NewMemoryInput) => {
    const location = locations.find((item) => item.id === input.locationId) ?? locations[0];
    const memory: Memory = {
      ...input,
      id: `memory-${Date.now()}`,
      createdAt: new Date().toISOString(),
      location,
      photos: input.photos.length ? input.photos : ["./memories/south-bank-dinner.png"],
      moodLabel: "A new memory",
      user: users[0],
    };
    setMemories((current) => [memory, ...current]);
    return memory;
  }, []);

  const value = useMemo<MemoryContextValue>(() => ({
    memories,
    addMemory,
  }), [addMemory, memories]);

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
      execute: (input) => {
        if (!input || typeof input !== "object") throw new Error("Memory details are required.");
        const data = input as Record<string, unknown>;
        if (typeof data.title !== "string" || !data.title.trim() || typeof data.content !== "string" || !data.content.trim()) throw new Error("Title and content are required.");
        if (typeof data.locationId !== "string" || !locations.some((item) => item.id === data.locationId)) throw new Error("Choose a valid Memory Map location.");
        const memory = addMemory({
          title: data.title.trim(),
          content: data.content.trim(),
          locationId: data.locationId,
          eventTime: new Date().toISOString(),
          photos: [],
          mood: typeof data.mood === "string" ? data.mood : "😊",
          visibility: data.visibility === "Friends" ? "Friends" : "Only Me",
          tags: [],
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
