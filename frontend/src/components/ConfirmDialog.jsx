export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-ghost-solid" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
