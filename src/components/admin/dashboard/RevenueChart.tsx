import { useId } from "react";
import { formatVND } from "@/lib/format";
import type { MonthlyRevenue } from "@/lib/stats";

// Kích thước vùng vẽ trong hệ tọa độ SVG (biểu đồ tự co giãn theo chiều rộng khung).
const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 36, right: 28, bottom: 44, left: 64 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const BASE_Y = PAD.top + PLOT_H;
// Chừa khoảng trống hai bên để nhãn ở điểm đầu/cuối không bị cắt.
const INSET = 36;

// 1.250.000 -> "1,25 tr", 85.000 -> "85k"
function formatShort(value: number) {
  if (value >= 1_000_000) {
    const millions = Math.round((value / 1_000_000) * 100) / 100;

    return `${String(millions).replace(".", ",")} tr`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  return String(value);
}

// Làm tròn mức cao nhất của trục dọc thành số "đẹp" (1, 2, 2,5, 5 × 10^n).
function niceMax(value: number) {
  if (value <= 0) {
    return 100_000;
  }

  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((item) => item * power >= value) ?? 10;

  return step * power;
}

// Đường cong mềm đi qua các điểm. Tiếp tuyến nằm ngang tại mỗi điểm
// nên đường cong không bao giờ vượt quá điểm cao nhất hay thấp nhất.
function smoothPath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const handle = (point.x - previous.x) * 0.45;

      return `C ${previous.x + handle} ${previous.y} ${point.x - handle} ${point.y} ${point.x} ${point.y}`;
    })
    .join(" ");
}

// Biểu đồ vùng ("sơ đồ núi") doanh thu theo tháng, vẽ bằng SVG, không cần thư viện.
export default function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const gradientId = useId();
  const top = niceMax(Math.max(...data.map((item) => item.revenue)) * 1.15);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * top);
  const gap = data.length > 1 ? (PLOT_W - INSET * 2) / (data.length - 1) : 0;
  const points = data.map((item, index) => ({
    ...item,
    x: data.length > 1 ? PAD.left + INSET + index * gap : PAD.left + PLOT_W / 2,
    y: BASE_Y - (item.revenue / top) * PLOT_H,
  }));
  const line = smoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line} L ${last.x} ${BASE_Y} L ${first.x} ${BASE_Y} Z`;
  const summary = data
    .map((item) => `${item.label}: ${formatVND(item.revenue)}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Biểu đồ doanh thu theo tháng. ${summary}`}
      className="h-auto w-full"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor="#176bc0"
            stopOpacity={0.38}
          />
          <stop
            offset="100%"
            stopColor="#176bc0"
            stopOpacity={0.03}
          />
        </linearGradient>
      </defs>

      {/* Lưới ngang và nhãn trục dọc */}
      {ticks.map((value) => {
        const y = BASE_Y - (value / top) * PLOT_H;

        return (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y}
              y2={y}
              stroke="#E6E8EC"
              strokeDasharray={value === 0 ? undefined : "4 6"}
            />
            <text
              x={PAD.left - 12}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fill="#68707B"
            >
              {value === 0 ? "0" : formatShort(value)}
            </text>
          </g>
        );
      })}

      {/* Vùng "núi" và đường viền */}
      {points.length > 1 && (
        <path
          d={area}
          fill={`url(#${gradientId})`}
        />
      )}
      <path
        d={line}
        fill="none"
        stroke="#176bc0"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point) => (
        <g key={point.key}>
          <line
            x1={point.x}
            x2={point.x}
            y1={point.y}
            y2={BASE_Y}
            stroke="#176bc0"
            strokeOpacity={0.25}
            strokeDasharray="3 4"
          />
          <circle
            cx={point.x}
            cy={point.y}
            r={6}
            fill="white"
            stroke="#176bc0"
            strokeWidth={3}
          >
            <title>{`${point.label}: ${formatVND(point.revenue)}`}</title>
          </circle>
          <text
            x={point.x}
            y={point.y - 14}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill="#14365b"
          >
            {formatShort(point.revenue)}
          </text>
          <text
            x={point.x}
            y={BASE_Y + 26}
            textAnchor="middle"
            fontSize={13}
            fill="#68707B"
          >
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
