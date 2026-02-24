import { useEffect } from 'react';
import useBoardStore from '../store/useBoardStore';

/**
 * Global keyboard shortcut handler for DevBoard.
 */
export default function useKeyboard({ onAddNote, onAddCode, onAddTask, onAddDecision, onAddLink, onAddMilestone, onAddPhoto, onAddList, onSearch, onFitAll }) {
  const selectedId = useBoardStore((s) => s.selectedId);
  const removeItem = useBoardStore((s) => s.removeItem);
  const deselect   = useBoardStore((s) => s.deselect);
  const undo       = useBoardStore((s) => s.undo);
  const redo       = useBoardStore((s) => s.redo);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
      const isMeta = e.ctrlKey || e.metaKey;

      // Always allow Ctrl+Z / Ctrl+Y even in inputs? No — skip in inputs
      if (isInput && !isMeta) return;

      if (isMeta) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
            return;
          case 'y':
            e.preventDefault();
            redo();
            return;
          case 'f':
            e.preventDefault();
            onSearch?.();
            return;
        }
        return;
      }

      if (isInput) return; // Don't trigger letter shortcuts in inputs

      switch (e.key.toLowerCase()) {
        case 'n': onAddNote?.(); break;
        case 'c': onAddCode?.(); break;
        case 't': onAddTask?.(); break;
        case 'd': onAddDecision?.(); break;
        case 'l': onAddLink?.(); break;
        case 'm': onAddMilestone?.(); break;
        case 'i': onAddList?.(); break;
        case 'p': onAddPhoto?.(); break;
        case 'f': onFitAll?.(); break;
        case 'escape':
          deselect();
          break;
        case 'delete':
        case 'backspace':
          if (selectedId) removeItem(selectedId);
          break;
        default: break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, removeItem, deselect, undo, redo, onAddNote, onAddCode, onAddTask, onAddDecision, onAddLink, onAddMilestone, onAddPhoto, onAddList, onSearch, onFitAll]);
}
