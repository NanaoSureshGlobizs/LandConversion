

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
  const workflowSequenceId = searchParams?.workflow_sequence_id as string | undefined;
  const isOtherApplication = searchParams?.source === 'other';

  if (!accessToken) {
    redirect('/');
  }

  // Fetch the main application data first to determine its type
  const { data: application, log: appLog } = await getApplicationById(accessToken, id, workflowSequenceId, isOtherApplication);

  if (!application) {
    notFound();
  }

  // Now, fetch other data in parallel, including the workflow with the correct flag
  const isHillApplication = application.application_type === 'hill';

  const [
    { data: statuses, log: statusesLog },
    { data: areaUnits, log: areaUnitsLog },
    { data: workflow, log: workflowLog }
  ] = await Promise.all([
    getApplicationStatuses(accessToken),
    getAreaUnits(accessToken),
    getApplicationWorkflow(accessToken, id, isHillApplication)
  ]);
  
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

    
