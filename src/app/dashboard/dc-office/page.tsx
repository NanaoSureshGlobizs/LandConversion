
import { DcOfficeTable } from '@/components/applications/dc-office-table';
import { getApplications, getApplicationStatuses } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

// DC Office handles multiple workflow steps, so we don't filter by a single ID here.
// The table or component logic can handle different actions based on the specific workflow_sequence_id of each application.
export default async function DcOfficePage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  // We fetch applications for both relevant workflow IDs.
  // A better approach might be a backend endpoint that accepts multiple IDs.
  // For now, we can fetch for one and let the user filter, or make two separate calls.
  const [
    { data: initialApplicationsDataBlc, log: appLogBlc },
    { data: initialApplicationsDataDc, log: appLogDc },
    { data: statuses, log: statusesLog }
  ] = await Promise.all([
    getApplications(accessToken, 1, 10, 23), // (BLC) DC
    getApplications(accessToken, 1, 10, 24), // DC
    getApplicationStatuses(accessToken)
  ]);
  
  // Combine the application lists
  const allApplications = [
    ...(initialApplicationsDataBlc?.applications || []),
    ...(initialApplicationsDataDc?.applications || [])
  ];
  
  // A simple way to deduplicate if an app somehow appeared in both lists
  const uniqueApplications = Array.from(new Map(allApplications.map(app => [app.id, app])).values());
  
  const combinedData = {
      applications: uniqueApplications,
      // Note: Pagination will be incorrect with this simple combination.
      // A proper implementation would require backend support for fetching multiple workflow IDs.
      pagination: initialApplicationsDataBlc?.pagination || initialApplicationsDataDc?.pagination
  }


  return (
    <>
      <ServerLogHandler logs={[appLogBlc, appLogDc, statusesLog]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">DC Office</h1>
        </div>
        <DcOfficeTable
            initialData={combinedData as any} 
            accessToken={accessToken}
            statuses={statuses}
        />
      </div>
    </>
  );
}
