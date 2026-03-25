import type { SessionExport } from './sessionExport';

const SESSION_SNAPSHOT_PREFIX = 'compass_session_snapshot_';

export const getSessionSnapshotKey = (sessionId: string) => `${SESSION_SNAPSHOT_PREFIX}${sessionId}`;

export const saveSessionSnapshot = (sessionExport: SessionExport) => {
  try {
    localStorage.setItem(
      getSessionSnapshotKey(sessionExport.session_metadata.session_id),
      JSON.stringify(sessionExport)
    );
  } catch (error) {
    console.warn('[SessionPersistence] Could not save local snapshot', error);
  }
};

export const clearSessionSnapshot = (sessionId: string) => {
  try {
    localStorage.removeItem(getSessionSnapshotKey(sessionId));
  } catch (error) {
    console.warn('[SessionPersistence] Could not clear local snapshot', error);
  }
};

export const downloadSessionSnapshot = (sessionExport: SessionExport, filename = 'session_export.json') => {
  const blob = new Blob([JSON.stringify(sessionExport, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const persistSessionExport = async (sessionExport: SessionExport, apiBaseUrl: string) => {
  const url = `${apiBaseUrl.replace(/\/$/, '')}/sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionExport),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed (${response.status})`);
  }
  return response.json();
};
