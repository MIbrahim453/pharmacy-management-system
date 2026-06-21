import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className || ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high text-on-surface-variant/70">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-on-surface-variant max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
