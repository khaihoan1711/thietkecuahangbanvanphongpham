"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  // Chiều rộng tối đa của hộp thoại
  size?: "sm" | "md" | "lg";
};

const sizeStyle = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

// Hộp thoại nổi dùng chung (form thêm/sửa, chi tiết đơn hàng...).
// Đóng bằng nút ✕, phím Esc hoặc bấm ra ngoài.
export default function Modal({ title, onClose, children, size = "md" }: ModalProps) {
  // Đóng khi nhấn Esc.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Khóa cuộn trang phía sau khi hộp thoại đang mở.
  useEffect(() => {
    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        // Chỉ đóng khi bấm vào nền tối, không đóng khi bấm bên trong hộp thoại.
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-card sm:rounded-2xl ${sizeStyle[size]}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-xl font-black text-navy">{title}</h2>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
