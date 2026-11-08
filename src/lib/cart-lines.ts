import { maxCartQuantity, selectedProduct } from "@/lib/product-options";
import type { OrderItem } from "@/types/store";
import type { CartItem, Product } from "@/types/product";

// Một dòng trong giỏ hàng: sản phẩm (đã áp dụng đơn vị/màu đã chọn) và số lượng.
export type CartLine = {
  product: ReturnType<typeof selectedProduct>;
  quantity: number;
  item: CartItem;
  // Số lượng tối đa có thể đặt theo tồn kho
  maximum: number;
};

// Ghép mỗi mục trong giỏ với sản phẩm tương ứng.
// Sản phẩm đã bị Admin xóa sẽ được bỏ qua.
export function getCartLines(items: CartItem[], products: Product[]): CartLine[] {
  return items.flatMap((item) => {
    const product = products.find((value) => value.id === item.productId);

    if (!product) {
      return [];
    }

    return [
      {
        product: selectedProduct(product, item),
        quantity: item.quantity,
        item,
        maximum: maxCartQuantity(product, items, item),
      },
    ];
  });
}

// Chuyển các dòng giỏ hàng thành các dòng của đơn hàng
// (lưu lại tên, giá, ảnh tại thời điểm mua).
export function toOrderItems(lines: CartLine[]): OrderItem[] {
  return lines.map((line) => ({
    productId: line.product.id,
    name: line.product.name,
    image: line.product.image,
    pack: line.product.pack,
    price: line.product.price,
    quantity: line.quantity,
    stockUnits: line.product.count,
  }));
}
