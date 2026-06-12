# Linka0

**Tira la ocarina. Equipa al héroe. Derrota a los Links del pasado.**

Linka0 is a small browser game inspired by The Legend of Zelda. You draft a random
loadout for Link — sword, secondary weapon, armor, special ability, companion, boots,
mentor and bow — drawn from every era of the saga, then simulate a tournament against
the 10 most powerful Links in Hyrule's history, each duel fought in a random dungeon.

## How it plays

1. **Toca** — each "ocarina roll" deals one random item per empty slot. You get 3 rerolls.
2. **Equipa** — pick one item per roll; matching pieces can complete one of 22 **sets**
   that grant a performance bonus (stacking, capped at +35%). Once you own a piece of a
   set, the ocarina *resonates* with it: rolls for empty slots have a 35% chance of
   offering one of that set's missing pieces, so chasing sets is a real strategy.
3. **Simula** — duels are revealed one by one. Each rival is fought in a random
   dungeon whose terrain weights (fuerza / defensa / agilidad / magia) are crossed
   with both fighters' stat profiles, so the same build shines or struggles
   depending on the arena — plus ambushes and a flat 5% K.O. chance per round.
   Points decide your final verdict, from *Aldeano con Espada de Madera* to *El Elegido*.

Difficulty scales the rivals: *Explorador* is winnable with decent drafting, *Héroe*
makes you fight for the top verdicts, and *Leyenda* practically requires completed sets
(tuned via the Monte Carlo regression in `src/utils/balance.test.js`).

Finished runs can be shared: **Compartir Build** copies a URL with the build encoded in
the `?build=` query param (and the difficulty in `&dif=`); opening that link replays
the tournament with that build at that difficulty.

## Copa Online

**Copa Online** is a multiplayer knockout cup for 4 or 8 participants. The host
creates a room and shares its 5-letter code; each player who joins drafts a build on
their own device, and any empty slots are filled with CPU Links that draft by
themselves. When the last build arrives the bracket is simulated **once, server-side**
(seeded RNG, so every client renders the same result) using the same head-to-head
engine: best-of-5 duels across random dungeons with terrain affinity.

It runs on Netlify Functions + Netlify Blobs (no external services): the room API
lives in `netlify/functions/copa.mjs`, all game rules in `src/utils/copaRoom.js` and
`src/utils/versus.js`, and clients poll room state every few seconds. To exercise it
locally run `npx netlify dev` (plain `npm run dev` serves the SPA without the API).

## Tech stack

- [React 18](https://react.dev) + [Vite](https://vitejs.dev)
- [Zustand](https://zustand.docs.pmnd.rs) for game state (no router — the app switches
  between phases: `inicio → draft → simulacion → resultados`)
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev) for tests, deployed on Netlify

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # unit + data-integrity tests
npm run lint     # eslint
npm run build    # production build in dist/
```

## Project layout

```
src/
  data/        Hand-curated JSON: item pools, rival Links, dungeons, sets
  utils/       Pure game logic: ratingEngine, simulator, setEngine, shareEncoder
  stores/      Zustand game store (phases, draft, simulation trigger)
  pages/       One component per game phase
  components/  UI building blocks (cards, slots, battle log, results)
```

Game data lives in `src/data/*.json`. If you add or edit items, keep ids globally
unique and make sure set pieces reference real item ids — `npm test` enforces both.
