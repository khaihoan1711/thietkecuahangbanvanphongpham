"use client";

import Link from "next/link";
import { useState } from "react";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useCart } from "@/context/CartContext";
import { calculateTotals } from "@/data/cart";
import { formatVND } from "@/lib/format";
import { cartKey, selectedProduct } from "@/lib/product-options";
import type { Product } from "@/types/product";

type FormValues = {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  fullName: "",
  phone: "",
  email: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  note: "",
};

// Checked in this order, so the first error is also the first field on the page
const requiredMessages: [keyof FormValues, string][] = [
  ["fullName", "Vui lòng nhập họ và tên"],
  ["phone", "Vui lòng nhập số điện thoại"],
  ["email", "Vui lòng nhập email"],
  ["province", "Vui lòng nhập tỉnh / thành phố"],
  ["district", "Vui lòng nhập quận / huyện"],
  ["ward", "Vui lòng nhập phường / xã"],
  ["address", "Vui lòng nhập địa chỉ cụ thể"],
];

function validate(values: FormValues): Errors {
  const errors: Errors = {};

  for (const [field, message] of requiredMessages) {
    if (values[field].trim() === "") errors[field] = message;
  }

  // Vietnamese phone: 10 digits starting with 0 (or +84 followed by 9 digits)
  const phone = values.phone.replace(/[\s.-]/g, "");
  if (!errors.phone && !/^(0|\+84)\d{9}$/.test(phone)) {
    errors.phone = "Số điện thoại không hợp lệ (ví dụ: 0901234567)";
  }

  if (!errors.email && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Email không hợp lệ (ví dụ: ten@email.com)";
  }

  return errors;
}

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

// `products` comes from the local front-end data. The cart itself only stores ids and quantities.
export default function CheckoutView({ products }: { products: Product[] }) {
  const { items, isReady } = useCart();
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [payment, setPayment] = useState<"cod" | "bank">("cod");
  const [success, setSuccess] = useState(false);

  // Wait for localStorage, otherwise the empty message would flash on every page load
  if (!isReady) {
    return <p className="py-16 text-ink-muted">Đang tải giỏ hàng…</p>;
  }

  // Join each cart line with its product. Ids that no longer exist are skipped.
  const lines = items.flatMap((item) => {
    const product = products.find((product) => product.id === item.productId);
    return product
      ? [{ product: selectedProduct(product, item), quantity: item.quantity, item }]
      : [];
  });

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center">
        <p className="font-display text-2xl font-semibold text-ink">
          Giỏ hàng của bạn đang trống
        </p>
        <Link
          href="/san-pham"
          className={`${btnBase} ${btnPrimary} mt-6`}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const { subtotal, shipping, discount, total } = calculateTotals(
    lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );

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

    const firstInvalid = requiredMessages.find(([field]) => newErrors[field]);
    if (firstInvalid) {
      setSuccess(false);
      document.getElementById(firstInvalid[0])?.focus();
      return;
    }

    // Frontend only for now: no real order is created and the cart is kept.
    // Backend: create the order here, then clear the cart.
    setSuccess(true);
  }

  // One labelled text field with its error message
  function renderField(
    field: keyof FormValues,
    label: string,
    options: { type?: string; autoComplete?: string } = {},
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
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
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

  const paymentOptions = [
    { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
    { value: "bank", label: "Chuyển khoản ngân hàng" },
  ] as const;

  const summaryRows = [
    { label: "Tạm tính", value: formatVND(subtotal) },
    { label: "Phí vận chuyển", value: formatVND(shipping) },
    { label: "Giảm giá", value: `−${formatVND(discount)}` },
  ];

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid items-start gap-8 lg:grid-cols-[1fr_400px]"
    >
      <div className="space-y-8">
        <section
          aria-labelledby="shipping-title"
          className="rounded-xl border border-line bg-white p-6"
        >
          <h2
            id="shipping-title"
            className="font-display text-2xl font-semibold text-ink"
          >
            Thông tin giao hàng
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {renderField("fullName", "Họ và tên", { autoComplete: "name" })}
            {renderField("phone", "Số điện thoại", {
              type: "tel",
              autoComplete: "tel",
            })}
            <div className="sm:col-span-2">
              {renderField("email", "Email", { type: "email", autoComplete: "email" })}
            </div>
            {renderField("province", "Tỉnh / Thành phố")}
            {renderField("district", "Quận / Huyện")}
            {renderField("ward", "Phường / Xã")}
            {renderField("address", "Địa chỉ cụ thể", {
              autoComplete: "street-address",
            })}
            <div className="sm:col-span-2">
              <label
                htmlFor="note"
                className="mb-2 block font-medium text-ink"
              >
                Ghi chú đơn hàng{" "}
                <span className="font-normal text-ink-muted">(không bắt buộc)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                value={values.note}
                onChange={(event) => handleChange("note", event.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-ink transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft"
              />
            </div>
          </div>
        </section>

        <fieldset className="m-0 rounded-xl border border-line bg-white p-6">
          <legend className="float-left mb-4 w-full p-0 font-display text-2xl font-semibold text-ink">
            Phương thức thanh toán
          </legend>
          <div className="clear-both space-y-1">
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-ink"
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={payment === option.value}
                  onChange={() => setPayment(option.value)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>
          {/* Bank transfer is a selectable option only: no payment gateway and no bank details yet. */}
        </fieldset>
      </div>

      <aside
        aria-label="Đơn hàng của bạn"
        className="rounded-xl border border-line bg-white p-6"
      >
        <h2 className="font-display text-2xl font-semibold text-ink">
          Đơn hàng của bạn
        </h2>

        <ul className="mt-4 divide-y divide-line">
          {lines.map((line) => (
            <li
              key={cartKey(line.item)}
              className="flex justify-between gap-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{line.product.name}</p>
                <p className="text-sm text-ink-muted">
                  {line.product.pack} · Số lượng: {line.quantity}
                </p>
              </div>
              <span className="whitespace-nowrap font-medium text-ink">
                {formatVND(line.product.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-2 space-y-3 border-t border-line pt-4">
          {summaryRows.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-4"
            >
              <dt className="text-ink-muted">{row.label}</dt>
              <dd className="font-medium text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-line pt-4">
            <dt className="text-lg font-semibold text-ink">Tổng cộng</dt>
            <dd className="text-2xl font-bold text-primary">{formatVND(total)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          className={`${btnBase} ${btnPrimary} mt-6 w-full`}
        >
          Đặt hàng
        </button>

        {Object.values(errors).some(Boolean) && (
          <p
            role="alert"
            className="mt-4 text-sm text-sale"
          >
            Vui lòng kiểm tra lại các thông tin được đánh dấu.
          </p>
        )}
        {success && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
          >
            Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại KhaiHoanShop.
          </p>
        )}
        <Link
          href="/gio-hang"
          className="mt-4 block text-center text-sm font-medium text-primary underline underline-offset-4"
        >
          Quay lại giỏ hàng
        </Link>
      </aside>
    </form>
  );
}
