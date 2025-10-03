// This is the parent Server Component that fetches data.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApplicationById, getApplicationStatuses, getAreaUnits, getApplicationWorkflow } from '@/app/actions';
import { DetailPageClient } from '@/components/applications/detail-page-client';
import type { FullApplicationResponse, WorkflowItem } from '@/lib/definitions';
import { notFound } from 'next/navigation';

export default async function ApplicationDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const workflowSequenceId = searchParams.workflow_sequence_id as string | undefined;

  if (!accessToken) {
    redirect('/');
  }

  // Fetch all data on the server in a single batch
  const [
    { data: application, log: appLog },
    { data: statuses, log: statusesLog },
    { data: areaUnits, log: areaUnitsLog },
    { data: workflow, log: workflowLog }
  ] = await Promise.all([
    getApplicationById(accessToken, id, workflowSequenceId),
    getApplicationStatuses(accessToken),
    getAreaUnits(accessToken),
    getApplicationWorkflow(accessToken, id)
  ]);
  
  if (!application) {
    notFound();
  }

  // Pass all server-fetched data to the client component
  return <DetailPageClient 
            id={id} 
            accessToken={accessToken} 
            initialApplication={application as FullApplicationResponse | null} 
            initialWorkflow={workflow as WorkflowItem[] | null}
            initialLog={[appLog, statusesLog, areaUnitsLog, workflowLog]}
            statuses={statuses} 
            areaUnits={areaUnits}
        />;
}
