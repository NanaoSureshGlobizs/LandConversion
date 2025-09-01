'use client';

import { NewApplicationForm } from '@/components/applications/new-application-form';
import { mockApplications } from '@/lib/mock-data';
import { notFound, useParams } from 'next/navigation';

export default function EditApplicationPage() {
  const params = useParams();
  const { id } = params;
  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Edit Application: {application.id}
        </h1>
      </div>
      <p className="text-muted-foreground">
        Modify the details for the land use change application.
      </p>
      <NewApplicationForm existingApplication={application} />
    </div>
  );
}
