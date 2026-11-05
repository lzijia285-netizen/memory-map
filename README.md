# Memory Map

Memory Map is a mobile-first private diary for a small circle of friends. A memory combines time, place, photos, people, mood, and a story, then becomes browsable through Home, Timeline, Calendar, and Map.

Version 2 adds email/password and invitation-code account flows, protected routes, people attached to memories, a real MapLibre/OpenFreeMap map, current-location support, map pinning, and submit-based place search. The hosted site is connected to the Supabase project in Seoul. Its project URL and publishable browser key are in `src/lib/supabase.ts`; no database password or secret key is stored in this repository.

## Run locally

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

The default route opens the invitation-only sign-in screen. Registration requires a one-time invitation code.

Create the production build with `pnpm build`. The static output is written to `dist/`; the relative Vite base and `HashRouter` remain compatible with static hosting.

## Pages

- `#/login` — email/password sign-in and one-time invitation registration.
- `#/home` — live greeting, daily prompt, recent memories, and monthly totals.
- `#/new` — photos, story, mood, people, time, location, tags, and visibility.
- `#/location` — OpenStreetMap search, current location, map pinning, and confirmation.
- `#/map` — real vector map, memory pins, filters, and location bottom sheet.
- `#/timeline` and `#/calendar` — two time-based views of the same memories.
- `#/friends` — group-shared memories with View and Like interactions.
- `#/profile` — account mode, totals, privacy, settings, and logout.
- `#/memory/:id` — immersive memory detail including people and privacy.

Preview content in `src/data/mockData.ts` includes eight memories, three users, five places, several months, people, and the complete `Memory` shape.

## Supabase setup

The current Supabase project has been initialized with `supabase/migrations/001_memory_map.sql` and `002_require_membership.sql`. The `register-by-invite` Edge Function is deployed with its legacy JWT toggle off; the function checks the project's publishable key and validates a one-time invite code before admitting a member.

For a fresh project, run both migrations in order, deploy `supabase/functions/register-by-invite/index.ts`, and set the function's legacy JWT toggle off after deploying the key check. Override the browser connection with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` if moving to a different project.

Create a one-time code in the Supabase SQL editor with `select public.issue_invite('Friend name');`, then give it to the intended person privately. The login page uses Supabase Auth; the database only exposes shared memories to accounts with a profile created by a consumed invitation.

The migration includes profiles, memories, people, photos, likes, a private Storage bucket, and Row Level Security. `Only Me` entries are readable only by their owner; `Friends` entries are readable by signed-in members. Never put the Supabase service-role key in this repository or in a `VITE_` variable.

## Map services

The interactive map uses MapLibre GL JS with the free OpenFreeMap public style. Place search uses OpenStreetMap Nominatim only after an explicit form submission; there is no autocomplete. Keep usage light, preserve attribution, cache repeated production searches, and follow the provider's current usage policy.

## Current boundary

- The core cloud path stores memories, people, and photos in Supabase. Selected photo previews remain local until Save finishes.
- An owner invitation and a full signed-in browser check are still needed before sharing the public URL with friends.
