
import { LlmcRecommendationsTable } from '@/components/applications/llmc-recommendations-table';
import { getApplications, getApplicationStatuses } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function LlmcRecommendationsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

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
          <h1 className="text-3xl font-bold tracking-tight font-headline">LLMC Recommendations</h1>
        </div>
        <LlmcRecommendationsTable 
          initialData={initialApplicationsData} 
          accessToken={accessToken} 
          statuses={statuses}
        />
      </div>
    </>
  );
}
