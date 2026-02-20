import { useRef, useState } from 'react';
import useBoardStore from '../store/useBoardStore';

/**
 * Bottom toolbar for adding notes and photos to the board.
 */
export default function Toolbar() {
  const addNote = useBoardStore((s) => s.addNote);
  const addPhoto = useBoardStore((s) => s.addPhoto);
  const clearBoard = useBoardStore((s) => s.clearBoard);
  const fileInputRef = useRef();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleAddNote = () => {
    addNote('Write something...');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const caption = file.name.replace(/\.[^/.]+$/, '');
    addPhoto(url, caption);
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        <button className="toolbar-btn note-btn" onClick={handleAddNote}>
          <span className="btn-icon">📝</span>
          <span className="btn-label">NOTE</span>
        </button>

        <div className="toolbar-divider" />

        <button className="toolbar-btn photo-btn" onClick={handlePhotoClick}>
          <span className="btn-icon">🖼️</span>
          <span className="btn-label">PHOTO</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Clear board button */}
      {!showClearConfirm ? (
        <button className="clear-btn" onClick={() => setShowClearConfirm(true)} title="Clear Board">
          🗑
        </button>
      ) : (
        <div className="confirm-clear">
          <span>Clear all?</span>
          <button className="confirm-yes" onClick={() => { clearBoard(); setShowClearConfirm(false); }}>Yes</button>
          <button className="confirm-no" onClick={() => setShowClearConfirm(false)}>No</button>
        </div>
      )}
    </div>
  );
}
