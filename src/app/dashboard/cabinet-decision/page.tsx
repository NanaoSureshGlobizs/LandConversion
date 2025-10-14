
import { CabinetDecisionTable } from '@/components/applications/cabinet-decision-table';
import { getApplications, getApplicationStatuses } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

const WORKFLOW_ID = 20;

export default async function CabinetDecisionPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const [
    { data: initialApplicationsData, log: appLog },
    { data: statuses, log: statusesLog }
  ] = await Promise.all([
    getApplications(accessToken, 1, 10, WORKFLOW_ID),
    getApplicationStatuses(accessToken)
  ]);
  

  return (
    <>
      <ServerLogHandler logs={[appLog, statusesLog]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Cabinet Decision</h1>
        </div>
        <CabinetDecisionTable
            initialData={initialApplicationsData as any} 
            accessToken={accessToken}
            statuses={statuses}
        />
      </div>
    </>
  );
}
