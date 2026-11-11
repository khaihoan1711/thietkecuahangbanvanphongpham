"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCatalog } from "@/context/CatalogContext";
import { categoryHref, menuGroups } from "@/data/menu";

// Các liên kết cố định bên phải thanh menu (máy tính).
const extraLinks = [
  ["Khuyến mãi", "/#khuyen-mai"],
  ["Tin tức", "/#tin-tuc"],
  ["Liên hệ", "/#lien-he"],
];

// Các liên kết trên thanh cuộn ngang (điện thoại).
const mobileLinks = [
  ["Trang chủ", "/"],
  ["Sản phẩm", "/san-pham"],
  ["Khuyến mãi", "/#khuyen-mai"],
  ["Tin tức", "/#tin-tuc"],
  ["Liên hệ", "/#lien-he"],
];

const topLinkStyle =
  "flex h-[50px] items-center whitespace-nowrap px-2 text-[12px] xl:px-3 xl:text-[13px] font-bold uppercase tracking-wide transition hover:text-primary";

// Thanh menu chính: danh mục lấy từ kho dữ liệu (Admin thêm/sửa/xóa là menu đổi theo).
// Danh mục mặc định có menu xổ xuống (xem src/data/menu.ts), danh mục mới chỉ là một liên kết.
export default function CategoryNav({ currentPath }: { currentPath: string }) {
  const { categories } = useCatalog();

  const groups = categories.map((category) => ({
    category,
    children:
      menuGroups.find((group) => group.category === category.id)?.children ?? [],
  }));

  return (
    <nav
      aria-label="Điều hướng chính"
      className="border-t border-line bg-primary-soft"
    >
      {/* Máy tính: menu danh mục có xổ xuống */}
      <div className="mx-auto hidden w-full max-w-container items-stretch px-4 md:px-6 lg:flex lg:px-8">
        <ul className="flex w-full items-stretch gap-1">
          <li className="flex">
            <Link
              href="/"
              className={`${topLinkStyle} ${currentPath === "/" ? "text-primary" : "text-ink"}`}
            >
              Trang chủ
            </Link>
          </li>

          {groups.map(({ category, children }) => (
            <li
              key={category.id}
              className="group relative flex"
            >
              <Link
                href={categoryHref(category.id)}
                className={`flex h-[50px] items-center gap-1.5 whitespace-nowrap px-2 text-[12px] xl:px-3 xl:text-[13px] font-bold uppercase tracking-wide transition group-hover:text-primary group-focus-within:text-primary ${
                  currentPath === `/danh-muc/${category.id}`
                    ? "text-primary"
                    : "text-ink"
                }`}
              >
                {category.label}
                {children.length > 0 && (
                  <Icon
                    name="chevron"
                    size={14}
                    className="rotate-90 transition-transform group-hover:-rotate-90 group-focus-within:-rotate-90"
                  />
                )}
              </Link>

              {children.length > 0 && (
                <ul className="invisible absolute left-0 top-full z-50 w-[280px] rounded-b-lg border border-line bg-white opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {children.map((item) => (
                    <li
                      key={item.label}
                      className="group/sub relative border-b border-line last:border-b-0"
                    >
                      <Link
                        href={categoryHref(category.id, item.q)}
                        className="flex items-center justify-between px-5 py-3 text-[15px] text-ink hover:bg-primary-soft hover:text-primary"
                      >
                        <span>{item.label}</span>
                        {item.children && (
                          <Icon
                            name="chevron"
                            size={16}
                          />
                        )}
                      </Link>

                      {item.children && (
                        <ul className="invisible absolute left-full top-0 z-50 w-[250px] rounded-lg border border-line bg-white opacity-0 shadow-card transition group-hover/sub:visible group-hover/sub:opacity-100 group-focus-within/sub:visible group-focus-within/sub:opacity-100">
                          {item.children.map((child) => (
                            <li
                              key={child.label}
                              className="border-b border-line last:border-b-0"
                            >
                              <Link
                                href={categoryHref(category.id, child.q)}
                                className="block px-5 py-3 text-[15px] text-ink hover:bg-primary-soft hover:text-primary"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {extraLinks.map(([label, href]) => (
            <li
              key={label}
              className="hidden xl:flex"
            >
              <Link
                href={href}
                className={`${topLinkStyle} text-ink`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Điện thoại và máy tính bảng: thanh cuộn ngang */}
      <div className="lg:hidden">
        <ul className="hide-scrollbar mx-auto flex h-11 max-w-container items-stretch gap-5 overflow-x-auto px-4 md:px-6">
          {mobileLinks.map(([label, href]) => (
            <li
              key={label}
              className="flex shrink-0"
            >
              <Link
                href={href}
                className={`flex h-full items-center border-b-2 text-sm font-semibold transition ${
                  currentPath === href
                    ? "border-primary text-primary"
                    : "border-transparent text-ink hover:text-primary"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-line bg-surface">
          <div
            className="hide-scrollbar mx-auto flex max-w-container gap-2 overflow-x-auto px-4 py-2 md:px-6"
            aria-label="Danh mục sản phẩm"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category.id)}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-3 text-xs font-semibold text-navy hover:border-primary"
              >
                <span aria-hidden="true">{category.icon}</span>
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
