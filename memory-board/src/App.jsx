import Scene from './components/Scene';
import Toolbar from './components/Toolbar';
import ItemPanel from './components/ItemPanel';
import './App.css';

export default function App() {
  return (
    <div className="app-root">
      {/* Title */}
      <header className="app-header">
        <h1 className="app-title">📌 Memory Board</h1>
        <p className="app-subtitle">Pin your memories in 3D</p>
      </header>

      {/* 3D Scene fills full screen */}
      <div className="canvas-container">
        <Scene />
      </div>

      {/* Selected item editor panel (right side) */}
      <ItemPanel />

      {/* Bottom toolbar — add notes & photos */}
      <Toolbar />
    </div>
  );
}
