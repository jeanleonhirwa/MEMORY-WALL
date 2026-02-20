import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export const NOTE_COLORS = ['#f9e94e', '#f9c74f', '#90e0ef', '#f4a261', '#a8dadc', '#f48fb1', '#b5ead7', '#ff9aa2'];
export const PIN_COLORS  = ['#e63946', '#023e8a', '#2dc653', '#ff9f1c', '#9b5de5', '#ffffff', '#00b4d8', '#f72585'];

const BOARD_COLORS = {
  cork:       '#a07840',
  dark:       '#16161e',
  blueprint:  '#0a1f35',
  whiteboard: '#f8f7f4',
  midnight:   '#0b0d1a',
  forest:     '#1a2a1a',
  slate:      '#2a3040',
  paper:      '#f5f0e8',
  neon:       '#0a0014',
};

function randomPos() {
  return [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, 0.05];
}
function randomRot(scale = 0.15) {
  return [(Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * scale];
}
function randomPin() {
  return PIN_COLORS[Math.floor(Math.random() * 4)];
}

// ── History helpers ──────────────────────────────────────────────────────────
const MAX_HISTORY = 40;
function pushHistory(history, snapshot) {
  const next = [...history.slice(-MAX_HISTORY + 1), snapshot];
  return next;
}

const useBoardStore = create(
  persist(
    (set, get) => ({
      // ── Boards ──────────────────────────────────────────────────────────────
      boards: [{ id: 'default', name: 'My Project', theme: 'cork', createdAt: Date.now() }],
      activeBoardId: 'default',

      addBoard: (name = 'New Board') => {
        const id = uuidv4();
        set((s) => ({
          boards: [...s.boards, { id, name, theme: 'cork', createdAt: Date.now() }],
          activeBoardId: id,
        }));
      },
      renameBoard: (id, name) =>
        set((s) => ({ boards: s.boards.map((b) => (b.id === id ? { ...b, name } : b)) })),
      deleteBoard: (id) =>
        set((s) => {
          const remaining = s.boards.filter((b) => b.id !== id);
          return {
            boards: remaining.length ? remaining : [{ id: 'default', name: 'My Project', theme: 'cork', createdAt: Date.now() }],
            activeBoardId: remaining.length ? remaining[0].id : 'default',
            items: s.items.filter((i) => i.boardId !== id),
          };
        }),
      switchBoard: (id) => set({ activeBoardId: id, selectedId: null }),
      setBoardTheme: (theme) =>
        set((s) => ({
          boards: s.boards.map((b) => (b.id === s.activeBoardId ? { ...b, theme } : b)),
        })),

      // ── Items ────────────────────────────────────────────────────────────────
      items: [],
      selectedId: null,
      connectorMode: false,   // when true, next click selects connector target
      connectorSourceId: null,

      // Connectors: { id, fromId, toId, label, style, color }
      connectors: [],

      // ── History ─────────────────────────────────────────────────────────────
      _history: [],
      _future: [],

      _snapshot: () => {
        const s = get();
        return { items: s.items, connectors: s.connectors };
      },
      _saveHistory: () => {
        const s = get();
        set({ _history: pushHistory(s._history, s._snapshot()), _future: [] });
      },

      undo: () => {
        const { _history, _future, _snapshot } = get();
        if (!_history.length) return;
        const prev = _history[_history.length - 1];
        set({
          items: prev.items,
          connectors: prev.connectors,
          _history: _history.slice(0, -1),
          _future: [_snapshot(), ..._future],
          selectedId: null,
        });
      },
      redo: () => {
        const { _history, _future, _snapshot } = get();
        if (!_future.length) return;
        const next = _future[0];
        set({
          items: next.items,
          connectors: next.connectors,
          _history: [..._history, _snapshot()],
          _future: _future.slice(1),
          selectedId: null,
        });
      },

      // ── Generic item helpers ─────────────────────────────────────────────────
      _addItem: (item) => {
        get()._saveHistory();
        const boardId = get().activeBoardId;
        set((s) => ({ items: [...s.items, { ...item, boardId }] }));
      },

      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      updateItemPosition: (id, position) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, position } : i)) })),

      selectItem: (id) => set({ selectedId: id }),
      deselect: () => set({ selectedId: null, connectorMode: false, connectorSourceId: null }),

      removeItem: (id) => {
        get()._saveHistory();
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          connectors: s.connectors.filter((c) => c.fromId !== id && c.toId !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        }));
      },

      duplicateItem: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        get()._saveHistory();
        const newItem = {
          ...item,
          id: uuidv4(),
          position: [item.position[0] + 0.5, item.position[1] - 0.5, item.position[2]],
        };
        set((s) => ({ items: [...s.items, newItem] }));
      },

      bringToFront: (id) =>
        set((s) => {
          const maxZ = Math.max(...s.items.map((i) => i.position[2]), 0.05);
          return {
            items: s.items.map((i) =>
              i.id === id ? { ...i, position: [i.position[0], i.position[1], maxZ + 0.01] } : i
            ),
          };
        }),

      clearBoard: () => {
        get()._saveHistory();
        const boardId = get().activeBoardId;
        set((s) => ({
          items: s.items.filter((i) => i.boardId !== boardId),
          connectors: s.connectors.filter((c) => {
            const fromItem = s.items.find((i) => i.id === c.fromId);
            return fromItem?.boardId !== boardId;
          }),
          selectedId: null,
        }));
      },

      // ── Item type factories ──────────────────────────────────────────────────

      addNote: (text = 'Write something...', color = null, variant = 'idea') => {
        const noteColor = color || NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
        get()._addItem({
          id: uuidv4(), type: 'note',
          text, color: noteColor, variant,
          position: randomPos(), rotation: randomRot(0.2),
          pinColor: randomPin(), width: 1.5, height: 1.5,
          tags: [],
        });
      },

      addPhoto: (imageUrl, caption = '') => {
        get()._addItem({
          id: uuidv4(), type: 'photo',
          imageUrl, caption,
          position: randomPos(), rotation: randomRot(0.1),
          pinColor: randomPin(), width: 1.8, height: 2.0,
        });
      },

      addCode: (code = '// paste your code here', language = 'javascript', title = 'Snippet') => {
        get()._addItem({
          id: uuidv4(), type: 'code',
          code, language, title,
          position: randomPos(), rotation: randomRot(0.05),
          pinColor: '#2dc653', width: 2.8, height: 2.2,
          tags: [],
        });
      },

      addTask: (title = 'Task List', tasks = []) => {
        get()._addItem({
          id: uuidv4(), type: 'task',
          title,
          tasks: tasks.length ? tasks : [
            { id: uuidv4(), text: 'First task', done: false },
            { id: uuidv4(), text: 'Second task', done: false },
          ],
          position: randomPos(), rotation: randomRot(0.08),
          pinColor: '#ff9f1c', width: 2.0, height: 2.2,
          tags: [],
        });
      },

      addDecision: (title = 'Decision', problem = '', options = '', decision = '', reason = '') => {
        get()._addItem({
          id: uuidv4(), type: 'decision',
          title, problem, options, decision, reason,
          status: 'proposed', // proposed | decided | deprecated
          position: randomPos(), rotation: randomRot(0.06),
          pinColor: '#9b5de5', width: 2.4, height: 2.8,
          tags: [],
        });
      },

      addMilestone: (title = 'Milestone', targetDate = '', status = 'on-track') => {
        get()._addItem({
          id: uuidv4(), type: 'milestone',
          title, targetDate, status, // on-track | at-risk | delayed | done
          tasks: [],
          position: randomPos(), rotation: randomRot(0.06),
          pinColor: '#00b4d8', width: 2.2, height: 1.8,
          tags: [],
        });
      },

      addLink: (url = '', title = '', description = '') => {
        get()._addItem({
          id: uuidv4(), type: 'link',
          url, title: title || url, description,
          position: randomPos(), rotation: randomRot(0.08),
          pinColor: '#f72585', width: 2.0, height: 1.4,
          tags: [],
        });
      },

      addSection: (label = 'Section', color = '#ffffff') => {
        get()._addItem({
          id: uuidv4(), type: 'section',
          label, color,
          position: randomPos(), rotation: [0, 0, 0],
          pinColor: '#ffffff', width: 3.5, height: 0.7,
        });
      },

      // ── Task card helpers ────────────────────────────────────────────────────
      addTaskItem: (cardId, text) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === cardId
              ? { ...i, tasks: [...(i.tasks || []), { id: uuidv4(), text, done: false }] }
              : i
          ),
        }));
      },

      toggleTaskItem: (cardId, taskId) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === cardId
              ? { ...i, tasks: i.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
              : i
          ),
        }));
      },

      removeTaskItem: (cardId, taskId) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === cardId
              ? { ...i, tasks: i.tasks.filter((t) => t.id !== taskId) }
              : i
          ),
        }));
      },

      // ── Connectors ───────────────────────────────────────────────────────────
      startConnector: (sourceId) => set({ connectorMode: true, connectorSourceId: sourceId }),
      finishConnector: (targetId) => {
        const { connectorSourceId, connectors } = get();
        if (!connectorSourceId || connectorSourceId === targetId) {
          set({ connectorMode: false, connectorSourceId: null });
          return;
        }
        // Prevent duplicate
        const exists = connectors.find(
          (c) => (c.fromId === connectorSourceId && c.toId === targetId) ||
                 (c.fromId === targetId && c.toId === connectorSourceId)
        );
        if (!exists) {
          get()._saveHistory();
          set((s) => ({
            connectors: [...s.connectors, {
              id: uuidv4(),
              fromId: connectorSourceId,
              toId: targetId,
              label: '',
              style: 'solid',
              color: '#94a3b8',
            }],
          }));
        }
        set({ connectorMode: false, connectorSourceId: null });
      },
      removeConnector: (id) => {
        get()._saveHistory();
        set((s) => ({ connectors: s.connectors.filter((c) => c.id !== id) }));
      },
      updateConnector: (id, patch) =>
        set((s) => ({ connectors: s.connectors.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    }),
    {
      name: 'devboard-storage-v2',
      partialize: (s) => ({
        boards: s.boards,
        activeBoardId: s.activeBoardId,
        items: s.items,
        connectors: s.connectors,
      }),
    }
  )
);

export default useBoardStore;
