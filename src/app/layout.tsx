import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "KhaiHoanShop — Văn phòng phẩm & dụng cụ học tập",
  description:
    "Website bán văn phòng phẩm, đồ dùng học sinh, giấy, sổ và họa phẩm với giao diện hiện đại.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
