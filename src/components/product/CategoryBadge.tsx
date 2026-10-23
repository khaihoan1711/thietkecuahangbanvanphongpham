import { categoryInfo } from "@/data/products";
import type { ProductCategory } from "@/types/product";

export default function CategoryBadge({
  category,
  className = "",
}: {
  category: ProductCategory;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-navy-soft px-2.5 py-1 text-xs font-semibold text-navy ${className}`}
    >
      {categoryInfo[category].label}
    </span>
  );
}
