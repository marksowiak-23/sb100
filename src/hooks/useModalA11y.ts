/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

interface UseModalA11yOptions {
  isOpen: boolean;
  onClose?: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

/**
 * Shared modal accessibility hook:
 * - Closes the modal when the Escape key is pressed
 * - Locks body scroll while open
 * - Restores focus to the triggering element on close
 * - Returns standard dialog ARIA attributes
 */
export function useModalA11y({
  isOpen,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
}: UseModalA11yOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    if (lockScroll) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (lockScroll) {
        document.body.style.overflow = prevOverflow;
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus();
        } catch {}
      }
    };
  }, [isOpen, closeOnEscape, lockScroll]);

  return {
    dialogProps: {
      role: 'dialog' as const,
      'aria-modal': true as const,
    },
  };
}
