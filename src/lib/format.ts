// 185000 -> "185.000₫"
export function formatVND(value: number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}
