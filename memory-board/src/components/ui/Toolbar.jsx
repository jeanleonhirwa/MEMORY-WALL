import { useRef, useState } from 'react';
import useBoardStore from '../../store/useBoardStore';

const TOOLS = [
  { type: 'note',      icon: '📝', label: 'Note',      key: 'N', color: '#f9e94e' },
  { type: 'code',      icon: '💻', label: 'Code',      key: 'C', color: '#2dc653' },
  { type: 'task',      icon: '✅', label: 'Tasks',     key: 'T', color: '#ff9f1c' },
  { type: 'decision',  icon: '⚖️', label: 'Decision',  key: 'D', color: '#9b5de5' },
  { type: 'milestone', icon: '🚀', label: 'Milestone', key: 'M', color: '#00b4d8' },
  { type: 'link',      icon: '🔗', label: 'Link',      key: 'L', color: '#f72585' },
  { type: 'list',      icon: '📋', label: 'List',      key: 'I', color: '#4a90d9' },
  { type: 'section',   icon: '🏷️', label: 'Section',   key: 'S', color: '#94a3b8' },
  { type: 'diagram',   icon: '🖼️', label: 'Diagram',   key: 'P', color: '#64748b' },
];

export default function Toolbar({ onSearch, onToggleSidebar, onExport }) {
  const addNote      = useBoardStore((s) => s.addNote);
  const addCode      = useBoardStore((s) => s.addCode);
  const addTask      = useBoardStore((s) => s.addTask);
  const addDecision  = useBoardStore((s) => s.addDecision);
  const addMilestone = useBoardStore((s) => s.addMilestone);
  const addLink      = useBoardStore((s) => s.addLink);
  const addList      = useBoardStore((s) => s.addList);
  const addSection   = useBoardStore((s) => s.addSection);
  const addPhoto     = useBoardStore((s) => s.addPhoto);
  const clearBoard   = useBoardStore((s) => s.clearBoard);
  const undo         = useBoardStore((s) => s.undo);
  const redo         = useBoardStore((s) => s.redo);
  const connectorMode     = useBoardStore((s) => s.connectorMode);
  const selectedId        = useBoardStore((s) => s.selectedId);
  const startConnector    = useBoardStore((s) => s.startConnector);

  const fileInputRef = useRef();
  const [showClear, setShowClear] = useState(false);
  const [tooltip, setTooltip]     = useState(null);

  const handleAdd = (type) => {
    switch (type) {
      case 'note':      addNote(); break;
      case 'code':      addCode(); break;
      case 'task':      addTask(); break;
      case 'decision':  addDecision(); break;
      case 'milestone': addMilestone(); break;
      case 'link':      addLink(); break;
      case 'list':      addList(); break;
      case 'section':   addSection(); break;
      case 'diagram':   fileInputRef.current?.click(); break;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (ev) => addPhoto(ev.target.result, caption);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      {/* Left controls */}
      <div className="toolbar-left">
        <button className="tb-icon-btn" title="Projects (Boards)" onClick={onToggleSidebar}>🗂️</button>
        <button className="tb-icon-btn" title="Search (Ctrl+F)" onClick={onSearch}>🔍</button>
        <button className="tb-icon-btn" title="Undo (Ctrl+Z)" onClick={undo}>↩️</button>
        <button className="tb-icon-btn" title="Redo (Ctrl+Y)" onClick={redo}>↪️</button>
      </div>

      {/* Center — item type buttons */}
      <div className="toolbar-center">
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            className="tb-tool-btn"
            style={{ '--tool-color': tool.color }}
            title={`${tool.label} (${tool.key})`}
            onClick={() => handleAdd(tool.type)}
            onMouseEnter={() => setTooltip(tool)}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="tb-tool-icon">{tool.icon}</span>
            <span className="tb-tool-label">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="toolbar-right">
        {selectedId && (
          <button
            className={`tb-icon-btn connector-btn ${connectorMode ? 'active' : ''}`}
            title="Connect items (draw arrow)"
            onClick={() => startConnector(selectedId)}
          >
            🔀
          </button>
        )}
        <button className="tb-icon-btn" title="Export" onClick={onExport}>📤</button>
        {!showClear ? (
          <button className="tb-icon-btn danger" title="Clear Board" onClick={() => setShowClear(true)}>🗑️</button>
        ) : (
          <div className="confirm-clear">
            <span>Clear all?</span>
            <button className="confirm-yes" onClick={() => { clearBoard(); setShowClear(false); }}>Yes</button>
            <button className="confirm-no" onClick={() => setShowClear(false)}>No</button>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}
