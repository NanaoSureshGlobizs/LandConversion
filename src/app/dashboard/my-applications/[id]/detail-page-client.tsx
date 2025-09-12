
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Printer, Edit, Loader2 } from 'lucide-react';
import { getApplicationById, getApplicationWorkflow } from '@/app/actions';
import Link from 'next/link';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import type { FullApplicationResponse, ApplicationStatusOption, WorkflowItem } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { SurveyReportDialog } from '@/components/applications/survey-report-dialog';
import { ForwardForm } from '@/components/applications/forward-form';
import { RejectForm } from '@/components/applications/reject-form';
import { TrackingTimeline } from '@/components/applications/tracking-timeline';


function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number | undefined | null;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-right">{value || '-'}</p>
    </div>
  );
}

// This is the Client Component that handles rendering and interactivity.
export function DetailPageClient({ id, accessToken, initialApplication, initialLog, statuses }: { id: string, accessToken: string, initialApplication: FullApplicationResponse | null, initialLog: (string | undefined)[], statuses: ApplicationStatusOption[] }) {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const type = searchParams.get('type');

  const [application, setApplication] = useState<FullApplicationResponse | null>(initialApplication);
  const [workflow, setWorkflow] = useState<WorkflowItem[] | null>(null);
  const [log, setLog] = useState<(string|undefined)[]>(initialLog);
  const [isLoading, setIsLoading] = useState(!initialApplication);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const [{ data: appData, log: appLog }, { data: workflowData, log: workflowLog }] = await Promise.all([
        getApplicationById(accessToken, id),
        getApplicationWorkflow(accessToken, id)
    ]);
    
    setApplication(appData as FullApplicationResponse | null);
    setWorkflow(workflowData as WorkflowItem[] | null);
    setLog(prev => [...prev, appLog, workflowLog]);
    setIsLoading(false);
  },[accessToken, id]);


  useEffect(() => {
    // If data wasn't passed from server, fetch it on the client
    if (!initialApplication) {
        refreshData();
    } else {
        // Fetch workflow data even if application data is present
        getApplicationWorkflow(accessToken, id).then(({ data, log }) => {
            setWorkflow(data as WorkflowItem[] | null);
            setLog(prev => [...prev, log]);
        })
    }
  }, [id, accessToken, initialApplication, refreshData]);

  const canShowSurveyButton = (role === 'Admin' || role === 'SDAO') && from === '/dashboard/pending-enquiries';
  
  let backHref = '/dashboard/my-applications';
  if (from) {
      backHref = from;
      if(type) {
        backHref += `?type=${type}`;
      }
  }


  if (isLoading) {
    return (
        <div className="flex-1 space-y-6 px-4 md:px-8 flex items-center justify-center min-h-[50vh]">
            <Loader2 className='h-8 w-8 animate-spin' />
            <h1 className="text-xl font-bold tracking-tight font-headline ml-4">
                Loading Application...
            </h1>
        </div>
    )
  }

  if (!application) {
    return (
        <>
            <ServerLogHandler logs={log} />
            <div className="flex-1 space-y-6 px-4 md:px-8">
                 <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Application Not Found
                </h1>
                <p>The application with ID {id} could not be loaded. This might be due to a server error or invalid data.</p>
                <p className='text-muted-foreground text-sm'>Check the debug panel for the full server response.</p>
            </div>
        </>
    );
  }

  return (
    <>
      <ServerLogHandler logs={log} />
      <div className="flex-1 space-y-6 px-4 md:px-8">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                  <Link href={backHref}>
                      <ArrowLeft />
                      <span className="sr-only">Back to applications</span>
                  </Link>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight font-headline">
                  Application Details
              </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <DetailItem label="Applicant Name" value={application.applicant_name} />
                        <Separator />
                        <DetailItem label="Date of Birth" value={application.date_of_birth} />
                         <Separator />
                        <DetailItem label="Aadhaar Number" value={application.aadhar_no} />
                         <Separator />
                        <DetailItem label="Phone Number" value={application.phone_number} />
                         <Separator />
                        <DetailItem label="Email" value={application.email} />
                         <Separator />
                        <DetailItem label="Address" value={application.address} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Land & Location Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <DetailItem label="District" value={application.district?.name} />
                        <Separator />
                        <DetailItem label="Circle" value={application.circle_name} />
                        <Separator />
                         <DetailItem label="Sub-Division" value={application.sub_division?.name} />
                        <Separator />
                        <DetailItem label="Village" value={application.village_name} />
                        <Separator />
                        <DetailItem label="Location Type" value={application.location_name} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Plot & Purpose Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <DetailItem label="Patta No." value={application.patta_no} />
                        <Separator />
                        <DetailItem label="Dag No." value={application.dag_no} />
                        <Separator />
                        <DetailItem label="Original Area of Plot" value={`${application.original_area_of_plot} ${application.land_area_unit_name}`} />
                        <Separator />
                        <DetailItem label="Area for Change" value={`${application.area_applied_for_conversion} ${application.application_area_unit_name}`} />
                        <Separator />
                        <DetailItem label="Present Land Classification" value={application.land_classification} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>
                        Attached documents for the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {application.upload_files && application.upload_files.length > 0 ? (
                            <div className="space-y-2">
                                {application.upload_files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-muted-foreground" />
                                            <span className="font-mono text-sm">{file.file_name}</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2"/>
                                                View
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No documents attached to this application.</p>
                        )}
                    </CardContent>
                </Card>

              </div>

              <div className="lg:col-span-1 space-y-6">
                  <Card>
                      <CardHeader>
                          <CardTitle>Application Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Application ID</p>
                            <p className="font-semibold text-lg font-mono">{application.application_no}</p>
                          </div>
                           <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="secondary" className="text-base mt-1">{application.application_status?.name}</Badge>
                          </div>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                          <Button variant="outline">
                            <Printer className="mr-2"/>
                            Print Application
                          </Button>
                          {application.can_edit && (
                             <Button variant="default" asChild>
                                <Link href={`/dashboard/my-applications/${id}/edit`}>
                                   <Edit className="mr-2" />
                                   Edit Application
                                </Link>
                             </Button>
                          )}
                          {application.can_forward && application.form_type === 'Forward' && (
                            <div className='flex gap-2'>
                                <ForwardForm applicationId={id} accessToken={accessToken} onSuccess={refreshData}>
                                    <Button variant="default" className="flex-1">
                                        {application.button_name || 'Forward'}
                                    </Button>
                                </ForwardForm>
                                <RejectForm applicationId={id} accessToken={accessToken} onSuccess={refreshData}>
                                    <Button variant="destructive">Reject</Button>
                                </RejectForm>
                            </div>
                          )}
                          {canShowSurveyButton && (
                            <SurveyReportDialog application={application} statuses={statuses} accessToken={accessToken} onSuccess={refreshData}>
                               <Button variant="default">
                                  <FileText className="mr-2"/>
                                  Survey Report
                               </Button>
                            </SurveyReportDialog>
                           )}
                      </CardContent>
                  </Card>
                  {workflow && (
                    <Card>
                        <CardHeader>
                          <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <TrackingTimeline items={workflow} />
                        </CardContent>
                    </Card>
                  )}
              </div>
          </div>
      </div>
    </>
  );
}
