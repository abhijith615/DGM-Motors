'use client';

import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { plates } from '@/lib/site';
import { Plate } from './Plate';

/**
 * Accessible lightbox.
 *
 * Modal dialogs are where portfolio sites usually drop accessibility, so this
 * one does the full job: it takes focus on open, traps Tab inside itself,
 * closes on Escape or backdrop click, restores focus to the trigger on close,
 * and locks background scroll. Arrow keys step between plates.
 */
export function Lightbox({
  index,
  onClose,
  onStep,
}: {
  index: number | null;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const open = index !== null;

  /* --- focus management + key handling ---------------------------------- */

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        onStep(1);
        return;
      }
      if (e.key === 'ArrowLeft') {
        onStep(-1);
        return;
      }
      if (e.key !== 'Tab') return;

      // Focus trap: cycle within the dialog's focusable children.
      const focusable = dialog.current?.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocus.current?.focus();
    };
  }, [open, onClose, onStep]);

  /* --- entrance --------------------------------------------------------- */

  useEffect(() => {
    if (!open || !dialog.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap
      .timeline()
      .fromTo(dialog.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
      .fromTo(
        '[data-lightbox-figure]',
        { scale: 0.94, y: 20 },
        { scale: 1, y: 0, duration: 0.9, ease: 'expo.out' },
        0.05
      );
  }, [open, index]);

  const onBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  const plate = plates[index];

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${plate.caption} — image ${index + 1} of ${plates.length}`}
      onClick={onBackdrop}
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md md:p-10"
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        aria-label="Close image viewer"
        data-cursor="link"
        className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red-hot)] md:right-8 md:top-8"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
          <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <figure data-lightbox-figure className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-16/10 w-full overflow-hidden border border-white/15">
          <Plate plate={plate} sizes="90vw" />
        </div>

        <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-title text-white">{plate.caption}</span>
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-white/50">
            {plate.meta}
          </span>
        </figcaption>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous image"
            data-cursor="link"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-[var(--color-red)]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path d="M10 2 4 8l6 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>

          <span className="font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-white/60">
            {String(index + 1).padStart(2, '0')} / {String(plates.length).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next image"
            data-cursor="link"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-[var(--color-red)]"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path d="M6 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </figure>
    </div>
  );
}
