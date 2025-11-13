
import { LegacyDataTable } from '@/components/applications/legacy-data-table';
import { getLegacyData } from '@/app/actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function LegacyDataPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  const { data, log } = await getLegacyData(accessToken);

  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-4 px-4 md:px-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Legacy Data</h1>
          <Button asChild>
            <Link href="/dashboard/legacy-data/new">
              <PlusCircle className="mr-2" />
              Create New
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage and view historical legacy data records.
        </p>
        <LegacyDataTable 
            initialData={data} 
            accessToken={accessToken}
        />
      </div>
    </>
  );
}

    