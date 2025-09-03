
import { ReportsFromDlcTable } from '@/components/applications/reports-from-dlc-table';
import { getApplications, getDistricts } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function ReportsFromDlcPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const [{ data: initialApplicationsData, log: appLog }, { data: districts, log: districtLog }] = await Promise.all([
    getApplications(accessToken),
    getDistricts(accessToken)
  ]);
  

  return (
    <>
      <ServerLogHandler logs={[appLog, districtLog]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Reports from DLC</h1>
        </div>
        <ReportsFromDlcTable initialData={initialApplicationsData} districts={districts} accessToken={accessToken} />
      </div>
    </>
  );
}
