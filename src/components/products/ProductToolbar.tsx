import Icon from "@/components/ui/Icon";

const sortOptions = [
  { value: "featured", label: "Nổi bật" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "name", label: "Tên A-Z" },
];

const fieldStyle =
  "h-12 rounded-lg border border-line bg-white text-ink transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary-soft";

export default function ProductToolbar({
  total,
  search,
  onSearchChange,
  sort,
  onSortChange,
}: {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="mb-6 space-y-4">
      <div
        role="search"
        className="relative"
      >
        <Icon
          name="search"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
        />
        <input
          id="product-search"
          type="search"
          placeholder="Tìm bút, vở, giấy A4, màu vẽ..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`${fieldStyle} w-full pl-12 pr-4`}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          Tìm thấy <strong className="text-ink">{total}</strong> sản phẩm
        </p>
        <div className="flex items-center gap-3">
          <label
            htmlFor="product-sort"
            className="text-sm font-semibold text-ink-muted"
          >
            Sắp xếp
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className={`${fieldStyle} cursor-pointer px-3 text-sm`}
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
