
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import { getApplicationById } from '@/app/actions';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import type { FullApplicationResponse } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


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

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    redirect('/');
  }

  const { data: applicationResponse, log } = await getApplicationById(accessToken, id) as { data: FullApplicationResponse | null, log: string | undefined };
  
  if (!applicationResponse || !applicationResponse.owner_details) {
    return (
        <>
            <ServerLogHandler logs={[log]} />
            <div className="flex-1 space-y-6 px-4 md:px-8">
                 <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Application Not Found
                </h1>
                <p>The application with ID {id} could not be loaded.</p>
                <pre className="mt-4 p-4 bg-muted rounded-md text-sm overflow-auto">
                    {log}
                </pre>
            </div>
        </>
    );
  }

  const { owner_details: application, documents } = applicationResponse;


  return (
    <>
      <ServerLogHandler logs={[log]} />
      <div className="flex-1 space-y-6 px-4 md:px-8">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                  <Link href="/dashboard/my-applications">
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
                        <DetailItem label="Owner Name" value={application.owner_name} />
                        <Separator />
                        <DetailItem label="Date of Birth" value={application.dob} />
                         <Separator />
                        <DetailItem label="Aadhar Number" value={application.aadhar} />
                         <Separator />
                        <DetailItem label="Phone Number" value={application.phone_number} />
                         <Separator />
                        <DetailItem label="Email" value={application.email} />
                         <Separator />
                        <DetailItem label="Owner Address" value={application.owner_address} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Land & Location Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <DetailItem label="District" value={application.district} />
                        <Separator />
                        <DetailItem label="SDO Circle" value={application.sdo_circle} />
                        <Separator />
                        <DetailItem label="Village" value={application.village} />
                        <Separator />
                        <DetailItem label="Village Number" value={application.village_number} />
                         <Separator />
                        <DetailItem label="Location Type" value={application.location_type} />
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
                        <DetailItem label="Original Area of Plot" value={`${application.original_area_of_plot} ${application.original_area_of_plot_unit}`} />
                        <Separator />
                        <DetailItem label="Area for Change" value={`${application.area_for_change} ${application.area_for_change_unit}`} />
                        <Separator />
                        <DetailItem label="Present Land Classification" value={application.land_classification} />
                        <Separator />
                        <DetailItem label="Purpose" value={application.purpose} />
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
                        {documents && Object.keys(documents).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(documents).map(([groupName, files]) => (
                                    <div key={groupName}>
                                        <h4 className="font-semibold capitalize mb-3 text-lg">{groupName.replace(/_/g, ' ')}</h4>
                                        <div className="space-y-2">
                                            {files.map((file, index) => (
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
                            <p className="font-semibold text-lg font-mono">{id}</p>
                          </div>
                           <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="secondary" className="text-base mt-1">{application.status}</Badge>
                          </div>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                          {/* <Button>
                            <Edit className="mr-2"/>
                            Edit Application
                          </Button> */}
                          <Button variant="outline">
                            <Printer className="mr-2"/>
                            Print Application
                          </Button>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
    </>
  );
}
