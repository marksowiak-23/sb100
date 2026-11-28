import React from 'react';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from '@/src/components/linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export const MailRightColumn: React.FC = () => {
  return (
    <div className="space-y-8 flex flex-col justify-between h-full relative">
      <SponsorsPanel />
      <LinksPanel />
      <AdminComponentTag name="MailRightColumn" />
    </div>
  );
};
