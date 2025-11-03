export function getServerBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');

  return `http://localhost:${process.env.PORT ?? 3000}`;
}
