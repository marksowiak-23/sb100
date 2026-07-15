/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SponsorsPanel from '@/src/components/SponsorsPanel';

export default function RightColumn() {
  const footerLinks = [
    { text: 'Privacy', action: 'Privacy Policy' },
    { text: 'Terms', action: 'Terms of Service' },
    { text: 'Help', action: 'Help Center' },
    { text: 'About', action: 'About Story Book' },
    { text: 'Careers', action: 'Careers Page' }
  ];

  const handleAction = (title: string) => {
    alert(`Opening page for ${title}...`);
  };

  return (
    <div className="space-y-8 flex flex-col justify-between h-full">
      <SponsorsPanel />

      {/* --- FOOTER CARD --- */}
      <div className="pt-2 pb-1 space-y-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-400">
          {footerLinks.map((link) => (
            <button
              key={link.text}
              onClick={() => handleAction(link.action)}
              className="hover:text-slate-650 transition-colors"
            >
              {link.text}
            </button>
          ))}
        </div>
        <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          © 2026 Story Book, Inc.
        </div>
      </div>

    </div>
  );
}
