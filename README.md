# Memory Map

Memory Map is a mobile-first private diary for a small circle of friends. A memory combines time, place, photos, people, mood, and a story, then becomes browsable through Home, Timeline, Calendar, and Map.

Version 2 adds email/password and invitation-code account flows, protected routes, people attached to memories, a real MapLibre/OpenFreeMap map, current-location support, map pinning, and submit-based place search. It runs in Preview Mode without credentials and switches to Supabase authentication when environment variables are configured.

## Run locally

Requirements: Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

The default route opens the invitation-only sign-in screen. In Preview Mode, use any valid email and a password of at least eight characters. Production registration also requires a one-time invitation code.

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

## Enable Supabase cloud mode

1. Create a free Supabase project and run `supabase/migrations/001_memory_map.sql` in its SQL editor.
2. Deploy `supabase/functions/register-by-invite/index.ts` as the `register-by-invite` Edge Function.
3. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Generate a one-time code in the Supabase SQL editor with `select public.issue_invite('Friend name');`, then send the returned code privately.
5. Rebuild. The login page will show “Secure cloud mode” and use Supabase Auth.

The migration includes profiles, memories, people, photos, likes, a private Storage bucket, and Row Level Security. `Only Me` entries are readable only by their owner; `Friends` entries are readable by signed-in members. Never put the Supabase service-role key in this repository or in a `VITE_` variable.

## Map services

The interactive map uses MapLibre GL JS with the free OpenFreeMap public style. Place search uses OpenStreetMap Nominatim only after an explicit form submission; there is no autocomplete. Keep usage light, preserve attribution, cache repeated production searches, and follow the provider's current usage policy.

## Current boundary

- Preview Mode keeps newly created memories in the current browser session.
- Uploaded images use temporary browser previews until the data repository is connected to the included Supabase schema and private bucket.
- Do not share the public login URL with friends until Supabase cloud mode is configured and tested.
