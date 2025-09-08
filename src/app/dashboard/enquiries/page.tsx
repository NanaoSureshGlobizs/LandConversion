
import { EnquiriesTable } from '@/components/applications/enquiries-table';
import { getApplications } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';

const WORKFLOW_MAP = {
  conversion: 7,
  diversion: 3,
};

export default async function EnquiriesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const type = (searchParams.type || 'conversion') as keyof typeof WORKFLOW_MAP;
  const pageTitle = `Enquiries (${type.charAt(0).toUpperCase() + type.slice(1)})`;

  if (!accessToken) {
    redirect('/');
  }

  const workflowId = WORKFLOW_MAP[type] || null;
  const { data: initialApplicationsData, log } = await getApplications(accessToken, 1, 10, workflowId);

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage all enquiries.
        </p>
        <EnquiriesTable initialData={initialApplicationsData} accessToken={accessToken} />
      </div>
    </>
  );
}
