import { useState } from 'react';
import useBoardStore from '../../store/useBoardStore';

const THEME_OPTIONS = [
  { value: 'cork',       label: '🪵 Cork',       color: '#8B6914' },
  { value: 'dark',       label: '🌑 Dark',        color: '#1e1e2e' },
  { value: 'blueprint',  label: '📐 Blueprint',   color: '#0d2137' },
  { value: 'whiteboard', label: '⬜ Whiteboard',  color: '#f5f5f0' },
];

export default function BoardSidebar({ open, onClose }) {
  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const addBoard      = useBoardStore((s) => s.addBoard);
  const renameBoard   = useBoardStore((s) => s.renameBoard);
  const deleteBoard   = useBoardStore((s) => s.deleteBoard);
  const switchBoard   = useBoardStore((s) => s.switchBoard);
  const setBoardTheme = useBoardStore((s) => s.setBoardTheme);
  const items         = useBoardStore((s) => s.items);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const startEdit = (board) => {
    setEditingId(board.id);
    setEditName(board.name);
  };

  const commitEdit = () => {
    if (editName.trim()) renameBoard(editingId, editName.trim());
    setEditingId(null);
  };

  const itemCount = (boardId) => items.filter((i) => i.boardId === boardId).length;

  if (!open) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">🗂️ Projects</span>
        <button className="sidebar-close" onClick={onClose}>✕</button>
      </div>

      <div className="sidebar-boards">
        {boards.map((board) => (
          <div
            key={board.id}
            className={`board-item ${board.id === activeBoardId ? 'active' : ''}`}
            onClick={() => { switchBoard(board.id); onClose(); }}
          >
            {editingId === board.id ? (
              <input
                className="board-name-input"
                value={editName}
                autoFocus
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="board-name">{board.name}</span>
            )}
            <span className="board-count">{itemCount(board.id)} items</span>
            <div className="board-actions">
              <button title="Rename" onClick={(e) => { e.stopPropagation(); startEdit(board); }}>✏️</button>
              {boards.length > 1 && (
                <button title="Delete" onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}>🗑</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="add-board-btn" onClick={() => { addBoard('New Board'); onClose(); }}>
        + New Board
      </button>

      {/* Theme picker for active board */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Board Theme</div>
        <div className="theme-grid">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.value}
              className={`theme-btn ${activeBoard?.theme === t.value ? 'active' : ''}`}
              style={{ '--theme-color': t.color }}
              onClick={() => setBoardTheme(t.value)}
              title={t.label}
            >
              <span className="theme-swatch" style={{ background: t.color }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
