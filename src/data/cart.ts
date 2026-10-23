// Sample values for now. Used by both the cart page and the checkout page.
export const SHIPPING_FEE = 30000;
export const DISCOUNT = 20000;

// Tạm tính, and Tổng cộng = subtotal + shipping - discount
export function calculateTotals(subtotal: number) {
  return {
    subtotal,
    shipping: SHIPPING_FEE,
    discount: DISCOUNT,
    total: subtotal + SHIPPING_FEE - DISCOUNT,
  };
}
