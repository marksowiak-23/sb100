/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface AdminComponentTagProps {
  name: string;
  className?: string;
}

/**
 * AdminComponentTag
 * Displays the React code component name in the lower right-hand corner of a panel
 * in relatively small font, only if adminDisplayComponentName is set to True.
 */
export function AdminComponentTag({ name, className = '' }: AdminComponentTagProps) {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('adminDisplayComponentName');
    return stored !== null ? stored === 'true' : true;
  });

  useEffect(() => {
    const handleStorage = () => {
      const stored = sessionStorage.getItem('adminDisplayComponentName');
      setEnabled(stored !== null ? stored === 'true' : true);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('admin-display-component-changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('admin-display-component-changed', handleStorage);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className={`absolute bottom-2.5 right-3.5 text-[10px] font-mono font-medium text-slate-400/80 bg-slate-100/60 px-1.5 py-0.5 rounded border border-slate-200/50 pointer-events-none select-none z-10 ${className}`}
      title={`React Component: ${name}`}
    >
      {name}
    </div>
  );
}

export default AdminComponentTag;
