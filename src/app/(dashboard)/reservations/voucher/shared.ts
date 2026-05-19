export type VoucherProductClientContainerProps = {
  reservationId: string;
  productId?: string;
};

type ProductWithId = {
  id?: number | string;
};

export function getSelectedProductById<T extends ProductWithId>(products: T[], productId?: string) {
  if (productId) {
    const byId = products.find(({ id }) => String(id) === productId);
    if (byId) return byId;
  }

  return products[0];
}

export function hasRenderableTiptapContent(content: string | null | undefined) {
  if (!content) return false;

  const normalized = content.replace(/\u200B/g, '').trim();
  if (!normalized) return false;

  const withoutEmptyParagraph = normalized
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .trim();

  if (/<img\b/i.test(withoutEmptyParagraph)) {
    return true;
  }

  const plainText = withoutEmptyParagraph
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, '')
    .trim();

  return plainText.length > 0;
}
