
import { ReportTable } from '@/components/applications/report-table';
import { getApplications, getApplicationStatuses } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function ReportPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const type = searchParams.type || 'conversion';

  if (!accessToken) {
    redirect('/');
  }

  const [{ data: initialApplicationsData, log: appLog }, { data: statuses, log: statusesLog }] = await Promise.all([
      getApplications(accessToken),
      getApplicationStatuses(accessToken)
  ]);


  return (
    <>
      <ServerLogHandler logs={[appLog, statusesLog]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Report ({type === 'conversion' ? 'Conversion' : 'Diversion'})</h1>
        </div>
        <ReportTable 
          initialData={initialApplicationsData} 
          accessToken={accessToken}
          statuses={statuses}
        />
      </div>
    </>
  );
}
