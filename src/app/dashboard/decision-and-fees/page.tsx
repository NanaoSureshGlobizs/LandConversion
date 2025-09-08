
import { DecisionAndFeesTable } from '@/components/applications/decision-and-fees-table';
import { getApplications, getApplicationStatuses } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function DecisionAndFeesPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const workflowId = 16;

  const [
    { data: initialApplicationsData, log: appLog },
    { data: statuses, log: statusesLog }
  ] = await Promise.all([
    getApplications(accessToken, 1, 10, workflowId),
    getApplicationStatuses(accessToken)
  ]);


  return (
    <>
      <ServerLogHandler logs={[appLog, statusesLog]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Decision &amp; Fees</h1>
        </div>
        <DecisionAndFeesTable 
            initialData={initialApplicationsData} 
            accessToken={accessToken}
            statuses={statuses}
        />
      </div>
    </>
  );
}
