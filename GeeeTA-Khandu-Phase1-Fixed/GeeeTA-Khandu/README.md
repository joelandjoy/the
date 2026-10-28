# GeeeTA Khandu — Phase 1 prototype

A browser-based third-person neighborhood game prototype built with Three.js + TypeScript + Vite.

## Current scope

Implemented in this starter build:
- Third-person character movement, running, jumping, camera orbit and basic collision.
- A compact stylized neighborhood with roads, buildings, a school starting point and landmark markers.
- One drivable car with acceleration, braking, reverse, steering, enter/exit, speed display and follow camera.
- Lightweight pedestrians with independent wandering behavior.
- Two enterable temple interiors, visually inspired by the supplied descriptions; interiors are fictional prototype layouts, not verified architectural surveys.
- Respectful darshan interaction at shrine points.
- Basic mission progression, minimap, pause/resume/restart and sound toggle setting.
- Desktop keyboard/mouse controls plus basic touch buttons on narrow screens.

## Important map accuracy note

The world in this first build is **illustrative placeholder geometry**, not a georeferenced reconstruction. Tanki School is used as the named starting landmark, but exact road geometry, school-ground boundaries, temple footprints, and landmark coordinates must be verified before describing the map as geographically accurate. Replace placeholder layout data in `src/world/World.ts` after collecting licensed/verified map data.

The temple interiors are inspired by the supplied reference descriptions. They are not a claim to reproduce unseen or measured floor plans.

## Requirements

- Node.js 20 or later recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Verify and production build

```bash
npm run typecheck
npm run build
npm run preview
```

The production website is generated in `dist/`.

## GitHub upload

1. Extract this ZIP.
2. Create a new empty repository on GitHub.
3. Upload the **contents** of this folder (so `package.json` is at the repository root), or use Git:

```bash
git init
git add .
git commit -m "Add GeeeTA Khandu prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Deploy on Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the GitHub repository.
3. Vercel should detect Vite. Settings are also included in `vercel.json`:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

## Controls

| Action | Keyboard / mouse |
|---|---|
| Move | W A S D |
| Run | Hold Shift |
| Jump | Space |
| Interact / enter or exit car / darshan | E |
| Rotate camera | Drag mouse |
| Pause | Escape |
| Resume | Escape or Resume button |

Touch controls appear on narrow screens. For the best first test, use a desktop browser with a keyboard and mouse.

## Feature status

- **Implemented in source:** player locomotion, camera, a basic drivable vehicle, wandering NPCs, temple interior transitions, darshan interaction, mission prompt, minimap, pause and restart.
- **Prototype-quality:** vehicle handling and collisions, pedestrian reactions, environment art, temple details, touch controls.
- **Not yet implemented:** verified OSM-derived roads, exact georeferenced landmark positions, detailed production-grade traffic AI, wanted/police system, audio assets, saving/loading, mobile joystick, detailed optimized assets.
- **Not independently confirmed in this package:** running the build on your computer and checking the visual result in your browser. Run the verification commands above after extracting.

## Project structure

```text
src/
  main.ts
  style.css
  game/
    Game.ts
    Input.ts
  world/
    World.ts
  player/
    Player.ts
  vehicles/
    Vehicle.ts
  npcs/
    NPCs.ts
  temples/
    Temples.ts
  missions/
    Missions.ts
  ui/
    UI.ts
```

## Troubleshooting

- If `npm install` fails, check your internet connection and Node.js/npm installation.
- If the browser shows a blank screen, open DevTools → Console and share the error.
- If build/typecheck fails, copy the full terminal output so the exact issue can be fixed.
