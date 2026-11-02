import type { RevenuePoint } from '@/models/analytics';
import { formatPrice } from '@/lib/utils';

interface RevenueChartProps {
  points: RevenuePoint[];
}

const W = 720;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

/**
 * Courbe du chiffre d'affaires par jour (SVG, sans dépendance externe)
 */
export function RevenueChart({ points }: RevenueChartProps) {
  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.revenue), 1);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.revenue).toFixed(1)}`).join(' ');
  const area = `${line} L${x(points.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Chiffre d'affaires par jour">
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(max * t)}
            y2={y(max * t)}
            className="stroke-muted-foreground/20"
          />
          <text x={PAD.left - 8} y={y(max * t) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      <path d={area} className="fill-primary/10" />
      <path d={line} className="fill-none stroke-primary" strokeWidth={2} strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={x(i)} cy={y(p.revenue)} r={points.length > 40 ? 2 : 3.5} className="fill-primary">
            <title>{`${shortDate(p.date)} : ${formatPrice(p.revenue)} (${p.orders} commande${p.orders > 1 ? 's' : ''})`}</title>
          </circle>
          {i % labelEvery === 0 && (
            <text x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {shortDate(p.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default RevenueChart;