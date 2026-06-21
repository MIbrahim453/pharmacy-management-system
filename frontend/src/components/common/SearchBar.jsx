import { useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', className, autoFocus }) {
  const ref = useRef(null);
  return (
    <div className={`relative ${className || ''}`}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="input-base pl-9 pr-8 text-sm h-9"
      />
      {value && (
        <button
          onClick={() => { onChange(''); ref.current?.focus(); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-on-surface-variant/70 hover:text-on-surface-variant"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
