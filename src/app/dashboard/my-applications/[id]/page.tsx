
// This is the parent Server Component that fetches data.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApplicationById } from '@/app/actions';
import { DetailPageClient } from './detail-page-client';
import type { FullApplicationResponse } from '@/lib/definitions';

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  // Fetch data on the server
  const { data: application, log } = await getApplicationById(accessToken, id);

  // Pass server-fetched data to the client component
  return <DetailPageClient id={id} accessToken={accessToken} initialApplication={application as FullApplicationResponse | null} initialLog={log} />;
}
