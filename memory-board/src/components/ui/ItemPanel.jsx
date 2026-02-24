import { useState } from 'react';
import useBoardStore, { NOTE_COLORS, PIN_COLORS } from '../../store/useBoardStore';
import { v4 as uuidv4 } from 'uuid';

const VARIANTS = ['idea', 'todo', 'warning', 'blocker', 'done', 'note'];
const VARIANT_ICONS = { idea: '💡', todo: '📋', warning: '⚠️', blocker: '🔴', done: '✅', note: '📝' };
const STATUSES_DECISION  = ['proposed', 'decided', 'deprecated'];
const STATUSES_MILESTONE = ['on-track', 'at-risk', 'delayed', 'done'];
const LANGUAGES = ['javascript', 'typescript', 'python', 'go', 'rust', 'sql', 'bash', 'json', 'yaml', 'css', 'html'];

export default function ItemPanel() {
  const selectedId     = useBoardStore((s) => s.selectedId);
  const items          = useBoardStore((s) => s.items);
  const updateItem     = useBoardStore((s) => s.updateItem);
  const removeItem     = useBoardStore((s) => s.removeItem);
  const duplicateItem  = useBoardStore((s) => s.duplicateItem);
  const deselect       = useBoardStore((s) => s.deselect);
  const addTaskItem    = useBoardStore((s) => s.addTaskItem);
  const toggleTaskItem = useBoardStore((s) => s.toggleTaskItem);
  const removeTaskItem = useBoardStore((s) => s.removeTaskItem);
  const addListItem    = useBoardStore((s) => s.addListItem);
  const toggleListItem = useBoardStore((s) => s.toggleListItem);
  const removeListItem = useBoardStore((s) => s.removeListItem);
  const startConnector = useBoardStore((s) => s.startConnector);

  const item = items.find((i) => i.id === selectedId);
  const [newTask, setNewTask]   = useState('');
  const [newListItem, setNewListItem] = useState('');

  if (!item) return null;

  const upd = (patch) => updateItem(item.id, patch);

  const typeLabel = {
    note: '📝 Note', code: '💻 Code', task: '✅ Tasks',
    decision: '⚖️ Decision', milestone: '🚀 Milestone',
    link: '🔗 Link', list: '📋 List', section: '🏷️ Section',
    photo: '🖼️ Diagram', diagram: '🖼️ Diagram',
  }[item.type] || '📌 Item';

  return (
    <div className="item-panel">
      <div className="panel-header">
        <span className="panel-type-label">{typeLabel}</span>
        <div className="panel-header-actions">
          <button title="Duplicate" onClick={() => { duplicateItem(item.id); deselect(); }}>⧉</button>
          <button title="Connect to..." onClick={() => startConnector(item.id)}>🔀</button>
          <button className="close-btn" onClick={deselect}>✕</button>
        </div>
      </div>

      <div className="panel-body">

        {/* ── Sticky Note ── */}
        {item.type === 'note' && (
          <>
            <label className="panel-label">Variant</label>
            <div className="variant-grid">
              {VARIANTS.map((v) => (
                <button key={v} className={`variant-btn ${item.variant === v ? 'active' : ''}`} onClick={() => upd({ variant: v })} title={v}>
                  {VARIANT_ICONS[v]}
                </button>
              ))}
            </div>
            <label className="panel-label">Text</label>
            <textarea className="panel-textarea" rows={5} value={item.text || ''} onChange={(e) => upd({ text: e.target.value })} />
            <label className="panel-label">Color</label>
            <div className="color-grid">
              {NOTE_COLORS.map((c) => (
                <button key={c} className={`color-swatch ${item.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => upd({ color: c })} />
              ))}
            </div>
          </>
        )}

        {/* ── Code Card ── */}
        {item.type === 'code' && (
          <>
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} placeholder="filename or description" />
            <label className="panel-label">Language</label>
            <select className="panel-select" value={item.language || 'javascript'} onChange={(e) => upd({ language: e.target.value })}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <label className="panel-label">Code</label>
            <textarea className="panel-textarea code-textarea" rows={8} value={item.code || ''} onChange={(e) => upd({ code: e.target.value })} spellCheck={false} />
            <label className="panel-label">Tags (comma separated)</label>
            <input className="panel-input" value={(item.tags || []).join(', ')} onChange={(e) => upd({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="auth, backend, api" />
          </>
        )}

        {/* ── Task Card ── */}
        {item.type === 'task' && (
          <>
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} />
            <label className="panel-label">Tasks</label>
            <div className="task-list">
              {(item.tasks || []).map((t) => (
                <div key={t.id} className="task-row">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTaskItem(item.id, t.id)} />
                  <span className={t.done ? 'task-done' : ''}>{t.text}</span>
                  <button className="task-remove" onClick={() => removeTaskItem(item.id, t.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="task-add-row">
              <input
                className="panel-input"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add task..."
                onKeyDown={(e) => { if (e.key === 'Enter' && newTask.trim()) { addTaskItem(item.id, newTask.trim()); setNewTask(''); } }}
              />
              <button className="task-add-btn" onClick={() => { if (newTask.trim()) { addTaskItem(item.id, newTask.trim()); setNewTask(''); } }}>+</button>
            </div>
          </>
        )}

        {/* ── Decision Card ── */}
        {item.type === 'decision' && (
          <>
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} />
            <label className="panel-label">Status</label>
            <div className="status-grid">
              {STATUSES_DECISION.map((s) => (
                <button key={s} className={`status-btn ${item.status === s ? 'active' : ''}`} onClick={() => upd({ status: s })}>{s}</button>
              ))}
            </div>
            {[['problem', 'Problem'], ['options', 'Options'], ['decision', 'Decision'], ['reason', 'Reason']].map(([field, label]) => (
              <div key={field}>
                <label className="panel-label">{label}</label>
                <textarea className="panel-textarea" rows={2} value={item[field] || ''} onChange={(e) => upd({ [field]: e.target.value })} />
              </div>
            ))}
          </>
        )}

        {/* ── Milestone Card ── */}
        {item.type === 'milestone' && (
          <>
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} />
            <label className="panel-label">Target Date</label>
            <input className="panel-input" type="date" value={item.targetDate || ''} onChange={(e) => upd({ targetDate: e.target.value })} />
            <label className="panel-label">Status</label>
            <div className="status-grid">
              {STATUSES_MILESTONE.map((s) => (
                <button key={s} className={`status-btn ${item.status === s ? 'active' : ''}`} onClick={() => upd({ status: s })}>{s}</button>
              ))}
            </div>
            <label className="panel-label">Sub-tasks</label>
            <div className="task-list">
              {(item.tasks || []).map((t) => (
                <div key={t.id} className="task-row">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTaskItem(item.id, t.id)} />
                  <span className={t.done ? 'task-done' : ''}>{t.text}</span>
                  <button className="task-remove" onClick={() => removeTaskItem(item.id, t.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="task-add-row">
              <input className="panel-input" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add sub-task..."
                onKeyDown={(e) => { if (e.key === 'Enter' && newTask.trim()) { addTaskItem(item.id, newTask.trim()); setNewTask(''); } }} />
              <button className="task-add-btn" onClick={() => { if (newTask.trim()) { addTaskItem(item.id, newTask.trim()); setNewTask(''); } }}>+</button>
            </div>
          </>
        )}

        {/* ── Link Card ── */}
        {item.type === 'link' && (
          <>
            <label className="panel-label">URL</label>
            <input className="panel-input" value={item.url || ''} onChange={(e) => upd({ url: e.target.value })} placeholder="https://..." />
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} />
            <label className="panel-label">Description</label>
            <textarea className="panel-textarea" rows={2} value={item.description || ''} onChange={(e) => upd({ description: e.target.value })} />
            <label className="panel-label">Tags (comma separated)</label>
            <input className="panel-input" value={(item.tags || []).join(', ')} onChange={(e) => upd({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} placeholder="github, pr, auth" />
            {item.url && (
              <a className="open-link-btn" href={item.url} target="_blank" rel="noopener noreferrer">🔗 Open Link</a>
            )}
          </>
        )}

        {/* ── List Card ── */}
        {item.type === 'list' && (
          <>
            <label className="panel-label">Title</label>
            <input className="panel-input" value={item.title || ''} onChange={(e) => upd({ title: e.target.value })} />

            <label className="panel-label">Style</label>
            <div className="status-grid">
              {[
                { key: 'bullet',    icon: '•',  label: 'Bullet'    },
                { key: 'numbered',  icon: '1.', label: 'Numbered'  },
                { key: 'checklist', icon: '✅', label: 'Checklist' },
                { key: 'starred',   icon: '★',  label: 'Starred'   },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`status-btn ${item.variant === key ? 'active' : ''}`}
                  onClick={() => upd({ variant: key })}
                  title={label}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <label className="panel-label">Items</label>
            <div className="task-list">
              {(item.items || []).map((li) => (
                <div key={li.id} className="task-row">
                  {item.variant === 'checklist' && (
                    <input type="checkbox" checked={!!li.done} onChange={() => toggleListItem(item.id, li.id)} />
                  )}
                  <span className={li.done && item.variant === 'checklist' ? 'task-done' : ''}>{li.text}</span>
                  <button className="task-remove" onClick={() => removeListItem(item.id, li.id)}>✕</button>
                </div>
              ))}
            </div>
            <div className="task-add-row">
              <input
                className="panel-input"
                value={newListItem}
                onChange={(e) => setNewListItem(e.target.value)}
                placeholder="Add item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newListItem.trim()) {
                    addListItem(item.id, newListItem.trim());
                    setNewListItem('');
                  }
                }}
              />
              <button
                className="task-add-btn"
                onClick={() => {
                  if (newListItem.trim()) {
                    addListItem(item.id, newListItem.trim());
                    setNewListItem('');
                  }
                }}
              >+</button>
            </div>
          </>
        )}

        {/* ── Section Label ── */}
        {item.type === 'section' && (
          <>
            <label className="panel-label">Label</label>
            <input className="panel-input" value={item.label || ''} onChange={(e) => upd({ label: e.target.value })} />
            <label className="panel-label">Color</label>
            <div className="color-grid">
              {['#ffffff', '#94a3b8', '#f9e94e', '#90e0ef', '#f4a261', '#a8dadc', '#f48fb1', '#b5ead7'].map((c) => (
                <button key={c} className={`color-swatch ${item.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => upd({ color: c })} />
              ))}
            </div>
          </>
        )}

        {/* ── Diagram / Photo ── */}
        {(item.type === 'photo' || item.type === 'diagram') && (
          <>
            <label className="panel-label">Caption</label>
            <input className="panel-input" value={item.caption || ''} onChange={(e) => upd({ caption: e.target.value })} placeholder="Add a caption..." />
          </>
        )}

        {/* ── Pin color (all types) ── */}
        <label className="panel-label">Pin Color</label>
        <div className="color-grid">
          {PIN_COLORS.map((c) => (
            <button key={c} className={`color-swatch pin-swatch ${item.pinColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => upd({ pinColor: c })} />
          ))}
        </div>

        {/* ── Actions ── */}
        <button className="delete-btn" onClick={() => removeItem(item.id)}>🗑 Remove</button>
      </div>
    </div>
  );
}
