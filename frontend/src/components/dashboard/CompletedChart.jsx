// Smooth line chart made with plain SVG (no chart library).
const WIDTH = 700;
const HEIGHT = 250;
const PAD = { left: 40, right: 20, top: 56, bottom: 36 };

// Joins points with smooth S-curves (control points sit at the middle x)
function smoothPath(points) {
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    const middleX = (prev.x + next.x) / 2;
    path += ` C ${middleX} ${prev.y}, ${middleX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export default function CompletedChart({ data }) {
  const max = Math.max(4, ...data.map((d) => d.count));
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const bottomY = PAD.top + plotHeight;

  const points = data.map((d, i) => ({
    ...d,
    x: PAD.left + (plotWidth / (data.length - 1)) * i,
    y: bottomY - (d.count / max) * plotHeight,
  }));

  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
  const peak = points.reduce((best, p) => (p.count > best.count ? p : best), points[0]);
  const gridValues = [0, Math.round(max / 2), max];

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Tasks completed in the last 7 days"
    >
      <defs>
        <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.35 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* dotted grid lines with numbers */}
      {gridValues.map((value) => {
        const y = bottomY - (value / max) * plotHeight;
        return (
          <g key={value}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeDasharray="2 6" />
            <text x={PAD.left - 12} y={y + 4} textAnchor="end">{value}</text>
          </g>
        );
      })}

      <path d={area} fill="url(#completedFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" />

      {points.map((p) => (
        <g key={p.label + p.x}>
          <circle cx={p.x} cy={p.y} r="4" fill="var(--accent)" />
          <text x={p.x} y={HEIGHT - 10} textAnchor="middle">{p.label}</text>
        </g>
      ))}

      {/* dark bubble on the highest point */}
      {peak.count > 0 && (
        <g>
          <circle cx={peak.x} cy={peak.y} r="6" fill="var(--btn)" />
          <rect x={peak.x - 20} y={peak.y - 46} width="40" height="30" rx="9" fill="var(--btn)" />
          <polygon points={`${peak.x - 6},${peak.y - 17} ${peak.x + 6},${peak.y - 17} ${peak.x},${peak.y - 9}`} fill="var(--btn)" />
          <text x={peak.x} y={peak.y - 25} textAnchor="middle" style={{ fill: '#ffffff', fontWeight: 700, fontSize: 16 }}>
            {peak.count}
          </text>
        </g>
      )}
    </svg>
  );
}
