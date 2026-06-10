# Linka0

**Tira la ocarina. Equipa al héroe. Derrota a los Links del pasado.**

Linka0 is a small browser game inspired by The Legend of Zelda. You draft a random
loadout for Link — sword, secondary weapon, armor, special ability, companion, boots,
mentor and bow — drawn from every era of the saga, then simulate a tournament against
the 10 most powerful Links in Hyrule's history, each duel fought in a random dungeon.

## How it plays

1. **Toca** — each "ocarina roll" deals one random item per empty slot. You get 3 rerolls.
2. **Equipa** — pick one item per roll; matching pieces from the same era can complete
   one of 22 **sets** that grant a rating bonus (stacking, capped at +35%).
3. **Simula** — your build's weighted rating faces each rival Link across random
   dungeons with terrain modifiers, ambushes and a flat 5% K.O. chance per round.
   Points decide your final verdict, from *Aldeano con Espada de Madera* to *El Elegido*.

Finished runs can be shared: **Compartir Build** copies a URL with the build encoded in
the `?build=` query param, and opening that link replays the tournament with that build.

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
