// One labelled input with its error message. Used by the account forms.
type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
};

const fieldStyle =
  "h-12 w-full rounded-lg border bg-white px-4 text-ink transition-colors duration-200 placeholder:text-[#7A7F7B] focus:outline-none focus:ring-[3px]";
const fieldOk = "border-line focus:border-primary focus:ring-primary-soft";
const fieldBad = "border-sale focus:border-sale focus:ring-sale/20";

export default function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldStyle} ${error ? fieldBad : fieldOk}`}
      />
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
