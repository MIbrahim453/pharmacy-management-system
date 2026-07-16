export function Table({ className, wrapperClassName = 'overflow-x-auto', children }) {
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <table className={`data-table ${className || ''}`}>{children}</table>
    </div>
  );
}

export function Th({ className, children, align = 'left' }) {
  return (
    <th
      style={{ textAlign: align }}
      className={`${className || ''}`.trim()}
    >
      {children}
    </th>
  );
}

export function Td({ className, children, align = 'left', mono = false }) {
  return (
    <td
      style={{ textAlign: align }}
      className={`${mono ? 'font-mono text-xs' : ''} ${className || ''}`.trim()}
    >
      {children}
    </td>
  );
}

export function TableEmpty({ cols, message = 'No records found', icon }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          {icon && <span className="text-outline-variant">{icon}</span>}
          <p className="text-sm text-on-surface-variant">{message}</p>
        </div>
      </td>
    </tr>
  );
}
