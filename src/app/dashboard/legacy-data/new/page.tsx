
import { LegacyDataForm } from "@/components/applications/legacy-data-form";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';
import { ServerLogHandler } from "@/components/debug/server-log-handler";

export default async function NewLegacyDataPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  return (
    <>
      <ServerLogHandler logs={[]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Legacy Record</h1>
        </div>
        <p className="text-muted-foreground">
            Fill in the details below to create a new legacy data entry.
        </p>
        <LegacyDataForm accessToken={accessToken} />
      </div>
    </>
  );
}
