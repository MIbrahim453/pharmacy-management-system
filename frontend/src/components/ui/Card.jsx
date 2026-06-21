export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={`card-surface overflow-hidden ${hover ? 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer' : ''} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, action }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 border-b border-outline-variant/60 ${className || ''}`}>
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="ml-4 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return <h3 className={`text-sm font-semibold text-on-surface ${className || ''}`}>{children}</h3>;
}

export function CardBody({ className, children }) {
  return <div className={`p-5 ${className || ''}`}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 border-t border-outline-variant/60 bg-surface-container/60 ${className || ''}`}>
      {children}
    </div>
  );
}
