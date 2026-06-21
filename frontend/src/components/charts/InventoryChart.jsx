import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  'var(--color-primary)',
  'var(--color-tertiary)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-secondary)',
  'var(--color-outline)',
];

export default function InventoryChart({ data, height = 180, innerRadius = 50, outerRadius = 80 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-container-highest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v, n, p) => [`${v}%`, p.payload.label]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
