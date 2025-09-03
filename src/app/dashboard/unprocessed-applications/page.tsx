
import { UnprocessedApplicationsTable } from '@/components/applications/unprocessed-applications-table';
import { getApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function UnprocessedApplicationsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight font-headline">Unprocessed Applications</h1>
        </div>
        <UnprocessedApplicationsTable initialData={initialApplicationsData} />
      </div>
    </>
  );
}
