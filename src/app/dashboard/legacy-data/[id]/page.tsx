
import { getLegacyDataById } from "@/app/actions";
import { cookies } from "next/headers";
import { notFound, redirect } from 'next/navigation';
import { ServerLogHandler } from "@/components/debug/server-log-handler";
import type { FullLegacyDataResponse } from "@/lib/definitions";
import { LegacyDataDetailClient } from "@/components/applications/legacy-data-detail-client";

export default async function LegacyDataDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const { data: legacyRecord, log } = await getLegacyDataById(accessToken, id);
  
  if (!legacyRecord) {
    notFound();
  }

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <LegacyDataDetailClient legacyRecord={legacyRecord} />
    </>
  );
}

      