import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, actions, className, badge }) {
  return (
    <motion.div
      className={`flex flex-col sm:flex-row sm:items-start gap-4 mb-6 ${className || ''}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-on-surface leading-tight">{title}</h2>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
