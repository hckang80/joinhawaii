export function getServerBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT ?? 3000}`;
}
