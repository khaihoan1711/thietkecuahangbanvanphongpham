// Các ô nhập liệu có nhãn và thông báo lỗi, dùng chung cho form tài khoản và form quản trị.
import type { ReactNode } from "react";

type BaseProps = {
  id: string;
  label: string;
  error?: string;
  // Dòng chú thích nhỏ dưới ô nhập
  hint?: string;
};

const fieldStyle =
  "w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

function stateStyle(error?: string) {
  return error ? fieldBad : fieldOk;
}

// Khung chung: nhãn + ô nhập + chú thích + lỗi
function FieldFrame({
  id,
  label,
  error,
  hint,
  children,
}: BaseProps & { children: ReactNode }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-ink-muted">{hint}</p>}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-sale"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ---------- Ô nhập một dòng ----------

type FieldProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
};

export default function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  autoComplete,
  placeholder,
  disabled,
  min,
}: FieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      error={error}
      hint={hint}
    >
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 ${fieldStyle} ${stateStyle(error)}`}
      />
    </FieldFrame>
  );
}

// ---------- Ô chọn ----------

type SelectFieldProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  error,
  hint,
  disabled,
}: SelectFieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      error={error}
      hint={hint}
    >
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`h-12 cursor-pointer ${fieldStyle} ${stateStyle(error)}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

// ---------- Ô nhập nhiều dòng ----------

type TextAreaFieldProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <FieldFrame
      id={id}
      label={label}
      error={error}
      hint={hint}
    >
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`py-3 ${fieldStyle} ${stateStyle(error)}`}
      />
    </FieldFrame>
  );
}
