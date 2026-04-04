const PROTECTED_PUBLIC_BASE = '/_protected/public';

export const protectedPublicAsset = (path: string) => {
  if (!path) return PROTECTED_PUBLIC_BASE;
  return `${PROTECTED_PUBLIC_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};
