
import { getLegacyDataById } from "@/app/actions";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { ServerLogHandler } from "@/components/debug/server-log-handler";
import { LegacyDataDetailClient } from "@/components/applications/legacy-data-detail-client";

export default async function LegacyDataDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const { data: legacyRecord, log } = await getLegacyDataById(accessToken, id);
  
  // We will now pass the legacyRecord to the client, even if it's null,
  // and let the client component handle the "not found" display.

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <LegacyDataDetailClient legacyRecord={legacyRecord} />
    </>
  );
}
