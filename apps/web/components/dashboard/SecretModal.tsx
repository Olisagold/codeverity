import React from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { Modal } from '@/components/dashboard/Modal';
import { CopyButton } from '@/components/ui/CopyButton';

interface SecretModalProps {
  secret: string | null;
  title: string;
  description: string;
  onClose: () => void;
}

/** Shows a secret once, with a copy button. */
export function SecretModal({ secret, title, description, onClose }: SecretModalProps) {
  return (
    <Modal
      open={secret !== null}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Done
        </button>
      }
    >
      <p className="text-[13.5px] leading-relaxed text-muted">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-line bg-base px-3 py-2.5">
        <code className="truncate font-mono text-[12.5px] text-white">{secret}</code>
        <CopyButton value={secret ?? ''} />
      </div>
      <p className="mt-4 flex items-start gap-2 text-[13px] text-amber">
        <TriangleAlertIcon aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        You won&apos;t be able to view this secret again.
      </p>
    </Modal>
  );
}
