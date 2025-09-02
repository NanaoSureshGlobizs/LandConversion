import { ApplicationsTable } from '@/components/applications/applications-table';
import { getApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PaginatedApplications } from '@/lib/definitions';

export default async function TrackApplicationsPage() {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
  
    if (!accessToken) {
      redirect('/');
    }
  
    const applicationsData: PaginatedApplications | null = await getApplications(accessToken);

  return (
    <div className="flex-1 space-y-4 px-4 md:px-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Track Applications</h1>
      </div>
      <p className="text-muted-foreground">
        Search for any application to view its current status and history.
      </p>
      <ApplicationsTable data={applicationsData?.lists || []} />
    </div>
  );
}
