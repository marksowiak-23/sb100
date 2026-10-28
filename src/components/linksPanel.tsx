/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import AboutModelPanel from './aboutModelPanel';
import TermsModelPanel from './termsModelPanel';
import PrivacyModelPanel from './privacyModelPanel';
import { AdminComponentTag } from './AdminComponentTag';

export interface LinksPanelProps {
  className?: string;
}

export type SbFooterLinksCardProps = LinksPanelProps;

export default function LinksPanel({ className = '' }: LinksPanelProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const footerLinks = [
    { text: 'Privacy', action: 'Privacy Policy', isPrivacy: true },
    { text: 'Terms', action: 'Terms of Service', isTerms: true },
    { text: 'About', action: 'About Storybook', isAbout: true }
  ];

  const handleAction = (link: typeof footerLinks[0]) => {
    if (link.isAbout || link.text.toLowerCase() === 'about') {
      setIsAboutOpen(true);
      return;
    }
    if (link.isTerms || link.text.toLowerCase() === 'terms') {
      setIsTermsOpen(true);
      return;
    }
    if (link.isPrivacy || link.text.toLowerCase() === 'privacy') {
      setIsPrivacyOpen(true);
      return;
    }
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
      <AboutModelPanel isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Terms of Service Modal Dialog */}
      <TermsModelPanel isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />

      {/* Privacy Policy Modal Dialog */}
      <PrivacyModelPanel isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      <AdminComponentTag name="linksPanel" />
    </div>
  );
}

export { LinksPanel, LinksPanel as linksPanel, LinksPanel as SbFooterLinksCard };
