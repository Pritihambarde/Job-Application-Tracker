import { useId } from 'react';
import { useModalA11y } from '../hooks/useModalA11y';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useModalA11y(onCancel);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="modal modal-small"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-title">{title}</h2>
        <p id={messageId} className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn-ghost-solid" onClick={onCancel} autoFocus>Cancel</button>
          <button type="button" className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
