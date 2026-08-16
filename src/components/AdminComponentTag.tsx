/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AdminComponentTagProps {
  name: string;
  className?: string;
}

/**
 * AdminComponentTag
 * Displays the React code component name in the lower right-hand corner of a panel
 * in relatively small font, controlled globally via the VITE_ADMIN_DISPLAY_COMPONENT_NAME
 * environment variable.
 */
export function AdminComponentTag({ name, className = '' }: AdminComponentTagProps) {
  const envVal = import.meta.env.VITE_ADMIN_DISPLAY_COMPONENT_NAME;
  const isEnabled = envVal === 'true' || envVal === true || envVal === '1';

  if (!isEnabled) return null;

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
