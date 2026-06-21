import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-full mx-4',
};

export default function Modal({ open, onClose, title, subtitle, size = 'md', children, footer, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Dialog */}
          <motion.div
            className={`relative z-10 w-full flex flex-col bg-surface-container-lowest rounded-2xl shadow-modal max-h-[90dvh] overflow-hidden ${sizes[size]} ${className || ''}`}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
          >
            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-outline-variant/60 shrink-0">
                <div>
                  {title && <h2 className="text-base font-semibold text-on-surface">{title}</h2>}
                  {subtitle && <p className="mt-0.5 text-sm text-on-surface-variant">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-xl p-1.5 text-on-surface-variant/70 hover:bg-surface-container hover:text-on-surface-variant transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-outline-variant/60 bg-surface-container/60 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
