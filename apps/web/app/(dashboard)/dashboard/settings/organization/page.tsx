'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { SettingsTabs, SettingsCard } from '@/components/dashboard/SettingsTabs';
import { Skeleton } from '@/components/dashboard/Skeleton';
import { useSession } from '@/hooks/useSession';
import { formatDate } from '@/lib/format';

export default function SettingsOrganizationPage() {
  const session = useSession();
  const organization = session?.organization;

  return (
    <>
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <SettingsTabs />

      {!organization ? (
        <Skeleton rows={4} />
      ) : (
        <div className="space-y-4">
          <SettingsCard title="Organization">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
              {[
                { label: 'Name', value: organization.name },
                { label: 'Created', value: formatDate(organization.created_at) },
                { label: 'Organization ID', value: organization.id },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-[12.5px] text-faint">{item.label}</dt>
                  <dd className="mt-1.5 break-all font-mono text-[12.5px] text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </SettingsCard>

          <SettingsCard title="Members">
            <ul className="divide-y divide-line-soft">
              {organization.members.map((member) => (
                <li key={member.email} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-[13.5px] text-white">{member.name}</p>
                  <p className="font-mono text-[11.5px] text-faint">{member.email}</p>
                </li>
              ))}
            </ul>
          </SettingsCard>
        </div>
      )}
    </>
  );
}
