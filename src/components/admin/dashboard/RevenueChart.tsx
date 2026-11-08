import { formatVND } from "@/lib/format";
import type { MonthlyRevenue } from "@/lib/stats";

// Chiều cao vùng vẽ cột và chiều rộng mỗi cột trong hệ tọa độ SVG.
const CHART_HEIGHT = 180;
const BAR_WIDTH = 44;
const SLOT_WIDTH = 90;

// 1.250.000 -> "1,3 tr", 85.000 -> "85k"
function formatShort(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".0", "").replace(".", ",")} tr`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  return String(value);
}

// Biểu đồ cột doanh thu theo tháng, vẽ bằng SVG (không cần thư viện biểu đồ).
export default function RevenueChart({ data }: { data: MonthlyRevenue[] }) {
  const max = Math.max(...data.map((item) => item.revenue), 1);
  const width = data.length * SLOT_WIDTH;
  const summary = data
    .map((item) => `${item.label}: ${formatVND(item.revenue)}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${width} ${CHART_HEIGHT + 50}`}
      role="img"
      aria-label={`Biểu đồ doanh thu theo tháng. ${summary}`}
      className="h-auto w-full"
    >
      {/* Đường kẻ nền */}
      {[0, 0.5, 1].map((ratio) => (
        <line
          key={ratio}
          x1={0}
          x2={width}
          y1={30 + CHART_HEIGHT * ratio}
          y2={30 + CHART_HEIGHT * ratio}
          stroke="#E6E8EC"
          strokeDasharray={ratio === 1 ? undefined : "4 4"}
        />
      ))}

      {data.map((item, index) => {
        const barHeight = Math.round((item.revenue / max) * CHART_HEIGHT);
        const x = index * SLOT_WIDTH + (SLOT_WIDTH - BAR_WIDTH) / 2;
        const y = 30 + CHART_HEIGHT - barHeight;

        return (
          <g key={item.key}>
            <rect
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={barHeight}
              rx={6}
              fill="#176bc0"
            >
              <title>{`${item.label}: ${formatVND(item.revenue)}`}</title>
            </rect>
            <text
              x={x + BAR_WIDTH / 2}
              y={y - 8}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill="#14365b"
            >
              {item.revenue > 0 ? formatShort(item.revenue) : ""}
            </text>
            <text
              x={x + BAR_WIDTH / 2}
              y={CHART_HEIGHT + 52 - 12}
              textAnchor="middle"
              fontSize={13}
              fill="#68707B"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
