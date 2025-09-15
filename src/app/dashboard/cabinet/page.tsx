
import { ApplicationsTable } from '@/components/applications/applications-table';
import { getApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FilePlus2 } from 'lucide-react';

export default async function CabinetPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const workflowId = 31; // As per the user's diversion flow
  const { data: initialApplicationsData, log } = await getApplications(accessToken, 1, 10, workflowId);

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Cabinet</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage applications at the Cabinet level.
        </p>
        <ApplicationsTable initialData={initialApplicationsData} accessToken={accessToken} />
      </div>
    </>
  );
}
