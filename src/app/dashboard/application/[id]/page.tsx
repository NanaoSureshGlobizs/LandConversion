
// This is the parent Server Component that fetches data.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApplicationById, getApplicationStatuses } from '@/app/actions';
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

  // If the application is not found server-side, show a 404 page immediately.
  if (!application) {
    notFound();
  }

  // Pass server-fetched data to the client component
  // We are re-using the client component from my-applications, as the view is identical.
  return <DetailPageClient 
            id={id} 
            accessToken={accessToken} 
            initialApplication={application as FullApplicationResponse | null} 
            initialLog={[log, statusesLog]}
            statuses={statuses} 
        />;
}
