import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-level2 p-3">
      <p className="label-md text-on-surface-variant mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: p.stroke }} />
          <span className="text-on-surface-variant">{p.name}:</span>
          <span className="font-semibold text-on-surface tnum">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const COLORS = ['var(--color-primary)', 'var(--color-tertiary)', 'var(--color-warning)', 'var(--color-error)'];

export default function RevenueChart({ data, series, fmt, height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="var(--color-outline-variant)" strokeOpacity={0.4} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt ? fmt(v) : v} width={50} />
        <Tooltip content={<CustomTooltip fmt={fmt} />} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            fill={s.fill ? `url(#grad-${s.key})` : 'transparent'}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface-container-lowest)' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
