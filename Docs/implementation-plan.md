# Memory Board App — Implementation Plan

## Overview

A **3D interactive memory/cork board** web app built with **React + Three.js (via React Three Fiber)**. Users can pin sticky notes, photos, and text cards onto a realistic 3D cork board, drag them around, rotate them slightly, and manage them interactively.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| UI Framework | **React + Vite** | Fast, modern, component-based |
| 3D Engine | **React Three Fiber (R3F)** | Declarative Three.js in React |
| 3D Helpers | **@react-three/drei** | Shadows, text, image loaders, drag |
| Physics/Interaction | **@react-three/drei `useDrag`** | Smooth drag-and-drop in 3D space |
| Animations | **@react-spring/three** | Spring animations, hover effects |
| State Management | **Zustand** | Lightweight global state |
| Styling | **Tailwind CSS** | UI panels outside the 3D canvas |
| Persistence | **localStorage / IndexedDB** | Save board state between sessions |
| Image Upload | **Browser File API** | Upload photos as textures |

---

## Architecture

```
src/
├── App.jsx                   # Root, canvas setup
├── components/
│   ├── Board/
│   │   ├── CorkBoard.jsx     # 3D cork board mesh (textured plane)
│   │   ├── BoardFrame.jsx    # Wooden frame around the board
│   │   └── BoardLighting.jsx # Ambient + directional lights, shadows
│   ├── Items/
│   │   ├── StickyNote.jsx    # 3D sticky note (colored plane + text)
│   │   ├── PhotoCard.jsx     # 3D photo with white border (Polaroid style)
│   │   ├── TextCard.jsx      # 3D card with rich text
│   │   └── Pin.jsx           # 3D pushpin on top of each item
│   ├── UI/
│   │   ├── Toolbar.jsx       # Bottom toolbar (NOTE / PHOTO / TEXT buttons)
│   │   ├── AddNoteModal.jsx  # Modal to write note text, pick color
│   │   ├── AddPhotoModal.jsx # Modal to upload photo + caption
│   │   └── ContextMenu.jsx   # Right-click menu (Edit / Delete / Bring to front)
│   └── Scene.jsx             # Composes full 3D scene
├── store/
│   └── boardStore.js         # Zustand store for all pinned items
├── hooks/
│   ├── useDragItem.js        # Drag logic constrained to board surface
│   └── usePersistence.js     # Save/load from localStorage
├── utils/
│   ├── textureLoader.js      # Helpers for image -> Three.js texture
│   └── itemFactory.js        # Creates new item data objects
└── assets/
    ├── cork-texture.jpg
    ├── wood-texture.jpg
    └── paper-normal.jpg
```

---

## Features Breakdown

### Phase 1 — Core 3D Board
- [ ] Set up Vite + React + R3F canvas
- [ ] 3D cork board mesh with realistic cork texture and wooden frame
- [ ] Proper lighting: warm ambient light, directional with soft shadows
- [ ] Slight camera perspective (angled 3D view, not flat orthographic)
- [ ] Orbit controls (optional subtle tilt) or fixed cinematic angle

### Phase 2 — Pinned Items
- [ ] **Sticky Note**: Colored 3D plane (slightly thick box geometry), with rendered text, slight random rotation (-5° to +5°)
- [ ] **Photo Card**: Polaroid-style 3D card — white border plane + image texture + caption text below
- [ ] **Pin**: Small 3D sphere + cylinder (pushpin) on top of each item, colored (red, blue, etc.)
- [ ] Each item casts a **soft drop shadow** onto the board

### Phase 3 — Interactivity
- [ ] **Drag & Drop**: Click and drag items freely across the board surface
- [ ] **Hover effect**: Slight lift (z-axis raise) + scale-up on hover
- [ ] **Selection**: Click to select, shows highlight border
- [ ] **Context Menu** (right-click): Edit, Delete, Change color, Bring to front
- [ ] **Z-ordering**: Selected/dragged item renders on top of others

### Phase 4 — Add/Edit Items
- [ ] Bottom toolbar: `NOTE` and `PHOTO` buttons (matching reference)
- [ ] Add Note flow: click NOTE → modal opens → type text, pick color → pin appears on board
- [ ] Add Photo flow: click PHOTO → file picker → upload → Polaroid card appears on board
- [ ] Edit note: double-click → inline text edit
- [ ] Delete: right-click → Remove

### Phase 5 — 3D Visual Polish
- [ ] **Paper curl/wrinkle** normal map on notes
- [ ] **Slight random tilt** on each item (-8° to +8°) for natural look
- [ ] **Pinning animation**: item drops onto board with a spring bounce when added
- [ ] **Drag lift**: item rises slightly off board while dragging, drops back with shadow
- [ ] **Ambient occlusion** under items for depth
- [ ] Board background with subtle depth-of-field blur on far edges

### Phase 6 — Persistence & UX
- [ ] Auto-save board state to `localStorage`
- [ ] Load board state on app start
- [ ] Responsive canvas (fills viewport)
- [ ] Keyboard shortcut: `Delete` key removes selected item
- [ ] Optional: board title editable ("MEMORY WALL")

---

## Visual Design Details

| Element | Detail |
|---|---|
| Board | Cork texture plane, ~16:9 ratio, wooden frame box around it |
| Frame | Dark walnut wood texture, slightly raised |
| Sticky Notes | BoxGeometry (thin), colors: yellow, pink, blue, green |
| Photo Cards | White-bordered plane, image as texture, thin drop shadow |
| Pins | `SphereGeometry` head (red/blue/gold) + `CylinderGeometry` needle |
| Lighting | `AmbientLight` warm (#fff5e0) + `DirectionalLight` from top-left with shadows |
| Camera | Slight perspective tilt (~15° down), FOV 50, fixed or subtle auto-rotate |
| Shadows | `receiveShadow` on board, `castShadow` on all items |

---

## Implementation Steps (Ordered)

1. **Project scaffold** — `npm create vite@latest`, install R3F, drei, Zustand, Tailwind
2. **Scene setup** — Canvas, camera, lights, basic board plane
3. **Cork board** — Texture, frame, shadows
4. **Item data model** — Zustand store with item list (id, type, position, rotation, content, color)
5. **StickyNote component** — Geometry, text rendering (`drei/Text`), pin
6. **PhotoCard component** — Image texture loading, Polaroid border, caption
7. **Drag system** — `useDrag` from drei constrained to board XY plane
8. **Toolbar UI** — HTML overlay with Tailwind, NOTE/PHOTO buttons
9. **Add modals** — Note color picker + text input; photo upload
10. **Context menu** — Edit/Delete/Color/Z-order
11. **Animations** — Spring physics for drop-in, hover lift
12. **Persistence** — localStorage save/load
13. **Polish** — Normal maps, shadows, lighting tweaks, mobile touch support

---

## Key Dependencies

```json
{
  "react": "^18",
  "three": "^0.170",
  "@react-three/fiber": "^8",
  "@react-three/drei": "^9",
  "zustand": "^4",
  "tailwindcss": "^3",
  "@react-spring/three": "^9"
}
```

---

## Notes

- All 3D items use `BoxGeometry` (thin boxes) instead of planes so they have realistic thickness and cast proper shadows.
- The drag system constrains movement to the board's XY plane using raycasting against an invisible plane at the board's Z position.
- Item state (position, rotation, content, color) is serialized to JSON and stored in `localStorage` on every change.
- Images uploaded by the user are stored as base64 data URLs in localStorage for persistence.
- The camera uses a slight downward tilt (~15°) to give a 3D perspective feel without being disorienting.
