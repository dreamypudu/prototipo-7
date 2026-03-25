const STORAGE_KEY = 'compass:developer-view-unlocked';
const DEFAULT_DEVELOPER_PASSWORD = 'compass-dev';

const getConfiguredPassword = (): string => {
  return ((import.meta as any)?.env?.VITE_DEVELOPER_VIEW_PASSWORD || DEFAULT_DEVELOPER_PASSWORD).trim();
};

export const getInitialDeveloperAccess = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const tryUnlockDeveloperAccess = (password: string): boolean => {
  const normalizedPassword = password.trim();
  const isValid = normalizedPassword.length > 0 && normalizedPassword === getConfiguredPassword();
  if (!isValid || typeof window === 'undefined') return isValid;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors; the current runtime state still unlocks the view.
  }

  return true;
};

export const clearDeveloperAccess = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
};
