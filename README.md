# Memory Map

Memory Map is a mobile-first private diary prototype for a small circle of friends. A memory combines a time, place, photo, mood, and story, then becomes browsable through a home feed, timeline, calendar, and visual map.

This first stage is intentionally front-end only. Authentication, persistence, uploads, and real map tiles are represented by polished local interactions and mock data so the product can be evaluated before back-end work begins.

## Run locally

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite. The default route opens the signed-in prototype; the login screen is available at `#/login`.

Create a production build with:

```bash
pnpm build
```

The static site is written to `dist/`. The Vite base is relative and the app uses `HashRouter`, so the same build is compatible with static hosts such as GitHub Pages.

## Prototype pages

- `#/login` — email invitation entry; Continue opens the prototype.
- `#/home` — daily prompt, recent memories, and monthly snapshot.
- `#/new` — photo, story, mood, time, place, tags, and visibility editor.
- `#/location` — searchable mock location picker with a reusable map surface.
- `#/map` — memory pins and a touch-friendly location bottom sheet.
- `#/timeline` — memories grouped into an editorial life timeline.
- `#/calendar` — monthly view with memory days and a selected-day drawer.
- `#/friends` — shared memories with View and Like interactions only.
- `#/profile` — personal totals, annual review, privacy, and settings states.
- `#/memory/:id` — immersive detail view for any mock memory.

Mock content lives in `src/data/mockData.ts`. It includes eight memories, three users, five places, several months, and the complete `Memory` data shape.

## Project structure

```text
src/
  components/
    layout/
    map/
    memory/
    navigation/
  context/
  data/
  pages/
  types/
  App.tsx
  main.tsx
  styles.css
public/
  memories/
  favicon.svg
```

The `MemoryProvider` owns the current in-browser memory list and the create action. All views consume that same state, which keeps the prototype behavior close to the eventual data flow without introducing a server.

## Connecting Supabase later

1. Create Supabase tables for `profiles`, `memories`, `memory_photos`, `locations`, `tags`, and friend-sharing relationships.
2. Replace `src/data/mockData.ts` reads with a small data service that maps Supabase rows to the existing `Memory`, `User`, and `Location` types.
3. Replace the `MemoryProvider.addMemory` implementation with an insert plus optimistic local update. The page components can remain unchanged.
4. Add Supabase Auth magic-link email login to `Login.tsx`, then protect the app routes while keeping `#/login` public.
5. Store photo objects in Supabase Storage or Cloudflare R2 and save their public or signed URLs in `memory_photos`.
6. Add Row Level Security before inviting friends: memories should default to owner-only, and shared memories should be readable only by explicitly allowed friends.

## Connecting MapLibre later

`src/components/map/MemoryMap.tsx` is the isolated mock map boundary. Replace its internal SVG map with a MapLibre map while preserving its public props:

- `selectedId` controls the active location.
- `onSelect(id)` opens the same bottom sheet or confirms a picker location.
- `picker` switches to the simplified location-selection presentation.

Convert the existing mock coordinates into GeoJSON features and render clustered points for zoomed-out views. Keep the current buttons and bottom sheet outside the MapLibre canvas so navigation, accessibility, and mobile touch behavior remain stable.

## Notes

- Uploaded images are previewed with temporary browser object URLs and are not persisted.
- Saving a memory updates React state for the current session only.
- The map is deliberately a lightweight placeholder; no Google Maps or MapLibre network requests are made.
- The included lifestyle images were generated specifically for this prototype and are stored locally under `public/memories/`.
