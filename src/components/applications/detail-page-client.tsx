

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
import { getApplicationById, getApplicationWorkflow, getSurveyQuestions } from '@/app/actions';
import Link from 'next/link';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import type { FullApplicationResponse, ApplicationStatusOption, WorkflowItem, AreaUnit } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SurveyReportDialog } from '@/components/applications/survey-report-dialog';
import { ForwardForm } from '@/components/applications/forward-form';
import { RejectForm } from '@/components/applications/reject-form';
import { TrackingTimeline } from '@/components/applications/tracking-timeline';
import { MarsacReportDialog } from './marsac-report-dialog';
import { FeeOverwriteDialog } from './fee-overwrite-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';


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

interface SurveyQuestion {
    id: number;
    name: string;
}

// This is the Client Component that handles rendering and interactivity.
export function DetailPageClient({ id, accessToken, initialApplication, initialLog, statuses, areaUnits }: { id: string, accessToken: string, initialApplication: FullApplicationResponse | null, initialLog: (string | undefined)[], statuses: ApplicationStatusOption[], areaUnits?: AreaUnit[] }) {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const type = searchParams.get('type');
  const actionContext = searchParams.get('actionContext');

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [application, setApplication] = useState<FullApplicationResponse | null>(initialApplication);
  const [workflow, setWorkflow] = useState<WorkflowItem[] | null>(null);
  const [log, setLog] = useState<(string|undefined)[]>(initialLog);
  const [isLoading, setIsLoading] = useState(!initialApplication);
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const hasFetched = useRef(false);


  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const workflowSequenceId = searchParams.get('workflow_sequence_id');
    const [{ data: appData, log: appLog }, { data: workflowData, log: workflowLog }] = await Promise.all([
        getApplicationById(accessToken, id, workflowSequenceId),
        getApplicationWorkflow(accessToken, id)
    ]);
    
    setApplication(appData as FullApplicationResponse | null);
    setWorkflow(workflowData as WorkflowItem[] | null);
    setLog(prev => [...prev, appLog, workflowLog]);
    setIsLoading(false);
  },[accessToken, id, searchParams]);


  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

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

  const handleOpenSurveyDialog = async () => {
    if (!application || !role) {
        toast({ title: "Error", description: "Application data or user role not available.", variant: "destructive" });
        return;
    }

    setIsFetchingQuestions(true);

    try {
        const workflowSequenceId = searchParams.get('workflow_sequence_id');
        if (!workflowSequenceId) {
            toast({ title: "Error", description: "Workflow ID is missing from the URL.", variant: "destructive" });
            return;
        }
        
        const { data, log } = await getSurveyQuestions(role, application.land_purpose_id, parseInt(workflowSequenceId), accessToken);
        addLog(log || "Log for getSurveyQuestions");

        if (data) {
            setSurveyQuestions(data as SurveyQuestion[]);
        } else {
            setSurveyQuestions([]);
        }
        setIsSurveyDialogOpen(true);
    } catch (error) {
        toast({ title: "Failed to Fetch Questions", description: "Could not load survey questions from the server.", variant: "destructive" });
        setSurveyQuestions([]);
    } finally {
        setIsFetchingQuestions(false);
    }
  };


  let backHref = '/dashboard/my-applications';
  if (from) {
      backHref = from;
      if(type) {
        backHref += `?type=${type}`;
      }
  }

  const renderActionButtons = () => {
    // Prioritize actionContext from the URL. This is the source of truth for actions on this page.
    const currentAction = actionContext || application?.form_type;

    switch (currentAction) {
        case 'Forward':
            return (
                <div className='flex gap-2'>
                    <ForwardForm applicationId={id} accessToken={accessToken} onSuccess={refreshData}>
                        <Button variant="default" className="flex-1">
                            {application?.button_name || 'Forward'}
                        </Button>
                    </ForwardForm>
                    <RejectForm applicationId={id} accessToken={accessToken} onSuccess={refreshData}>
                        <Button variant="destructive">Reject</Button>
                    </RejectForm>
                </div>
            );
        case 'Survey':
        case 'KML_Survey':
        case 'Survey_2':
        case 'Survey_3':
        case 'Survey_4':
             return (
                <>
                  <Button variant="default" onClick={handleOpenSurveyDialog} disabled={isFetchingQuestions}>
                      {isFetchingQuestions ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2"/>}
                      {application?.button_name || 'Survey Report'}
                   </Button>
                   {application && (
                     <SurveyReportDialog
                        isOpen={isSurveyDialogOpen}
                        onOpenChange={setIsSurveyDialogOpen}
                        application={application} 
                        questions={surveyQuestions}
                        statuses={statuses} 
                        accessToken={accessToken} 
                        onSuccess={refreshData}
                     />
                   )}
                </>
             );
        case 'MARSAC_Report':
            return (
                <MarsacReportDialog application={application!} accessToken={accessToken} onSuccess={refreshData} areaUnits={areaUnits || []}>
                    <Button variant="default">
                        <FileText className="mr-2" />
                        {application?.button_name || 'MARSAC Report'}
                    </Button>
                </MarsacReportDialog>
            );
        case 'Fee_report':
             return (
                <FeeOverwriteDialog application={application!} accessToken={accessToken} onSuccess={refreshData}>
                    <Button variant="default">
                        <FileText className="mr-2" />
                        {application?.button_name || 'Fee Report'}
                    </Button>
                </FeeOverwriteDialog>
             );
        case 'LLMC_Report':
            // Logic for LLMC Report if needed
            return null; // Or a specific button
        default:
            // Fallback for general application view actions, like edit
            if (application?.can_edit) {
                 return (
                     <Button variant="default" asChild>
                        <Link href={`/dashboard/my-applications/${id}/edit`}>
                           <Edit className="mr-2" />
                           Edit Application
                        </Link>
                     </Button>
                 );
            }
            return null;
    }
  };


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
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={backHref}>
                            <ArrowLeft />
                            <span className="sr-only">Back to applications</span>
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">
                        Application Not Found
                    </h1>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-destructive'>Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>The application with ID <span className='font-mono bg-muted p-1 rounded-sm'>{id}</span> could not be loaded.</p>
                    <p className='text-muted-foreground text-sm mt-2'>This may be because the application does not exist or there was a problem fetching the data. Please check the ID and try again.</p>
                  </CardContent>
                </Card>
            </div>
        </>
    );
  }

  return (
    <>
      <ServerLogHandler logs={log} />
      <div className="flex-1 space-y-6 px-4 md:px-8">
          <div className="flex items-center gap-4 no-print">
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
                                            <span className="font-mono text-sm capitalize">{file.file_name.replace(/_/g, ' ')}</span>
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
                   <Card className="no-print">
                      <CardHeader>
                          <CardTitle>Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                          <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="mr-2"/>
                            Print Application
                          </Button>
                          {renderActionButtons()}
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
