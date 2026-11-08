// 185000 -> "185.000₫"
export function formatVND(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

// "2026-11-08T09:30:00.000Z" -> "08/11/2026"
export function formatDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}

// "2026-11-08T09:30:00.000Z" -> "08/11/2026 16:30"
export function formatDateTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${formatDate(iso)} ${hours}:${minutes}`;
}
