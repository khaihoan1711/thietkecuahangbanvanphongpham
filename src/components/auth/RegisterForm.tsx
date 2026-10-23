"use client";

import Link from "next/link";
import { useState } from "react";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { isValidEmail, isValidPhone } from "@/lib/validation";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// Field order = order of the checks, so the first error is also the first field on the page
const fieldOrder: (keyof FormValues)[] = [
  "fullName",
  "email",
  "phone",
  "password",
  "confirmPassword",
];

function validate(values: FormValues): Errors {
  const errors: Errors = {};

  if (values.fullName.trim() === "") errors.fullName = "Vui lòng nhập họ và tên";

  if (values.email.trim() === "") errors.email = "Vui lòng nhập email";
  else if (!isValidEmail(values.email))
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";

  if (values.phone.trim() === "") errors.phone = "Vui lòng nhập số điện thoại";
  else if (!isValidPhone(values.phone))
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";

  if (values.password === "") errors.password = "Vui lòng nhập mật khẩu";
  else if (values.password.length < 6)
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";

  if (values.confirmPassword === "")
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Mật khẩu xác nhận không khớp";

  return errors;
}

export default function RegisterForm() {
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    setValues({ ...values, [field]: value });
    setSuccess(false);
    // Remove the error of this field as soon as the user edits it
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);

    const firstInvalid = fieldOrder.find((field) => newErrors[field]);
    if (firstInvalid) {
      setSuccess(false);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    // TODO (real authentication): create the account on the backend / Auth provider here.
    // Until then nothing is saved: no user, no password, no "logged in" state.
    setValues({ ...values, password: "", confirmPassword: "" });
    setSuccess(true);
  }

  // One labelled input with its error message
  function renderField(
    field: keyof FormValues,
    label: string,
    type: string,
    autoComplete: string,
  ) {
    const error = errors[field];
    return (
      <div>
        <label
          htmlFor={field}
          className="mb-2 block font-medium text-ink"
        >
          {label}
        </label>
        <input
          id={field}
          type={type}
          autoComplete={autoComplete}
          value={values[field]}
          onChange={(event) => handleChange(field, event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${field}-error` : undefined}
          className={`${fieldStyle} ${error ? fieldBad : fieldOk}`}
        />
        {error && (
          <p
            id={`${field}-error`}
            className="mt-1.5 text-sm text-sale"
          >
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {renderField("fullName", "Họ và tên", "text", "name")}
      {renderField("email", "Email", "email", "email")}
      {renderField("phone", "Số điện thoại", "tel", "tel")}
      {renderField("password", "Mật khẩu", "password", "new-password")}
      {renderField("confirmPassword", "Xác nhận mật khẩu", "password", "new-password")}

      <button
        type="submit"
        className={`${btnBase} ${btnPrimary} w-full`}
      >
        Đăng ký
      </button>

      {success && (
        <p
          role="status"
          className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
        >
          Đăng ký thành công!
        </p>
      )}

      <p className="text-center text-ink-muted">
        Đã có tài khoản?{" "}
        <Link
          href="/dang-nhap"
          className="font-medium text-primary underline underline-offset-4"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
