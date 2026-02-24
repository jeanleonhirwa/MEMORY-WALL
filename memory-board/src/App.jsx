import { useState, useRef, useCallback } from 'react';
import Scene from './components/Scene';
import Toolbar from './components/ui/Toolbar';
import ItemPanel from './components/ui/ItemPanel';
import BoardSidebar from './components/ui/BoardSidebar';
import SearchOverlay from './components/ui/SearchOverlay';
import ExportMenu from './components/ui/ExportMenu';
import useKeyboard from './hooks/useKeyboard';
import useBoardStore from './store/useBoardStore';
import './App.css';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [exportOpen,  setExportOpen]  = useState(false);

  const addNote      = useBoardStore((s) => s.addNote);
  const addCode      = useBoardStore((s) => s.addCode);
  const addTask      = useBoardStore((s) => s.addTask);
  const addDecision  = useBoardStore((s) => s.addDecision);
  const addLink      = useBoardStore((s) => s.addLink);
  const addMilestone = useBoardStore((s) => s.addMilestone);
  const addList      = useBoardStore((s) => s.addList);
  const addPhoto     = useBoardStore((s) => s.addPhoto);
  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const activeBoard   = boards.find((b) => b.id === activeBoardId) || boards[0];
  const connectorMode = useBoardStore((s) => s.connectorMode);

  const fileInputRef = useRef();

  const handleAddPhoto = useCallback(() => fileInputRef.current?.click(), []);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const caption = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (ev) => addPhoto(ev.target.result, caption);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useKeyboard({
    onAddNote:      addNote,
    onAddCode:      addCode,
    onAddTask:      addTask,
    onAddDecision:  addDecision,
    onAddLink:      addLink,
    onAddMilestone: addMilestone,
    onAddList:      addList,
    onAddPhoto:     handleAddPhoto,
    onSearch:       () => setSearchOpen(true),
  });

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">⚡</span>
          <div>
            <h1 className="app-title">DevBoard</h1>
            <p className="app-subtitle">{activeBoard?.name || 'My Project'}</p>
          </div>
        </div>
        <div className="app-header-right">
          {connectorMode && (
            <div className="connector-mode-badge">🪢 Ctrl+click another item to connect — Esc to cancel</div>
          )}
          <div className="shortcut-hints">
            <span>N note</span><span>C code</span><span>T tasks</span>
            <span>D decision</span><span>M milestone</span><span>L link</span>
            <span>I list</span><span>Ctrl+Z undo</span><span>Ctrl+F search</span>
            <span>Space+drag pan</span><span>Scroll zoom</span>
          </div>
        </div>
      </header>

      {/* 3D Canvas — full screen */}
      <div className="canvas-container">
        <Scene />
      </div>

      {/* Overlays & Panels */}
      <BoardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ItemPanel />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ExportMenu open={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Bottom Toolbar */}
      <Toolbar
        onSearch={() => setSearchOpen(true)}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onExport={() => setExportOpen(true)}
      />

      {/* Hidden file input for diagram uploads */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  );
}
