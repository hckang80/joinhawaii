export function getServerBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getFetchUrl(path: string) {
  if (typeof window !== 'undefined') {
    return path.startsWith('/') ? path : `/${path}`;
  }

  const base = getServerBaseUrl();
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}
