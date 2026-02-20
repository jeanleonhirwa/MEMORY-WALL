import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_NOTE_COLORS = ['#f9e94e', '#f9c74f', '#90e0ef', '#f4a261', '#a8dadc', '#f48fb1'];

const useBoardStore = create(
  persist(
    (set, get) => ({
      items: [],
      selectedId: null,
      boardColor: '#8B6914',

      // Add a new sticky note
      addNote: (text = 'New Note', color = null) => {
        const noteColor = color || DEFAULT_NOTE_COLORS[Math.floor(Math.random() * DEFAULT_NOTE_COLORS.length)];
        const x = (Math.random() - 0.5) * 6;
        const y = (Math.random() - 0.5) * 3;
        set((state) => ({
          items: [
            ...state.items,
            {
              id: uuidv4(),
              type: 'note',
              text,
              color: noteColor,
              position: [x, y, 0.05],
              rotation: [(Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.2],
              pinColor: Math.random() > 0.5 ? '#e63946' : '#023e8a',
              fontSize: 0.18,
              width: 1.2,
              height: 1.2,
            },
          ],
        }));
      },

      // Add a photo card
      addPhoto: (imageUrl, caption = '') => {
        const x = (Math.random() - 0.5) * 6;
        const y = (Math.random() - 0.5) * 3;
        set((state) => ({
          items: [
            ...state.items,
            {
              id: uuidv4(),
              type: 'photo',
              imageUrl,
              caption,
              position: [x, y, 0.05],
              rotation: [(Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.15],
              pinColor: Math.random() > 0.5 ? '#e63946' : '#023e8a',
              width: 1.4,
              height: 1.6,
            },
          ],
        }));
      },

      // Update item position
      updateItemPosition: (id, position) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, position } : item
          ),
        }));
      },

      // Update item rotation
      updateItemRotation: (id, rotation) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, rotation } : item
          ),
        }));
      },

      // Update note text
      updateNoteText: (id, text) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, text } : item
          ),
        }));
      },

      // Update note color
      updateNoteColor: (id, color) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, color } : item
          ),
        }));
      },

      // Update photo caption
      updateCaption: (id, caption) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, caption } : item
          ),
        }));
      },

      // Update pin color
      updatePinColor: (id, pinColor) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, pinColor } : item
          ),
        }));
      },

      // Select an item
      selectItem: (id) => set({ selectedId: id }),

      // Deselect
      deselect: () => set({ selectedId: null }),

      // Remove an item
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        }));
      },

      // Bring item to front (increase z)
      bringToFront: (id) => {
        set((state) => {
          const maxZ = Math.max(...state.items.map((i) => i.position[2]), 0.05);
          return {
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, position: [item.position[0], item.position[1], maxZ + 0.01] }
                : item
            ),
          };
        });
      },

      // Clear the board
      clearBoard: () => set({ items: [], selectedId: null }),

      // Change board color
      setBoardColor: (color) => set({ boardColor: color }),
    }),
    {
      name: 'memory-board-storage',
    }
  )
);

export default useBoardStore;
export { DEFAULT_NOTE_COLORS };
