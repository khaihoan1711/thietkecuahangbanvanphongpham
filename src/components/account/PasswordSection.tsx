"use client";

import { useState } from "react";
import Field from "@/components/account/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordSection() {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    setValues({ ...values, [field]: value });
    setSuccess(false);
    setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);

    const newErrors: Errors = {};
    if (values.currentPassword === "")
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (values.newPassword === "") newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (values.newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    if (values.confirmPassword === "")
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    else if (values.confirmPassword !== values.newPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(newErrors);

    const firstInvalid = (
      ["currentPassword", "newPassword", "confirmPassword"] as const
    ).find((f) => newErrors[f]);
    if (firstInvalid) return document.getElementById(firstInvalid)?.focus();

    // TODO (real authentication): the backend must check the current password and save the new one.
    // Passwords are never stored or verified in the browser.
    setValues(emptyForm);
    setSuccess(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <h2 className="font-display text-2xl font-semibold text-ink">Đổi mật khẩu</h2>
      <Field
        id="currentPassword"
        label="Mật khẩu hiện tại"
        type="password"
        autoComplete="current-password"
        value={values.currentPassword}
        error={errors.currentPassword}
        onChange={(value) => handleChange("currentPassword", value)}
      />
      <Field
        id="newPassword"
        label="Mật khẩu mới"
        type="password"
        autoComplete="new-password"
        value={values.newPassword}
        error={errors.newPassword}
        onChange={(value) => handleChange("newPassword", value)}
      />
      <Field
        id="confirmPassword"
        label="Xác nhận mật khẩu mới"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChange={(value) => handleChange("confirmPassword", value)}
      />
      <button
        type="submit"
        className={`${btnBase} ${btnPrimary}`}
      >
        Đổi mật khẩu
      </button>
      {success && (
        <p
          role="status"
          className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
        >
          Đổi mật khẩu thành công!
        </p>
      )}
    </form>
  );
}
