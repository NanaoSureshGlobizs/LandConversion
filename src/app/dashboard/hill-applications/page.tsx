
import { HillApplicationsTable } from '@/components/applications/hill-applications-table';
import { getHillApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function HillApplicationsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const { data: initialApplicationsData, log } = await getHillApplications(accessToken);

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Hill Applications</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage all applications for hill areas.
        </p>
        <HillApplicationsTable 
            initialData={initialApplicationsData} 
            accessToken={accessToken}
        />
      </div>
    </>
  );
}
