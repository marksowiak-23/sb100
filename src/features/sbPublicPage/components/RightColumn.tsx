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

  const handleLinkClick = (text: string) => {
    alert(`Navigating to ${text}...`);
  };

  return (
    <div className="space-y-8 flex flex-col justify-between h-full">
      {/* Sponsors Container */}
      <SponsorsPanel />

      {/* Footer Links & Copyright */}
      <div className="pt-6 border-t border-slate-100/70 space-y-4">
        {/* Navigation list */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-400">
          {footerLinks.map((link) => (
            <button
              key={link.text}
              onClick={() => handleLinkClick(link.action)}
              className="hover:text-slate-650 transition-colors"
            >
              {link.text}
            </button>
          ))}
        </div>

        {/* Corporate copyright signature */}
        <div className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">
          © 2026 Story Book, Inc.
        </div>
      </div>
    </div>
  );
}
