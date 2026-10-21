import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessibility behaviour shared by modal dialogs:
 *  - Escape closes the dialog
 *  - Tab / Shift+Tab stay inside the dialog (focus trap)
 *  - focus moves into the dialog on open and returns to the trigger on close
 * Attach the returned ref to the element with role="dialog".
 */
export function useModalA11y(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  // Captured during the first render, i.e. before the dialog takes focus.
  const triggerRef = useRef<Element | null>(document.activeElement);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;
    if (!dialog) return;

    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));

    if (!dialog.contains(document.activeElement)) {
      (focusable()[0] ?? dialog).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, []);

  return dialogRef;
}
