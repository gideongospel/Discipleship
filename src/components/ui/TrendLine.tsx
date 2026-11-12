// Minimal line chart (SVG): thin gold line, diamond markers, value above each
// point. Replaces a charting library — about 1KB instead of ~350KB, and it
// matches the rest of the interface.
export default function TrendLine({ data }: { data: { name: string; value: number }[] }) {
  const W = 600, H = 230, padL = 28, padR = 14, padT = 26, padB = 34
  const max = Math.max(4, ...data.map((d) => d.value))
  const top = Math.ceil(max / 4) * 4
  const x = (i: number) => padL + (data.length === 1 ? (W - padL - padR) / 2 : (i * (W - padL - padR)) / (data.length - 1))
  const y = (v: number) => padT + (1 - v / top) * (H - padT - padB)
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')
  const grid = [0, 0.5, 1].map((t) => Math.round(top * t))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Attendance over the last sessions">
      {grid.map((g) => (
        <g key={g}>
          <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1" />
          <text x={padL - 8} y={y(g) + 3.5} textAnchor="end" className="fill-slate-400" fontSize="10">{g}</text>
        </g>
      ))}
      <polyline
        points={pts}
        fill="none"
        className="stroke-gold-500"
        strokeWidth="1.6"
        strokeLinejoin="miter"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'line-draw 1.6s var(--ease-out-expo) 0.3s forwards' }}
      />
      {data.map((d, i) => (
        <g key={d.name + i} className="animate-fade-in" style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
          <rect x={x(i) - 3.5} y={y(d.value) - 3.5} width="7" height="7" transform={`rotate(45 ${x(i)} ${y(d.value)})`} className="fill-slate-50 stroke-gold-500 dark:fill-slate-950" strokeWidth="1.6" />
          <text x={x(i)} y={y(d.value) - 11} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="10.5" fontWeight="600">{d.value}</text>
          <text x={x(i)} y={H - 12} textAnchor="middle" className="fill-slate-400" fontSize="9.5">{d.name.slice(5)}</text>
        </g>
      ))}
    </svg>
  )
}
