import { createPortal } from "react-dom";
import { ConfirmButton, CancelButton } from "./Buttons";
import "../styles/modal.css";

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "확인",
  cancelLabel = "취소",
}) {
  if (!open) return null;

  const stop = (e) => {
    e.stopPropagation();
  };

  const modal = (
    <section
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
    >
      <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={stop}>
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <p id="modal-desc" className="modal-desc">
            {message}
          </p>
          <div className="modal-actions">
            <CancelButton
              className="modal-btn modal-btn--cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </CancelButton>
            <ConfirmButton
              className="modal-btn modal-btn--confirm"
              onClick={onConfirm}
            >
              {confirmLabel}
            </ConfirmButton>
          </div>
        </div>
      </div>
    </section>
  );

  return createPortal(modal, document.body);
}
