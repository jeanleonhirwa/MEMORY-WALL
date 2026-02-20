import { useState } from 'react';
import useBoardStore from '../../store/useBoardStore';

// All available themes with preview info
const THEME_LIST = [
  {
    key: 'cork',
    label: 'Cork',
    emoji: '🪵',
    desc: 'Classic warm corkboard',
    preview: 'linear-gradient(135deg, #a07840 0%, #7a5020 100%)',
    dot: '#c09050',
  },
  {
    key: 'dark',
    label: 'Dark',
    emoji: '🌑',
    desc: 'Deep dark workspace',
    preview: 'linear-gradient(135deg, #1e1e2e 0%, #0d0d18 100%)',
    dot: '#4040a0',
  },
  {
    key: 'blueprint',
    label: 'Blueprint',
    emoji: '📐',
    desc: 'Engineering grid paper',
    preview: 'linear-gradient(135deg, #0a1f35 0%, #051525 100%)',
    dot: '#1a6090',
  },
  {
    key: 'whiteboard',
    label: 'Whiteboard',
    emoji: '🗒️',
    desc: 'Clean ruled whiteboard',
    preview: 'linear-gradient(135deg, #f8f7f4 0%, #eeecea 100%)',
    dot: '#c8c0b0',
    dark: true,
  },
  {
    key: 'midnight',
    label: 'Midnight',
    emoji: '🌌',
    desc: 'Deep space dot grid',
    preview: 'linear-gradient(135deg, #0b0d1a 0%, #080a14 100%)',
    dot: '#3a3f80',
  },
  {
    key: 'forest',
    label: 'Forest',
    emoji: '🌲',
    desc: 'Dark organic workspace',
    preview: 'linear-gradient(135deg, #1a2a1a 0%, #0f1a0f 100%)',
    dot: '#2d4a2d',
  },
  {
    key: 'slate',
    label: 'Slate',
    emoji: '🪨',
    desc: 'Cool grey slate surface',
    preview: 'linear-gradient(135deg, #2a3040 0%, #1c2230 100%)',
    dot: '#3c4560',
  },
  {
    key: 'paper',
    label: 'Paper',
    emoji: '📄',
    desc: 'Warm ruled paper',
    preview: 'linear-gradient(135deg, #f5f0e8 0%, #ece7de 100%)',
    dot: '#b8a888',
    dark: true,
  },
  {
    key: 'neon',
    label: 'Neon',
    emoji: '⚡',
    desc: 'Synthwave electric grid',
    preview: 'linear-gradient(135deg, #0a0014 0%, #1a0028 100%)',
    dot: '#ff00ff',
  },
];

export default function BoardSidebar({ onClose }) {
  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activeBoard   = boards.find((b) => b.id === activeBoardId) || boards[0];
  const items         = useBoardStore((s) => s.items);

  const addBoard     = useBoardStore((s) => s.addBoard);
  const renameBoard  = useBoardStore((s) => s.renameBoard);
  const deleteBoard  = useBoardStore((s) => s.deleteBoard);
  const switchBoard  = useBoardStore((s) => s.switchBoard);
  const setBoardTheme = useBoardStore((s) => s.setBoardTheme);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');

  const currentTheme = activeBoard?.theme || 'cork';

  const startEdit = (board) => {
    setEditingId(board.id);
    setEditName(board.name);
  };
  const commitEdit = () => {
    if (editName.trim()) renameBoard(editingId, editName.trim());
    setEditingId(null);
  };

  const boardItemCount = (boardId) => items.filter((i) => i.boardId === boardId).length;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="sidebar-icon">📁</span>
          <span className="sidebar-title">Projects</span>
        </div>
        <button className="sidebar-close" onClick={onClose} title="Close">✕</button>
      </div>

      {/* Board list */}
      <div className="sidebar-boards">
        {boards.map((board) => (
          <div
            key={board.id}
            className={`board-item ${board.id === activeBoardId ? 'active' : ''}`}
            onClick={() => { switchBoard(board.id); }}
          >
            <span className="board-dot" style={{ background: THEME_LIST.find(t => t.key === board.theme)?.dot || '#888' }} />

            {editingId === board.id ? (
              <input
                className="board-name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="board-name">{board.name}</span>
            )}

            <span className="board-count">{boardItemCount(board.id)} items</span>

            <div className="board-actions" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => startEdit(board)} title="Rename">✏️</button>
              {boards.length > 1 && (
                <button onClick={() => deleteBoard(board.id)} title="Delete">🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add board */}
      <button className="add-board-btn" onClick={() => addBoard()}>
        + New Project Board
      </button>

      {/* Theme selector */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Board Theme</div>
        <div className="theme-grid">
          {THEME_LIST.map((t) => (
            <button
              key={t.key}
              className={`theme-btn ${currentTheme === t.key ? 'active' : ''}`}
              onClick={() => setBoardTheme(t.key)}
              title={t.desc}
            >
              <span
                className="theme-swatch"
                style={{ background: t.preview, border: t.dark ? '2px solid #bbb' : '2px solid rgba(255,255,255,0.18)' }}
              />
              <div className="theme-btn-text">
                <span className="theme-emoji">{t.emoji}</span>
                <span className="theme-label">{t.label}</span>
              </div>
              <span className="theme-desc">{t.desc}</span>
              {currentTheme === t.key && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
