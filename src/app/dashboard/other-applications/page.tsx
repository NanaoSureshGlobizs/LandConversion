
import { OtherApplicationsTable } from '@/components/applications/other-applications-table';
import { getOtherApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

export default async function OtherApplicationsPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const { data: initialApplicationsData, log } = await getOtherApplications(accessToken);

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Unassigned Applications</h1>
        </div>
        <p className="text-muted-foreground">
          This list includes applications not directly assigned to you based on your jurisdiction.
        </p>
        <OtherApplicationsTable 
            initialData={initialApplicationsData} 
            accessToken={accessToken}
        />
      </div>
    </>
  );
}
