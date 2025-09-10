
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApplicationById, getApplicationWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import { TrackingTimeline } from '@/components/applications/tracking-timeline';
import type { FullApplicationResponse, WorkflowItem } from '@/lib/definitions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ApplicationTrackingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const { data: application, log: appLog } = await getApplicationById(accessToken, id);
  const { data: workflow, log: workflowLog } = await getApplicationWorkflow(accessToken, id);
  
  if (!application) {
    return <div>Application not found.</div>;
  }

  return (
    <>
      <ServerLogHandler logs={[appLog, workflowLog]} />
      <div className="flex-1 space-y-6 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/my-applications`}>
              <ArrowLeft />
              <span className="sr-only">Back to applications</span>
            </Link>
          </Button>
          <div className="flex flex-col">
             <h1 className="text-2xl font-bold tracking-tight font-headline">
              Track Application
            </h1>
            <p className="text-muted-foreground font-mono">{application.application_no}</p>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Application History</CardTitle>
                <CardDescription>Follow the progress of your application through the system.</CardDescription>
            </CardHeader>
            <CardContent>
                {workflow && workflow.length > 0 ? (
                    <TrackingTimeline items={workflow as WorkflowItem[]} />
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No tracking history available for this application yet.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </>
  );
}
