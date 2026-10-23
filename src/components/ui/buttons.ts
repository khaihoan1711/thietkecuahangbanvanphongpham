// Shared button styles. Use them on <a> or <button>:
//   <a href="#" className={`${btnBase} ${btnPrimary}`}>...</a>
export const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent px-6 text-base font-semibold leading-none transition-colors duration-200";

export const btnPrimary = "bg-primary text-white hover:bg-primary-dark";
export const btnSecondary =
  "border-primary bg-white text-primary hover:bg-primary-soft";
export const btnLight = "bg-white text-primary hover:bg-primary-soft";
export const btnGhost =
  "min-h-11 bg-transparent px-2 text-primary hover:text-primary-dark hover:underline hover:underline-offset-4";

// Small size: add after the variant
export const btnSmall = "min-h-11 px-4 text-sm";
