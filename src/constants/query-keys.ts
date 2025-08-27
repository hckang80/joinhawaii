export const QUERY_KEYS = {
  products: {
    all: ['product', 'list'] as const,
    detail: (id: string) => ['product', id] as const,
    status: (id: string) => ['product', id, 'status'] as const
  },
  reservations: {
    all: ['reservation', 'item'] as const
  }
} as const;
