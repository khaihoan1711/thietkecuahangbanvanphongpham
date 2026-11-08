// "Bút viết cao cấp" -> "but-viet-cao-cap"
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Tạo mã chưa bị trùng với danh sách `existing` bằng cách thêm hậu tố -2, -3...
export function uniqueSlug(text: string, existing: string[]) {
  const base = slugify(text) || "muc";
  let candidate = base;
  let counter = 2;

  while (existing.includes(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}
