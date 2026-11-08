"use client";

import { useState } from "react";
import Field from "@/components/ui/Field";
import { btnBase, btnPrimary } from "@/components/ui/buttons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { Address, User } from "@/types/store";

type Errors = Partial<Record<keyof Address, string>>;

const fields: {
  name: keyof Address;
  label: string;
  message: string;
  autoComplete?: string;
}[] = [
  {
    name: "province",
    label: "Tỉnh / Thành phố",
    message: "Vui lòng nhập tỉnh / thành phố",
  },
  {
    name: "district",
    label: "Quận / Huyện",
    message: "Vui lòng nhập quận / huyện",
  },
  {
    name: "ward",
    label: "Phường / Xã",
    message: "Vui lòng nhập phường / xã",
  },
  {
    name: "address",
    label: "Địa chỉ cụ thể",
    message: "Vui lòng nhập địa chỉ cụ thể",
    autoComplete: "street-address",
  },
];

// Địa chỉ nhận hàng mặc định của khách (không phải địa chỉ cửa hàng).
// Địa chỉ này được điền sẵn ở trang thanh toán và dùng khi đặt hàng nhanh từ giỏ hàng.
export default function AddressSection({ user }: { user: User }) {
  const { updateAddress } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState<Address>({
    province: user.address?.province ?? "",
    district: user.address?.district ?? "",
    ward: user.address?.ward ?? "",
    address: user.address?.address ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess(false);

    const newErrors: Errors = {};

    for (const field of fields) {
      if (values[field.name].trim() === "") {
        newErrors[field.name] = field.message;
      }
    }

    setErrors(newErrors);

    const firstInvalid = fields.find((field) => newErrors[field.name]);

    if (firstInvalid) {
      document.getElementById(firstInvalid.name)?.focus();
      return;
    }

    updateAddress({
      province: values.province.trim(),
      district: values.district.trim(),
      ward: values.ward.trim(),
      address: values.address.trim(),
    });

    setSuccess(true);
    showToast("Đã lưu địa chỉ giao hàng.");
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
