"use client";

import { useState } from "react";
import Field from "@/components/account/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";

type FormValues = { province: string; district: string; ward: string; address: string };
type Errors = Partial<Record<keyof FormValues, string>>;

const fields: {
  name: keyof FormValues;
  label: string;
  message: string;
  autoComplete?: string;
}[] = [
  {
    name: "province",
    label: "Tỉnh / Thành phố",
    message: "Vui lòng nhập tỉnh / thành phố",
  },
  { name: "district", label: "Quận / Huyện", message: "Vui lòng nhập quận / huyện" },
  { name: "ward", label: "Phường / Xã", message: "Vui lòng nhập phường / xã" },
  {
    name: "address",
    label: "Địa chỉ cụ thể",
    message: "Vui lòng nhập địa chỉ cụ thể",
    autoComplete: "street-address",
  },
];

// The customer's own shipping address (not the store's address).
export default function AddressSection() {
  const [values, setValues] = useState<FormValues>({
    province: "",
    district: "",
    ward: "",
    address: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);

    const newErrors: Errors = {};
    for (const field of fields) {
      if (values[field.name].trim() === "") newErrors[field.name] = field.message;
    }
    setErrors(newErrors);

    const firstInvalid = fields.find((field) => newErrors[field.name]);
    if (firstInvalid) return document.getElementById(firstInvalid.name)?.focus();

    // TODO (backend): save the shipping address to the user's account here. Nothing is stored in the browser.
    setSuccess(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <h2 className="font-display text-2xl font-semibold text-ink">Địa chỉ</h2>
      <p className="text-ink-muted">Địa chỉ nhận hàng mặc định của bạn.</p>
      {fields.map((field) => (
        <Field
          key={field.name}
          id={field.name}
          label={field.label}
          value={values[field.name]}
          error={errors[field.name]}
          autoComplete={field.autoComplete}
          onChange={(value) => {
            setValues({ ...values, [field.name]: value });
            setSuccess(false);
            setErrors({ ...errors, [field.name]: undefined });
          }}
        />
      ))}
      <button
        type="submit"
        className={`${btnBase} ${btnPrimary}`}
      >
        Lưu địa chỉ
      </button>
      {success && (
        <p
          role="status"
          className="rounded-lg bg-primary-soft px-4 py-3 text-sm font-medium text-primary"
        >
          Đã lưu địa chỉ!
        </p>
      )}
    </form>
  );
}
