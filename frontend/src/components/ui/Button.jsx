import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  link: 'inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:underline focus:outline-none',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs gap-1 rounded-lg',
  sm: 'px-3 py-2 text-xs',
  md: '',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
  icon: 'p-2 rounded-xl',
  'icon-sm': 'p-1.5 rounded-lg',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, children, loading, icon, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children}
    </button>
  );
});

export default Button;
