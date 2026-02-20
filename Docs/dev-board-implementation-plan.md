# 🧠 DevBoard — Implementation Plan
### A 3D Visual Workspace for Developers, Founders, Architects & Planners

> Version 2.0 — Evolved from Memory Board into a full developer/founder productivity canvas.

---

## 🎯 Vision

**DevBoard** is a 3D infinite canvas where developers, founders, system architects, and product planners can:
- Visually map out systems, features, and roadmaps
- Pin code snippets, diagrams, links, decisions, and todos
- Connect ideas with threads/arrows like a real war room board
- Track project milestones, sprints, and architecture decisions
- Work solo or collaborate with team members in real time (future)

Think: **Miro + Notion + a Cork Board + 3D depth** — purpose-built for builders.

---

## 🔍 What to KEEP from Current Implementation

| Feature | Status | Notes |
|---|---|---|
| 3D Cork Board surface | ✅ Keep | Upgrade to larger infinite-feel board |
| Draggable sticky notes | ✅ Keep | Add note types (todo, decision, idea) |
| Pinned photos | ✅ Keep | Rename to "Screenshots / Diagrams" |
| Spring animations | ✅ Keep | Feel polished |
| Zustand store | ✅ Keep | Extend with more item types |
| LocalStorage persistence | ✅ Keep | Extend to multi-board support |
| 3D thumbtack pins | ✅ Keep | Add color coding by type |

---

## 🔧 What to IMPROVE from Current Implementation

| Area | Current Problem | Improvement |
|---|---|---|
| Board size | Fixed, small board | Infinite panning canvas — scroll/pan freely |
| Camera | Fixed orbit | Free pan (no orbit rotation) + zoom in/out |
| Note content | Single text line | Multi-line text, markdown rendering |
| Item types | Only Note + Photo | 6+ item types (see below) |
| Toolbar | 2 buttons only | Full categorized toolbar with item picker |
| Item panel | Basic color picker | Rich editor per item type |
| Performance | No optimization | Instancing, LOD, lazy render |
| Z-ordering | No z control | Click to bring item to front |
| Board identity | One unnamed board | Named multi-board projects |
| Export | None | Export as PNG, JSON, Markdown |

---

## ✨ NEW Features to Add

### 1. 📌 Item Types (The Core)

| Item Type | Description | Use Case |
|---|---|---|
| **Sticky Note** | Colored note with text (existing) | Quick ideas, todos, reminders |
| **Code Snippet Card** | Dark card with syntax-highlighted code block | Pin actual code, configs, commands |
| **Link Card** | URL with auto-fetched title + favicon + preview | Pin docs, PRs, Figma links, issues |
| **Task Card** | Checklist/todo card with checkboxes | Sprint tasks, feature checklists |
| **Decision Card** | Structured card: Problem / Options / Decision | Architecture decisions (ADRs) |
| **Milestone Card** | Date-tagged card with status badge | Roadmap milestones, deadlines |
| **Diagram/Image Card** | Screenshot, wireframe, diagram (existing photo, improved) | Architecture diagrams, mockups |
| **Section Label** | Large floating label to group areas of the board | "Backend", "Q1", "Auth System" |
| **Connector Arrow** | Curved 3D thread/arrow between two items | Show relationships, data flow |

---

### 2. 🗺️ Infinite Canvas & Camera

- **Free pan**: Click + drag on empty board space to pan (no orbit rotation)
- **Zoom**: Mouse wheel zooms camera in/out smoothly
- **Mini-map**: Small overlay showing bird's-eye of the board with all items
- **Reset view**: Button to fly camera back to center
- **Fit all**: Button to zoom/pan to show all pinned items at once
- **Board coordinates**: Items placed at real x/y coordinates on the board plane
- **Grid/snap mode** (optional toggle): Snap items to an invisible grid for alignment

---

### 3. 🔗 Connector System (Key for Architects)

- Draw lines/arrows between any two items to show relationships
- Types: **Dependency**, **Data Flow**, **Reference**, **Blocks**
- Line style: solid, dashed, dotted — color coded by type
- Arrow labels (e.g., "calls", "depends on", "triggers")
- Curves that elegantly route around other items
- In 3D: lines float slightly above the board surface

---

### 4. 🧩 Code Snippet Card (Key for Developers)

```
┌─────────────────────────────────┐  📌
│ [JS]  auth.js — Token Refresh   │
│─────────────────────────────────│
│  const refresh = async () => {  │
│    const res = await api.post(  │
│      '/auth/refresh'            │
│    );                           │
│    return res.data.token;       │
│  };                             │
│─────────────────────────────────│
│  📋 Copy   🏷️ Node.js  Auth     │
└─────────────────────────────────┘
```

- Syntax highlighting (via `highlight.js` or `shiki`)
- Language selector (JS, TS, Python, Go, SQL, Bash, JSON, YAML...)
- Copy to clipboard button
- Tags/labels
- Title (filename or description)

---

### 5. ✅ Task Card (Key for Founders & PMs)

```
┌─────────────────────────────────┐  📌
│ 🔲 Sprint 3 — Auth              │
│─────────────────────────────────│
│  ✅ Design login flow           │
│  ✅ JWT implementation          │
│  🔲 Refresh token logic         │
│  🔲 OAuth Google                │
│  🔲 Password reset              │
│─────────────────────────────────│
│  3/5 done  ██████░░░░  60%      │
└─────────────────────────────────┘
```

- Add/remove checklist items inline
- Progress bar shows completion %
- Pin color changes with completion (red → yellow → green)

---

### 6. 🏛️ Decision Card / ADR (Key for Architects)

```
┌─────────────────────────────────┐  📌
│ ⚖️ DB Choice — Postgres vs Mongo│
│─────────────────────────────────│
│ STATUS: ✅ Decided              │
│─────────────────────────────────│
│ PROBLEM                         │
│ Need scalable DB for user data  │
│─────────────────────────────────│
│ OPTIONS                         │
│ • PostgreSQL (relational)       │
│ • MongoDB (document)            │
│─────────────────────────────────│
│ DECISION: PostgreSQL            │
│ REASON: Complex relations       │
└─────────────────────────────────┘
```

- Status: Proposed / Decided / Deprecated
- Structured fields: Problem, Options, Decision, Reason
- Great for Architecture Decision Records (ADRs)

---

### 7. 🚀 Milestone Card (Key for Founders)

```
┌─────────────────────────────────┐  📌
│ 🚀 MVP Launch                   │
│─────────────────────────────────│
│  📅 Target: March 15, 2025      │
│  🔴 Status: In Progress         │
│─────────────────────────────────│
│  Auth  ✅  Core API  ✅         │
│  UI    🔲  Deploy    🔲         │
└─────────────────────────────────┘
```

- Target date + status (On Track / At Risk / Delayed / Done)
- Quick sub-item checklist
- Color coded: green (on track), amber (at risk), red (delayed)

---

### 8. 🔗 Link/Reference Card

```
┌─────────────────────────────────┐  📌
│ 🔗 GitHub PR #247               │
│─────────────────────────────────│
│  Fix auth token expiry bug      │
│  github.com/org/repo/pull/247   │
│─────────────────────────────────│
│  [Open Link]  🏷️ Auth  Bug     │
└─────────────────────────────────┘
```

- Paste a URL → card auto-populates title
- Favicon + domain badge
- Tags
- Supported: GitHub PRs, Jira, Notion, Figma, Confluence, any URL

---

### 9. 🏷️ Section Labels / Zone Dividers

- Large floating text labels (e.g., "📦 Backend", "🎨 Frontend", "Q2 Goals")
- Semi-transparent colored zone backgrounds to group items visually
- These are pinned just like any other item, freely draggable

---

### 10. 🗄️ Multi-Board / Projects

- **Board list**: Named boards per project (e.g., "Auth System", "Q2 Roadmap", "App Architecture")
- Switch between boards
- Each board has: name, color tag, creation date, item count
- Delete, duplicate boards
- Export individual boards

---

### 11. 🔍 Search & Filter

- **Global search**: Search across all items on the board by content, type, tag
- **Filter by type**: Show only Tasks / only Code Snippets / only Decisions
- **Filter by tag**: Click a tag to highlight all items with that tag
- Matching items highlight, non-matching items dim

---

### 12. 📤 Export Options

| Export Type | Description |
|---|---|
| **PNG Screenshot** | Export board as a high-res flat image |
| **JSON Backup** | Download full board state as JSON |
| **Markdown** | Export all notes/decisions/tasks as `.md` |
| **Import JSON** | Restore a previously exported board |

---

### 13. ⌨️ Keyboard Shortcuts (Power User)

| Shortcut | Action |
|---|---|
| `N` | Add sticky note |
| `C` | Add code snippet |
| `T` | Add task card |
| `D` | Add decision card |
| `L` | Add link card |
| `M` | Add milestone |
| `Delete` / `Backspace` | Remove selected item |
| `Escape` | Deselect / close panel |
| `Space + drag` | Pan the board |
| `Ctrl+Z` | Undo last action |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+F` | Open search |
| `Ctrl+S` | Force save |
| `0` | Reset camera to center |
| `F` | Fit all items in view |

---

### 14. 🎨 Visual & UX Improvements

| Improvement | Detail |
|---|---|
| **Board themes** | Light cork (current), Dark slate, Blueprint (blue grid), Whiteboard |
| **Item elevation** | Hovered items lift up slightly in Z — reinforces 3D |
| **Drop shadow** | Items cast realistic shadows on the board |
| **Pin styles** | Round thumbtack, tape strip, paperclip, magnetic dot |
| **Item rotation** | Slight random tilt on spawn (feels natural), user can adjust |
| **Resize handles** | Drag corners to resize items |
| **Context menu** | Right-click item → Edit / Duplicate / Connect / Delete |
| **Undo/Redo** | Full history with Ctrl+Z / Ctrl+Y |
| **Animations** | Smooth spring when items are added/removed/selected |

---

### 15. 🔐 Auth & Sync (Phase 3 — Future)

- User accounts (GitHub OAuth / Google)
- Cloud sync of boards (Supabase / Firebase)
- Shareable board links (read-only or editable)
- Real-time collaboration (multi-cursor, presence indicators)
- Comments on items

---

## 🏗️ Technical Architecture

### Tech Stack (Revised)

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast, modern |
| 3D Engine | React Three Fiber + Three.js | Declarative 3D |
| 3D Helpers | @react-three/drei | Text, shadows, helpers |
| Animations | @react-spring/three | Spring physics |
| State | Zustand | Lightweight, scalable |
| Persistence | localStorage → IndexedDB | More storage for large boards |
| Syntax Highlight | highlight.js (lazy loaded) | Code snippet cards |
| Markdown | marked.js (lazy loaded) | Rich text in notes |
| Export | html-to-image / canvas | PNG export |
| Icons | Lucide React | Consistent, minimal icons |
| Styling | CSS Modules | Scoped, no conflicts |

### File Structure

```
src/
├── components/
│   ├── board/
│   │   ├── Scene.jsx              ← R3F Canvas, camera, lights
│   │   ├── CorkBoard.jsx          ← Board surface, infinite feel
│   │   ├── BoardCamera.jsx        ← Pan + zoom camera controller
│   │   ├── Minimap.jsx            ← 2D overlay minimap
│   │   └── ConnectorLine.jsx      ← 3D arrow/thread between items
│   ├── items/
│   │   ├── BaseItem.jsx           ← Shared: drag, select, spring, pin
│   │   ├── StickyNote.jsx         ← Text note
│   │   ├── CodeCard.jsx           ← Syntax highlighted code
│   │   ├── TaskCard.jsx           ← Checklist with progress
│   │   ├── DecisionCard.jsx       ← ADR structured card
│   │   ├── MilestoneCard.jsx      ← Date + status card
│   │   ├── LinkCard.jsx           ← URL reference card
│   │   ├── DiagramCard.jsx        ← Image/screenshot card
│   │   └── SectionLabel.jsx       ← Zone label
│   ├── ui/
│   │   ├── Toolbar.jsx            ← Bottom item picker
│   │   ├── ItemPanel.jsx          ← Right side editor
│   │   ├── BoardSidebar.jsx       ← Left: board list + search
│   │   ├── SearchOverlay.jsx      ← Ctrl+F search
│   │   ├── ContextMenu.jsx        ← Right-click menu
│   │   └── ExportMenu.jsx         ← Export options
│   └── pin/
│       ├── Pin.jsx                ← Thumbtack
│       └── PinStyles.jsx          ← Different pin types
├── store/
│   ├── useBoardStore.js           ← Items, boards state
│   ├── useUIStore.js              ← UI state (selected, panel open)
│   ├── useHistoryStore.js         ← Undo/redo stack
│   └── useConnectorStore.js       ← Connectors state
├── hooks/
│   ├── useDrag.js                 ← Shared 3D drag logic
│   ├── useKeyboard.js             ← Keyboard shortcuts
│   ├── useBoardCamera.js          ← Camera pan/zoom
│   └── useExport.js               ← Export utilities
└── utils/
    ├── colors.js                  ← Color palettes per item type
    ├── layout.js                  ← Smart placement (avoid overlap)
    └── persist.js                 ← IndexedDB persistence
```

---

## 📅 Implementation Phases

### Phase 1 — Foundation Upgrade (Priority: HIGH)
- [ ] Fix camera to pan-only (no orbit rotation)
- [ ] Implement infinite board panning
- [ ] Smooth zoom with mouse wheel
- [ ] Upgrade Zustand store for multi-item types
- [ ] Undo/Redo system
- [ ] Keyboard shortcuts foundation
- [ ] Right-click context menu

### Phase 2 — Core Item Types (Priority: HIGH)
- [ ] Code Snippet Card (syntax highlighted)
- [ ] Task Card (checklist + progress)
- [ ] Link/Reference Card
- [ ] Section Label/Zone
- [ ] Improve Sticky Note (multi-line, markdown)
- [ ] Improve Photo/Diagram Card (fix image rendering bug)

### Phase 3 — Power Features (Priority: MEDIUM)
- [ ] Decision Card (ADR)
- [ ] Milestone Card
- [ ] Connector Arrows between items
- [ ] Multi-board / project management
- [ ] Search & Filter overlay
- [ ] Minimap

### Phase 4 — UX Polish (Priority: MEDIUM)
- [ ] Board themes (dark, blueprint, whiteboard)
- [ ] Resize handles on items
- [ ] Item rotation handle
- [ ] Context menu (right-click)
- [ ] Smart placement (avoid spawning items on top of each other)
- [ ] Fit all / Reset view buttons

### Phase 5 — Export & Persistence (Priority: MEDIUM)
- [ ] PNG export (screenshot board)
- [ ] JSON export/import
- [ ] Markdown export
- [ ] IndexedDB for large board storage

### Phase 6 — Auth & Sync (Priority: LOW / Future)
- [ ] GitHub OAuth login
- [ ] Supabase backend
- [ ] Cloud board sync
- [ ] Shareable board links
- [ ] Real-time collaboration

---

## 🧠 Design Philosophy

1. **Spatial thinking** — Developers think in systems. The board is a spatial representation of their mental model. Items have position, relationships, and hierarchy.
2. **Low friction** — Adding a new item must be instant. No modal hell. One click or one keystroke.
3. **Richness without clutter** — Items look clean at a distance, reveal detail on zoom/click.
4. **Everything is an artifact** — Code, decisions, tasks, links — all treated as first-class pinnable artifacts.
5. **The board is a living document** — Not a static diagram tool. Items are editable, completable, linkable.

---

## 🔁 Naming

| Old | New |
|---|---|
| Memory Board | **DevBoard** |
| Sticky Note | **Note** |
| Photo Card | **Diagram / Screenshot** |
| (new) | **Code Snippet** |
| (new) | **Task Card** |
| (new) | **Decision** |
| (new) | **Milestone** |
| (new) | **Link** |

---

*Plan crafted: 2026-02-20*
*Target audience: Developers · Founders · Architects · Planners*
