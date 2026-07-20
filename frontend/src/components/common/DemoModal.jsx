import { ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DemoModal({ open, onClose, actionName = 'This action' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Demo Account Notice"
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      }
    >
      <div className="p-6 flex flex-col items-center text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <ShieldAlert size={24} />
        </div>
        <div className="text-base font-semibold text-on-surface">
          Action Restricted
        </div>
        <p className="text-sm text-on-surface-variant">
          {actionName} is disabled because this is a <strong>demo account</strong>.
        </p>
      </div>
    </Modal>
  );
}
