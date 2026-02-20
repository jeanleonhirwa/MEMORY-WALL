import useBoardStore from '../../store/useBoardStore';

function getItemMarkdown(item) {
  switch (item.type) {
    case 'note':
      return `## 📝 Note (${item.variant || 'note'})\n\n${item.text || ''}\n`;
    case 'code':
      return `## 💻 ${item.title || 'Code Snippet'}\n\n\`\`\`${item.language || ''}\n${item.code || ''}\n\`\`\`\n`;
    case 'task':
      return `## ✅ ${item.title || 'Tasks'}\n\n${(item.tasks || []).map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}\n`;
    case 'decision':
      return `## ⚖️ ${item.title || 'Decision'}\n\n**Status:** ${item.status}\n\n**Problem:** ${item.problem}\n\n**Options:** ${item.options}\n\n**Decision:** ${item.decision}\n\n**Reason:** ${item.reason}\n`;
    case 'milestone':
      return `## 🚀 ${item.title || 'Milestone'}\n\n**Target:** ${item.targetDate || 'TBD'}  **Status:** ${item.status}\n\n${(item.tasks || []).map((t) => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}\n`;
    case 'link':
      return `## 🔗 ${item.title || 'Link'}\n\n${item.url}\n\n${item.description || ''}\n`;
    case 'section':
      return `---\n\n# 🏷️ ${item.label}\n\n---\n`;
    default:
      return '';
  }
}

export default function ExportMenu({ open, onClose }) {
  const items         = useBoardStore((s) => s.items);
  const boards        = useBoardStore((s) => s.boards);
  const activeBoardId = useBoardStore((s) => s.activeBoardId);
  const connectors    = useBoardStore((s) => s.connectors);

  if (!open) return null;

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const boardItems  = items.filter((i) => i.boardId === activeBoardId);

  const exportJSON = () => {
    const data = {
      board: activeBoard,
      items: boardItems,
      connectors: connectors.filter((c) => boardItems.find((i) => i.id === c.fromId)),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeBoard?.name || 'devboard'}.json`; a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const exportMarkdown = () => {
    const md = [
      `# ${activeBoard?.name || 'DevBoard'}\n`,
      `> Exported ${new Date().toLocaleDateString()}\n`,
      ...boardItems.map(getItemMarkdown),
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeBoard?.name || 'devboard'}.md`; a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          // Import items into current board
          useBoardStore.setState((s) => ({
            items: [
              ...s.items,
              ...(data.items || []).map((item) => ({ ...item, boardId: s.activeBoardId })),
            ],
          }));
          onClose();
        } catch { alert('Invalid JSON file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-menu" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <span>📤 Export / Import</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="export-options">
          <button className="export-btn" onClick={exportJSON}>
            <span className="export-icon">📋</span>
            <div>
              <div className="export-btn-title">Export JSON</div>
              <div className="export-btn-desc">Full board backup — items, connectors, positions</div>
            </div>
          </button>
          <button className="export-btn" onClick={exportMarkdown}>
            <span className="export-icon">📄</span>
            <div>
              <div className="export-btn-title">Export Markdown</div>
              <div className="export-btn-desc">All notes, code, decisions as .md file</div>
            </div>
          </button>
          <button className="export-btn" onClick={importJSON}>
            <span className="export-icon">📥</span>
            <div>
              <div className="export-btn-title">Import JSON</div>
              <div className="export-btn-desc">Load a previously exported board</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
