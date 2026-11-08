"use client";

import { useCatalog } from "@/context/CatalogContext";
import type { ProductCategory } from "@/types/product";

export default function CategoryBadge({
  category,
  className = "",
}: {
  category: ProductCategory;
  className?: string;
}) {
  const { getCategoryLabel } = useCatalog();

  return (
    <span
      className={`inline-flex items-center rounded-full bg-navy-soft px-2.5 py-1 text-xs font-semibold text-navy ${className}`}
    >
      {getCategoryLabel(category)}
    </span>
  );
}
