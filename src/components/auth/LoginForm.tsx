"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail } from "@/lib/validation";

type Errors = { email?: string; password?: string };

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// Chỉ cho phép quay lại các đường dẫn nội bộ của website (tránh chuyển hướng ra trang khác).
function safeNext(next?: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return null;
}

// `next` là trang cần quay lại sau khi đăng nhập (ví dụ khi bị chuyển từ trang Admin).
export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { users, login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  // Lỗi đăng nhập trả về từ kho tài khoản (sai mật khẩu, tài khoản bị khóa...)
  const [formError, setFormError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const newErrors: Errors = {};
    if (email.trim() === "") newErrors.email = "Vui lòng nhập email";
    else if (!isValidEmail(email))
      newErrors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
    if (password === "") newErrors.password = "Vui lòng nhập mật khẩu";
    setErrors(newErrors);

    if (newErrors.email) return document.getElementById("email")?.focus();
    if (newErrors.password) return document.getElementById("password")?.focus();

    // Kiểm tra với danh sách tài khoản trong LocalStorage.
    const result = login(email, password, remember);

    if (!result.ok) {
      setFormError(result.message);
      showToast(result.message, "error");
      return;
    }

    showToast("Đăng nhập thành công!");

    // Admin vào khu quản trị, người dùng thường về trang chủ (trừ khi có trang cần quay lại).
    const role = users.find((user) => user.email === email.trim().toLowerCase())?.role;
    const fallback = role === "admin" ? "/quan-tri" : "/";

    router.push(safeNext(next) ?? fallback);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block font-medium text-ink"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrors({ ...errors, email: undefined });
          }}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={`${fieldStyle} ${errors.email ? fieldBad : fieldOk}`}
        />
        {errors.email && (
          <p
            id="email-error"
            className="mt-1.5 text-sm text-sale"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block font-medium text-ink"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors({ ...errors, password: undefined });
          }}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "password-error" : undefined}
          className={`${fieldStyle} ${errors.password ? fieldBad : fieldOk}`}
        />
        {errors.password && (
          <p
            id="password-error"
            className="mt-1.5 text-sm text-sale"
          >
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
          />
          Ghi nhớ đăng nhập
        </label>
        {/* The password reset page does not exist yet */}
        <Link
          href="#"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <button
        type="submit"
        className={`${btnBase} ${btnPrimary} w-full`}
      >
        Đăng nhập
      </button>

      {formError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {formError}
        </p>
      )}

      <p className="text-center text-ink-muted">
        Chưa có tài khoản?{" "}
        <Link
          href="/dang-ky"
          className="font-medium text-primary underline underline-offset-4"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
