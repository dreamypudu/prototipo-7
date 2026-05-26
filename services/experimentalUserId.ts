export const EXPERIMENTAL_USER_ID_STORAGE_KEY = 'compass:experimental-user-id';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuidV4 = (value: unknown): value is string =>
  typeof value === 'string' && UUID_V4_PATTERN.test(value);

export const generateExperimentalUserId = (): string => crypto.randomUUID();

export const getStoredExperimentalUserId = (): string => {
  try {
    const stored = sessionStorage.getItem(EXPERIMENTAL_USER_ID_STORAGE_KEY);
    return isUuidV4(stored) ? stored : '';
  } catch {
    return '';
  }
};

export const storeExperimentalUserId = (userId: string) => {
  if (!isUuidV4(userId)) return;
  try {
    sessionStorage.setItem(EXPERIMENTAL_USER_ID_STORAGE_KEY, userId);
  } catch {
    // sessionStorage is best effort; GameState remains the runtime source.
  }
};
