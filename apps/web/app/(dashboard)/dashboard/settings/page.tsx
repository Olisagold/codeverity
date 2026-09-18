'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SettingsTabs, SettingsCard } from '@/components/dashboard/SettingsTabs';
import { organization } from '@/lib/dashboard';

export default function SettingsGeneralPage() {
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [saved, setSaved] = useState(false);

  const inputClasses =
    'mt-2 h-11 w-full max-w-md rounded-lg border border-line bg-base px-3 text-[13.5px] text-white transition-colors duration-150 ease-out hover:border-line-strong focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

  return (
    <>
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <SettingsTabs />

      <SettingsCard title="General">
        <div className="space-y-5">
          <div>
            <label htmlFor="org-name" className="text-[13px] font-medium text-white">
              Organization name
            </label>
            <input
              id="org-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="org-slug" className="text-[13px] font-medium text-white">
              Organization slug
            </label>
            <input
              id="org-slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSaved(false);
              }}
              className={`${inputClasses} font-mono text-[12.5px]`}
            />
          </div>
          <div className="flex items-center gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Save changes
            </button>
            <span aria-live="polite" className="text-[12.5px] text-ok">
              {saved ? 'Changes saved.' : ''}
            </span>
          </div>
        </div>
      </SettingsCard>
    </>
  );
}
