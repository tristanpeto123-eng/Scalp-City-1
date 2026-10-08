# Scalp City — TRUE 3D V5

Actual WebGL research room: physical monitor meshes, robot operator, curved workstation, room shell, city depth, lighting/shadows and parallax.

# Scalp City V1 — True 3D Research Floor

This build replaces the flat/CSS dashboard composition with a real Three.js environment.

## What changed
- Physical 3D monitor meshes with thickness, mounting hardware and angled perspective.
- Live QQQ/SPY/IWM and core chart canvases are mapped onto the 3D screens as textures.
- Robot is seated with its back to the camera, facing the workstation.
- Physical desk, console keys, STOP/SYNC controls, floor rings, skyline, fog, shadows and practical neon lighting.
- Tap the 3D ticker screens to change the core chart.
- Tap the 3D console hardware to run training, import data, open GitHub memory, checkpoint, stop, or save/exit.
- Drag anywhere in the scene to shift the camera perspective.
- Existing training workers, CSV import, IndexedDB session saves and GitHub memory logic are retained.
- Service worker cache bumped and HTML/JS/CSS now use network-first updates to reduce stale GitHub Pages builds.

## Deploy
Upload the **contents** of this folder to the root of the GitHub Pages repository. Keep the files flat at the root so `index.html`, `app.js`, `scene3d.js`, `training-worker.js`, `styles.css` and the manifest are siblings.

The 3D engine is loaded as an ES module from jsDelivr (`three@0.170.0`), so first load requires internet access.
