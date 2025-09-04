
'use client';

import { notFound, redirect, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Printer, Send } from 'lucide-react';
import { getApplicationById } from '@/app/actions';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import type { FullApplicationResponse } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { SurveyReportDialog } from '@/components/applications/survey-report-dialog';


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

// This is a client component, but we are fetching data on the server side
// and passing it down. To achieve that while using hooks like `useAuth`,
// we can wrap the main content in a client component.
export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  // Since this is a server component, we cannot use hooks directly here.
  // We'll fetch data and pass it to a client component that can use hooks.
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }
  
  // We will pass the token to a client component that will fetch and render.
  return <DetailPageClient id={id} accessToken={accessToken} />;
}


function DetailPageClient({ id, accessToken }: { id: string, accessToken: string }) {
  const { role } = useAuth();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [application, setApplication] = useState<FullApplicationResponse | null>(null);
  const [log, setLog] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const { data, log } = await getApplicationById(accessToken, id);
        setApplication(data as FullApplicationResponse | null);
        setLog(log);
        setIsLoading(false);
    }
    fetchData();
  }, [id, accessToken]);

  const showSdoButton = role === 'Admin' || role === 'SDAO';
  const backHref = from || '/dashboard/my-applications';

  if (isLoading) {
    return (
        <div className="flex-1 space-y-6 px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Loading Application...
            </h1>
        </div>
    )
  }

  if (!application) {
    return (
        <>
            <ServerLogHandler logs={[log]} />
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
      <ServerLogHandler logs={[log]} />
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
                        <DetailItem label="Aadhar Number" value={application.aadhar_no} />
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
                        <DetailItem label="District" value={application.district.name} />
                        <Separator />
                        <DetailItem label="Circle" value={application.circle_name} />
                        <Separator />
                         <DetailItem label="Sub-Division" value={application.sub_division.name} />
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
                            <Badge variant="secondary" className="text-base mt-1">{application.application_status.name}</Badge>
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
                          {showSdoButton && (
                            <SurveyReportDialog>
                               <Button variant="default">
                                  <Send className="mr-2"/>
                                  Send to SDO
                               </Button>
                            </SurveyReportDialog>
                           )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
    </>
  );
}