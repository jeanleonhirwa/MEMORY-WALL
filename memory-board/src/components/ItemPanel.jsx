import { useState } from 'react';
import useBoardStore, { DEFAULT_NOTE_COLORS } from '../store/useBoardStore';

const PIN_COLORS = ['#e63946', '#023e8a', '#2dc653', '#ff9f1c', '#9b5de5', '#ffffff'];

/**
 * Side panel that appears when a board item is selected.
 * Allows editing text, colors, captions, and removing the item.
 */
export default function ItemPanel() {
  const selectedId = useBoardStore((s) => s.selectedId);
  const items = useBoardStore((s) => s.items);
  const updateNoteText = useBoardStore((s) => s.updateNoteText);
  const updateNoteColor = useBoardStore((s) => s.updateNoteColor);
  const updateCaption = useBoardStore((s) => s.updateCaption);
  const updatePinColor = useBoardStore((s) => s.updatePinColor);
  const removeItem = useBoardStore((s) => s.removeItem);
  const deselect = useBoardStore((s) => s.deselect);

  const item = items.find((i) => i.id === selectedId);
  if (!item) return null;

  return (
    <div className="item-panel">
      <div className="panel-header">
        <span>{item.type === 'note' ? '📝 Note' : '🖼️ Photo'}</span>
        <button className="close-btn" onClick={deselect}>✕</button>
      </div>

      {item.type === 'note' && (
        <>
          <label className="panel-label">Text</label>
          <textarea
            className="panel-textarea"
            value={item.text}
            onChange={(e) => updateNoteText(item.id, e.target.value)}
            rows={4}
          />

          <label className="panel-label">Note Color</label>
          <div className="color-grid">
            {DEFAULT_NOTE_COLORS.map((c) => (
              <button
                key={c}
                className={`color-swatch ${item.color === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => updateNoteColor(item.id, c)}
              />
            ))}
          </div>
        </>
      )}

      {item.type === 'photo' && (
        <>
          <label className="panel-label">Caption</label>
          <input
            className="panel-input"
            value={item.caption || ''}
            onChange={(e) => updateCaption(item.id, e.target.value)}
            placeholder="Add a caption..."
          />
        </>
      )}

      <label className="panel-label">Pin Color</label>
      <div className="color-grid">
        {PIN_COLORS.map((c) => (
          <button
            key={c}
            className={`color-swatch pin-swatch ${item.pinColor === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => updatePinColor(item.id, c)}
          />
        ))}
      </div>

      <button
        className="delete-btn"
        onClick={() => removeItem(item.id)}
      >
        🗑 Remove
      </button>
    </div>
  );
}
