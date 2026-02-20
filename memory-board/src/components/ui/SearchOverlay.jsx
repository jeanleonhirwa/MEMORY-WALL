import { useState, useEffect, useRef } from 'react';
import useBoardStore from '../../store/useBoardStore';

const TYPE_ICONS = { note: '📝', code: '💻', task: '✅', decision: '⚖️', milestone: '🚀', link: '🔗', section: '🏷️', photo: '🖼️', diagram: '🖼️' };

function getItemSearchText(item) {
  switch (item.type) {
    case 'note':      return `${item.text || ''} ${(item.tags || []).join(' ')}`;
    case 'code':      return `${item.title || ''} ${item.language || ''} ${item.code || ''} ${(item.tags || []).join(' ')}`;
    case 'task':      return `${item.title || ''} ${(item.tasks || []).map((t) => t.text).join(' ')}`;
    case 'decision':  return `${item.title || ''} ${item.problem || ''} ${item.decision || ''}`;
    case 'milestone': return `${item.title || ''} ${item.targetDate || ''} ${item.status || ''}`;
    case 'link':      return `${item.title || ''} ${item.url || ''} ${item.description || ''}`;
    case 'section':   return item.label || '';
    case 'photo':
    case 'diagram':   return item.caption || '';
    default: return '';
  }
}

function getItemLabel(item) {
  switch (item.type) {
    case 'note':      return item.text?.slice(0, 40) || 'Note';
    case 'code':      return item.title || 'Code Snippet';
    case 'task':      return item.title || 'Task List';
    case 'decision':  return item.title || 'Decision';
    case 'milestone': return item.title || 'Milestone';
    case 'link':      return item.title || item.url || 'Link';
    case 'section':   return item.label || 'Section';
    case 'photo':
    case 'diagram':   return item.caption || 'Diagram';
    default: return item.type;
  }
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState('all');
  const inputRef = useRef();

  const items         = useBoardStore((s) => s.items);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const selectItem    = useBoardStore((s) => s.selectItem);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const boardItems = items.filter((i) => i.boardId === activeBoardId);
  const filtered = boardItems.filter((item) => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (!query.trim()) return true;
    return getItemSearchText(item).toLowerCase().includes(query.toLowerCase());
  });

  const types = ['all', ...new Set(boardItems.map((i) => i.type))];

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search board items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close" onClick={onClose}>✕</button>
        </div>

        {/* Type filter tabs */}
        <div className="search-filters">
          {types.map((t) => (
            <button
              key={t}
              className={`filter-tab ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? '🗂 All' : `${TYPE_ICONS[t] || ''} ${t}`}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="search-results">
          {filtered.length === 0 ? (
            <div className="search-empty">No items found</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="search-result-item"
                onClick={() => { selectItem(item.id); onClose(); }}
              >
                <span className="result-icon">{TYPE_ICONS[item.type] || '📌'}</span>
                <div className="result-content">
                  <span className="result-label">{getItemLabel(item)}</span>
                  <span className="result-type">{item.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
