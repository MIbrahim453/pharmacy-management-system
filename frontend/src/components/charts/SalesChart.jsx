import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SalesChart({ data, dataKey = 'v', fmt, height = 200, highlightIndex }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-outline-variant)" strokeOpacity={0.4} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} tickFormatter={(v) => fmt ? fmt(v) : v} width={40} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-container-highest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [fmt ? fmt(v) : v, '']}
        />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === (highlightIndex ?? data.length - 1) ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 18%, transparent)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
