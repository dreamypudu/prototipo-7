export const protectedPublicAsset = (path: string) => {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};
