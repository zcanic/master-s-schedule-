# PWA Rollout Test Report

## Scope

- Project: `master-s-schedule-`
- Objective: complete PWA rollout with dual-deployment compatibility:
  - Primary target: subpath deployment `/schedule/` (self-hosted priority)
  - Secondary target: Vercel root deployment `/`

## Test Method

- Black-box: end-to-end user flows through browser UI.
- White-box: config/build artifact/service-worker/manifest verification.
- Tools:
  - Local CLI verification (`npm run typecheck`, `npm run build`, `npm test`)
  - Browser verification via chrome-devtools MCP

## Environment

- Local dev URL: `http://localhost:3000/schedule/`
- Vercel URL under test: `https://master-s-schedule-l94rj2jaw-13501500964-9681s-projects.vercel.app/`

## White-Box Test Cases

| ID | Item | Expected | Result |
|---|---|---|---|
| WB-01 | `vite.config.ts` base strategy | Base path is dynamic and defaults to `/schedule/`; Vercel uses `/` | Pass |
| WB-02 | Manifest strategy | `id/start_url/scope` follow selected base path | Pass |
| WB-03 | Workbox fallback | `navigateFallback` follows selected base path | Pass |
| WB-04 | SW registration | Client registers SW through `virtual:pwa-register` | Pass |
| WB-05 | PWA assets | `favicon`, `apple-touch-icon`, `pwa-192`, `pwa-512`, `robots` exist in `public/` | Pass |
| WB-06 | Type check | `npm run typecheck` exits 0 | Pass |
| WB-07 | Default build (`/schedule/`) | `npm run build` exits 0 and emits `sw.js`, `manifest.webmanifest` | Pass |
| WB-08 | Root build (`/`) simulation | `VERCEL=1 npm run build` exits 0 and assets resolve from `/assets/*` | Pass |
| WB-09 | Regression smoke | `npm test` exits 0 | Pass |

## Black-Box Test Cases (Local)

| ID | Flow | Expected | Result |
|---|---|---|---|
| BB-01 | Landing page load | No blank page; schedule grid visible | Pass |
| BB-02 | Course detail modal | Click course shows detail modal; close works | Pass |
| BB-03 | Week slider boundary | Can jump to week 16; grid updates | Pass |
| BB-04 | Review view | `LOAD ANALYSIS` view renders | Pass |
| BB-05 | 3D view | 3D control panel renders (EXPLODE/ALPHA/sliders) | Pass |
| BB-06 | Metro view | Graph nodes/edges render and controls available | Pass |
| BB-07 | Data editor | Editor opens/closes; list and grid render | Pass |
| BB-08 | Void Drop modal | Open/close works; upload/download response message appears | Pass |
| BB-09 | PWA runtime hooks | Manifest link present; SW registered with `/schedule/` scope in local dev | Pass |
| BB-10 | Console health | No blocking runtime errors after PWA fixes | Pass |

## Vercel Verification

- Status: pending before push; to be revalidated after deployment.
- Required checks:
  1. Root URL no longer shows white screen.
  2. `index-*.js` and `index-*.css` return 200 (no 404).
  3. `manifest.webmanifest` loads from root deployment.
  4. Service worker registers with root scope.

## Conclusion

- Local PWA rollout and regression checks pass.
- Final Vercel validation must be executed after pushing this branch to trigger auto-deploy.
