import type { CartItem, Product, ProductSelection } from "../types/product";

export function selectionFor(
  product: Product,
  selection: ProductSelection = {},
): ProductSelection {
  return {
    unitId:
      product.units?.find((unit) => unit.id === selection.unitId)?.id ??
      product.units?.[0]?.id,
    colorId:
      product.colors?.find((color) => color.id === selection.colorId)?.id ??
      product.colors?.[0]?.id,
  };
}
export function cartKey(item: ProductSelection & { productId: string }) {
  return [item.productId, item.unitId ?? "", item.colorId ?? ""].join(":");
}
export function selectedProduct(product: Product, selection: ProductSelection = {}) {
  const options = selectionFor(product, selection);
  const unit = product.units?.find((value) => value.id === options.unitId);
  const color = product.colors?.find((value) => value.id === options.colorId);
  return {
    ...product,
    price: unit?.price ?? product.price,
    oldPrice: unit ? unit.oldPrice : product.oldPrice,
    image: color?.image ?? product.image,
    pack: [unit?.label ?? product.pack, color?.label].filter(Boolean).join(" · "),
    count: unit?.count ?? 1,
  };
}
// Spreadsheet stock is a total of individual pens shared by all colors and units.
export function maxCartQuantity(
  product: Product,
  items: CartItem[],
  selection: ProductSelection = {},
) {
  if (product.stock === undefined) {
    return 999;
  }

  const options = selectionFor(product, selection);
  const key = cartKey({ productId: product.id, ...options });
  const usedElsewhere = items
    .filter((item) => item.productId === product.id && cartKey(item) !== key)
    .reduce(
      (sum, item) => sum + selectedProduct(product, item).count * item.quantity,
      0,
    );
  const remaining = product.stock - usedElsewhere;
  const unitSize = selectedProduct(product, options).count;
  const maximum = Math.floor(remaining / unitSize);

  return Math.max(0, Math.min(999, maximum));
}
export function putCartItem(
  items: CartItem[],
  product: Product,
  quantity: number,
  selection: ProductSelection = {},
  add = false,
) {
  const options = selectionFor(product, selection);
  const candidate = { productId: product.id, ...options, quantity: 1 };
  const key = cartKey(candidate);
  const existing = items.find((item) => cartKey(item) === key);
  const amount = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
  candidate.quantity = Math.min(
    maxCartQuantity(product, items, options),
    amount + (add ? (existing?.quantity ?? 0) : 0),
  );
  if (candidate.quantity <= 0) return items;
  return existing
    ? items.map((item) => (cartKey(item) === key ? candidate : item))
    : [...items, candidate];
}
export function normalizeCart(saved: unknown, products: Product[]): CartItem[] {
  if (!Array.isArray(saved)) return [];
  let result: CartItem[] = [];
  for (const item of saved) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !Number.isFinite(item.quantity) ||
      item.quantity < 1
    )
      continue;
    const product = products.find((value) => value.id === item.productId);
    if (!product) continue;
    if (
      item.unitId !== undefined &&
      !product.units?.some((unit) => unit.id === item.unitId)
    )
      continue;
    if (
      item.colorId !== undefined &&
      !product.colors?.some((color) => color.id === item.colorId)
    )
      continue;
    result = putCartItem(result, product, item.quantity, item, true);
  }
  return result;
}
