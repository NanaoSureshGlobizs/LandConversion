
import { ApplicationsTable } from '@/components/applications/applications-table';
import { getApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PaginatedApplications } from '@/lib/definitions';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus2 } from 'lucide-react';

export default async function MyApplicationsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const { data: initialApplicationsData, log } = await getApplications();

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Applications</h1>
          <Button asChild>
            <Link href="/dashboard/new-application">
              <FilePlus2 className="mr-2" />
              New Application
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          View and manage all your past and current land use applications.
        </p>
        <ApplicationsTable initialData={initialApplicationsData} />
      </div>
    </>
  );
}

    