import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const toneStyles = {
  default: 'bg-primary/[0.08] text-primary',
  success: 'bg-primary/[0.12] text-primary',
  warning: 'bg-warning/[0.12] text-warning',
  danger: 'bg-error/[0.12] text-error',
  info: 'bg-tertiary/[0.12] text-tertiary',
};

export function KPICard({ icon, value, label, delta, deltaDir, tone = 'default', className }) {
  const isUp = deltaDir === 'up';
  const isDown = deltaDir === 'down';
  const DeltaIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <motion.div
      className={`card-surface p-5 ${className || ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${toneStyles[tone]}`}>
          {icon}
        </div>
        {delta && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 label-md tnum ${isUp ? 'bg-primary/[0.12] text-primary' :
              isDown ? 'bg-error/[0.12] text-error' :
                'bg-surface-container-high text-on-surface-variant'
            }`}>
            <DeltaIcon size={11} />
            {delta}
          </span>
        )}
      </div>
      <div className="mt-3">
        <div className="text-headline-sm tnum text-on-surface leading-none">{value}</div>
        <div className="mt-1 body-sm text-on-surface-variant">{label}</div>
      </div>
    </motion.div>
  );
}
