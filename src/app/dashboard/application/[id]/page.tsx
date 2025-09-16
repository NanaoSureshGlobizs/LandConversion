

// This is the parent Server Component that fetches data.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApplicationById, getApplicationStatuses, getAreaUnits } from '@/app/actions';
import { DetailPageClient } from '@/components/applications/detail-page-client';
import type { FullApplicationResponse } from '@/lib/definitions';
import { notFound } from 'next/navigation';

export default async function ApplicationDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const workflowSequenceId = searchParams.workflow_sequence_id as string | undefined;

  if (!accessToken) {
    redirect('/');
  }

  // Fetch data on the server
  const { data: application, log } = await getApplicationById(accessToken, id, workflowSequenceId);
  const { data: statuses, log: statusesLog } = await getApplicationStatuses(accessToken);
  const { data: areaUnits, log: areaUnitsLog } = await getAreaUnits(accessToken);


  // We will no longer throw a 404 here. Instead, we'll pass the null application
  // to the client component and let it handle the "not found" state gracefully.

  // Pass server-fetched data to the client component
  return <DetailPageClient 
            id={id} 
            accessToken={accessToken} 
            initialApplication={application as FullApplicationResponse | null} 
            initialLog={[log, statusesLog, areaUnitsLog]}
            statuses={statuses} 
            areaUnits={areaUnits}
        />;
}
