# Are We Alone? A Fermi Paradox Explorer

An interactive site for experimenting with the Drake equation, based on
[Sandberg, Drexler & Ord, "Dissolving the Fermi Paradox" (2018)](https://arxiv.org/abs/1806.02404).

- **Paper mode** treats each factor as an uncertainty range (log-uniform), models the
  fraction of planets with life as `f_l = 1 − e^(−λVt)` with a log-normal abiogenesis rate, and runs
  a 200,000-sample Monte Carlo simulation in a Web Worker. With the paper's defaults it reproduces
  the headline results: P(N < 1) ≈ 52%, P(N < 10⁻¹⁰) ≈ 38%, median N ≈ 0.3, mean N ≈ 27 million.
- **Classic mode** multiplies single point estimates (the geometric midpoints of the paper's ranges)
  and reports P(at least one other civilization) = 1 − e^(−N).

The animated Three.js galaxy behind the page lights one beacon per expected civilization (median N
in paper mode), capped at 600.

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev      # http://localhost:5173
bun test         # model tests, including a check against the paper's results
bun run build    # static output in dist/
bun run lint
```

## Deploy (Cloudflare)

The site is fully static and hosted on Cloudflare Pages (project `fermi-paradox`, configured in
`wrangler.jsonc`). Live at https://fermi.vorga.org (also https://fermi-paradox.pages.dev).

```bash
bunx wrangler login   # once per machine
bun run deploy        # tests, builds, and deploys dist/ to the production branch
```

DNS for `vorga.org` stays at DigitalOcean: `fermi.vorga.org` is a CNAME to
`fermi-paradox.pages.dev`, and Cloudflare issues the HTTPS certificate. Pages custom domains work
with external DNS, but Workers custom domains do not, which is why this uses Pages.

## Docker

```bash
docker compose up --build -d   # http://localhost:8080
```

The image is a multi-stage build: `oven/bun` installs, tests and builds the app, then `nginx:alpine`
serves the static files from `dist/`.

## Project layout

- `src/model/` – samplers, Drake parameters and defaults, classic and Monte Carlo calculations
- `src/workers/` – Web Worker running the simulation, plus a debounced client
- `src/components/` – sliders, panels, histogram, and the Three.js galaxy scene
- `src/store.ts` – app state (zustand)
