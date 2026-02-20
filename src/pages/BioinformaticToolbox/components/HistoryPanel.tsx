import type { HistoryEntry } from '../hooks/useWorkflowHistory';
import styles from '../BioinformaticToolbox.module.css';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onRemove, onClear }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <article className={styles.workflowCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>History</h3>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onClear}
          style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
        >
          Clear All
        </button>
      </div>
      <ul className={styles.historyList}>
        {history.map((entry) => (
          <li key={entry.id} className={styles.historyItem}>
            <button
              type="button"
              className={styles.historyButton}
              onClick={() => onSelect(entry)}
            >
              <span className={styles.historyLabel}>{entry.label}</span>
              <span className={styles.historySummary}>{entry.summary}</span>
              <span className={styles.historyDate}>{formatDate(entry.timestamp)}</span>
            </button>
            <button
              type="button"
              className={styles.historyRemove}
              onClick={() => onRemove(entry.id)}
              aria-label="Remove from history"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default HistoryPanel;
