import { useState, useEffect, useCallback } from 'react';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  type: 'ncbi' | 'manual' | 'aa' | 'pdb';
  label: string;
  summary: string;
  data: Record<string, unknown>;
}

const STORAGE_KEY = 'bioinformatic-toolbox-history';
const MAX_ENTRIES = 50;

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage quota exceeded or unavailable
  }
}

export function useWorkflowHistory(type: HistoryEntry['type']) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const all = loadHistory();
    setHistory(all.filter((entry) => entry.type === type));
  }, [type]);

  const addEntry = useCallback((label: string, summary: string, data: Record<string, unknown>) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      type,
      label,
      summary,
      data
    };

    const all = loadHistory();
    const updated = [entry, ...all.filter((e) => e.type !== type || e.label !== label)];
    saveHistory(updated);
    setHistory(updated.filter((e) => e.type === type));

    return entry;
  }, [type]);

  const removeEntry = useCallback((id: string) => {
    const all = loadHistory();
    const updated = all.filter((e) => e.id !== id);
    saveHistory(updated);
    setHistory(updated.filter((e) => e.type === type));
  }, [type]);

  const clearHistory = useCallback(() => {
    const all = loadHistory();
    const updated = all.filter((e) => e.type !== type);
    saveHistory(updated);
    setHistory([]);
  }, [type]);

  return { history, addEntry, removeEntry, clearHistory };
}
