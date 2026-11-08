"use client";

import { useState } from "react";
import Field from "@/components/ui/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail, isValidPhone } from "@/lib/validation";
import type { User } from "@/types/store";

type Errors = { fullName?: string; email?: string; phone?: string };

// Xem và chỉnh sửa thông tin cá nhân. Dữ liệu được lưu vào LocalStorage.
export default function ProfileSection({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);

    const newErrors: Errors = {};

    if (fullName.trim() === "") {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (email.trim() === "") {
      newErrors.email = "Vui lòng nhập email";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
    }

    if (phone.trim() === "") {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
    }

    setErrors(newErrors);

    const firstInvalid = (["fullName", "email", "phone"] as const).find(
      (field) => newErrors[field],
    );

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const result = updateProfile({ fullName, email, phone });

    if (!result.ok) {
      // Lỗi duy nhất có thể xảy ra ở đây là email trùng với tài khoản khác.
      setErrors({ email: result.message });
      showToast(result.message, "error");
      return;
    }

    setSuccess(true);
    showToast("Đã lưu thông tin cá nhân.");
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <h2 className="font-display text-2xl font-semibold text-ink">
        Thông tin cá nhân
      </h2>

      <Field
        id="fullName"
        label="Họ và tên"
        value={fullName}
        error={errors.fullName}
        autoComplete="name"
        onChange={(value) => {
          setFullName(value);
          setSuccess(false);
          setErrors({ ...errors, fullName: undefined });
        }}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        value={email}
        error={errors.email}
        autoComplete="email"
        onChange={(value) => {
          setEmail(value);
          setSuccess(false);
          setErrors({ ...errors, email: undefined });
        }}
      />
      <Field
        id="phone"
        label="Số điện thoại"
        type="tel"
        value={phone}
        error={errors.phone}
        autoComplete="tel"
        onChange={(value) => {
          setPhone(value);
          setSuccess(false);
          setErrors({ ...errors, phone: undefined });
        }}
      />

      <button
        type="submit"
        className={`${btnBase} ${btnPrimary}`}
      >
        Lưu thay đổi
      </button>

      {success && (
        <p
          role="status"
          className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
        >
          Đã lưu thông tin cá nhân!
        </p>
      )}
    </form>
  );
}
