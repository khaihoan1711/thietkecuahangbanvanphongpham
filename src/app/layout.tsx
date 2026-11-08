import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { OrderProvider } from "@/context/OrderContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "KhaiHoanShop — Văn phòng phẩm & dụng cụ học tập",
  description:
    "Website bán văn phòng phẩm, đồ dùng học sinh, giấy, sổ và họa phẩm với giao diện hiện đại.",
};

// Thứ tự lồng nhau quan trọng: Đơn hàng và Giỏ hàng cần dùng dữ liệu sản phẩm (Catalog).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>
          <CatalogProvider>
            <AuthProvider>
              <OrderProvider>
                <CartProvider>{children}</CartProvider>
              </OrderProvider>
            </AuthProvider>
          </CatalogProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
