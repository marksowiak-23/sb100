/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SbAboutModal from './SbAboutModal';
import { AdminComponentTag } from './AdminComponentTag';

interface SbFooterLinksCardProps {
  className?: string;
}

export default function SbFooterLinksCard({ className = '' }: SbFooterLinksCardProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const footerLinks = [
    { text: 'Privacy', action: 'Privacy Policy' },
    { text: 'Terms', action: 'Terms of Service' },
    { text: 'Help', action: 'Help Center' },
    { text: 'About', action: 'About Storybook', isAbout: true },
    { text: 'Careers', action: 'Careers Page' }
  ];

  const handleAction = (link: typeof footerLinks[0]) => {
    if (link.isAbout || link.text.toLowerCase() === 'about') {
      setIsAboutOpen(true);
      return;
    }
    alert(`Opening page for ${link.action}...`);
  };

  return (
    <div className={`pt-2 pb-1 space-y-3 relative ${className}`}>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[10px] font-bold text-slate-400">
        {footerLinks.map((link) => (
          <button
            key={link.text}
            onClick={() => handleAction(link)}
            className="hover:text-slate-650 transition-colors cursor-pointer"
          >
            {link.text}
          </button>
        ))}
      </div>
      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        © 2026 Storybook, Inc.
      </div>

      {/* About Modal Dialog */}
      <SbAboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <AdminComponentTag name="SbFooterLinksCard" />
    </div>
  );
}
