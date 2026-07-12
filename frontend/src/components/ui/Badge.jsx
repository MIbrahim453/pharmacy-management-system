

const variants = {
  default: 'bg-surface-container-high text-on-surface-variant',
  primary: 'bg-primary/[0.12] text-primary',
  success: 'bg-primary/[0.12] text-primary',
  warning: 'bg-warning/[0.12] text-warning',
  danger: 'bg-error/[0.12] text-error',
  info: 'bg-tertiary/[0.12] text-tertiary',
};

const statusToVariant = {
  Paid: 'success',
  paid: 'success',
  Unpaid: 'danger',
  unpaid: 'danger',
  Active: 'success',
  active: 'success',
  Inactive: 'default',
  inactive: 'default',
  Pending: 'warning',
  pending: 'warning',
  Success: 'success',
  success: 'success',
  Failed: 'danger',
  failed: 'danger',
  Suspended: 'danger',
  suspended: 'danger',
};

export default function Badge({ variant = 'default', status, dot, className, children }) {
  const resolvedVariant = status ? (statusToVariant[status] || 'default') : variant;
  const classes = variants[resolvedVariant] || variants.default;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${classes} ${className || ''}`}>
      {(dot || status) && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children ?? status}
    </span>
  );
}
