---
version: alpha
name: "Scalp City"
description: "A cinematic three-dimensional autonomous trading research room where product controls are embedded into a neon physical workstation."
colors:
  ink: "#03020A"
  obsidian: "#070611"
  screen: "#050715"
  violet: "#6F37FF"
  magenta: "#FF2DCE"
  cyan: "#27D7FF"
  green: "#35FFA7"
  red: "#FF315F"
  gold: "#FFD35A"
  text: "#F2EDFF"
  muted: "#8F89A8"
typography:
  display:
    fontFamily: "Haettenschweiler, 'Arial Narrow Bold', 'Arial Narrow', sans-serif"
  sans:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  DEFAULT: "0.3125rem"
  sm: "0.1875rem"
  md: "0.375rem"
  lg: "0.5rem"
spacing:
  scene-gutter: "4vw"
  monitor-gap: "1.25vw"
components:
  monitor: {}
  console-key: {}
  dialog: {}
  status-beacon: {}
---

# Scalp City Design System

## Overview

### Creative North Star
Scalp City is a cinematic 3D neon trading room viewed from inside the operator floor: dark purple-black skyline, lit windows, glossy floor grid, physical angled monitors, magenta/cyan/gold practical lighting, a robot at a curved operator desk, and concentric floor rings. The interface should feel like a place the user occupies rather than a dashboard composited on top of a wallpaper.

### Product context and register
- **Audience and primary job:** a single operator runs and watches autonomous strategy research on phone or desktop, inspects QQQ/SPY/IWM, imports data, and saves accumulated knowledge.
- **Target market(s) and evidence:** general English-language personal research tool; no market-specific rules are inferred.
- **Locale(s) and language policy:** English UI, numeric/data labels kept concise.
- **Usage scene:** especially iPhone portrait, full-screen and visually immersive; dense live telemetry must remain legible without scrolling the main scene.
- **Register:** hybrid product/experience. Core actions remain familiar, but the shell is strongly spatial and cinematic.
- **Memorable signature:** a real WebGL research floor with the operator console and robot physically occupying the lower scene while DOM monitors align with the 3D monitor bank.
- **Restraint:** charts, log text, forms and session-saving states stay utilitarian and quiet.
- **Anti-references:** generic SaaS dashboards, rounded glass cards, floating app navigation, flat neon wallpaper, and marketing-site hero layouts.
- **Token ownership/runtime mapping:** this file mirrors the canonical values implemented as CSS variables in `styles.css`; 3D emissive colors in `scene3d.js` use the same values.

## Colors
The base world is near-black `ink`/`obsidian`. Violet and magenta create environmental depth; cyan and green communicate data/state; gold marks physical hardware and emphasis; red is reserved for stop/error. Monitor surfaces remain nearly black so charts carry contrast. Focus uses cyan. There is no light theme because the scene identity depends on practical emissive lighting.

## Typography
Display signage uses a condensed industrial fallback stack. Interface copy uses the system sans stack. Charts, telemetry, logs and control legends use the mono stack. Uppercase is reserved for hardware labels and scene signage, not prose.

## Layout
The primary document is one visual viewport with safe-area-aware top signage, a three-monitor market bank, a central six-monitor wall, a lower operator console and a bottom telemetry rail. The main scene itself does not scroll; modal terminals own their internal scrolling. Mobile portrait is the primary composition, with side monitors angled inward and the central monitor closest to the camera.

## Elevation & Depth
Depth comes from the WebGL camera, fog, floor reflections, 3D monitor frames, physical desk/robot geometry and restrained monitor perspective. DOM monitor shadows reinforce physical bezels but must not become card elevation. Blur is limited to modal backdrops and atmospheric bloom.

## Shapes
Hardware is mostly squared with small radii and occasional clipped trapezoids; avoid pill-heavy UI. Circular geometry is reserved for physical controls, robot parts and floor rings.

## Components
### Foundational visual states
Interactive controls have explicit hover, focus-visible, pressed and disabled states. Busy state must preserve dimensions. Green indicates active/success, red stop/error, cyan focus/data, gold emphasis.

### Buttons and actions
RUN, DATA, MEM and EXIT are physical console keys, not navigation cards. STOP and SYNC are round hardware controls. EXIT remains disabled until a session exists.

### Navigation and data display
There is no conventional tab bar. Ticker monitors are real buttons that switch the main chart. Telemetry stays in the bottom rail. Charts keep semantic text labels outside the canvas where needed.

### Forms and overlays
Data and GitHub configuration use app-owned terminal dialogs with bounded viewport height, Escape dismissal and focus restoration through native `<dialog>`. Native select behavior is intentionally accepted inside the utility terminal. Secret input is masked by default and has a show/hide action.

### Iconography
Use minimal symbols only where they communicate hardware or state. Text labels remain mandatory on all controls.

### Motion
Motion is slow camera parallax, robot idle movement, floor-ring motion and subtle live-light pulsing. Nothing bounces. `prefers-reduced-motion` removes decorative motion while preserving interaction state.

### Content and data visualization
Voice is terse and operational. Charts use green/red candles, gold VWAP and cyan EMA. Numeric telemetry uses tabular mono styling.

## Do's and Don'ts
- **Do:** preserve the feeling of being inside a physical command room.
- **Do:** keep functional IDs and actions stable while moving their presentation into the scene.
- **Don't:** reintroduce floating rounded dashboard cards or a mobile bottom-nav aesthetic.
- **Don't:** use glow as a substitute for depth; depth should come from geometry, lighting and perspective.
