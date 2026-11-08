"use client";

import Modal from "@/components/ui/Modal";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  // Nút xác nhận màu đỏ khi thao tác không thể hoàn tác (ví dụ: xóa)
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Hộp thoại xác nhận trước khi xóa hoặc thực hiện thao tác quan trọng.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Xác nhận",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      size="sm"
    >
      <p className="text-ink-muted">{message}</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 rounded-lg border border-line px-5 font-semibold text-ink hover:bg-surface"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`min-h-11 rounded-lg px-5 font-semibold text-white ${
            danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-dark"
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
