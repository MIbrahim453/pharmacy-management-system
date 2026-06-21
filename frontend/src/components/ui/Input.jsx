import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, helper, prefix, suffix, className, containerClass, ...props },
  ref,
) {
  return (
    <div className={`space-y-1.5 ${containerClass || ''}`}>
      {label && (
        <label className="block text-sm font-medium text-on-surface-variant">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-variant/70">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={`input-base ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''} ${error ? 'input-error' : ''} ${className || ''}`}
          {...props}
        />
        {suffix && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant/70">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
      {helper && !error && <p className="text-xs text-on-surface-variant">{helper}</p>}
    </div>
  );
});

export default Input;
