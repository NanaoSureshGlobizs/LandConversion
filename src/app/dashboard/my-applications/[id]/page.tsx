
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Pencil, FileText } from 'lucide-react';
import { getApplicationById } from '@/app/actions';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ServerLogHandler } from '@/components/debug/server-log-handler';
import type { FullApplicationResponse } from '@/lib/definitions';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
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
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link href="/dashboard/my-applications">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Application Details
          </h1>
          <div className="flex-1" />
          {/* <Button asChild>
            <Link href={`/dashboard/my-applications/${id}/edit`}>
              <Pencil className="mr-2" />
              Edit
            </Link>
          </Button> */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem label="Owner Name" value={application.owner_name} />
              <DetailItem label="Email" value={application.email} />
              <DetailItem label="Phone Number" value={application.phone_number} />
              <DetailItem label="DOB" value={application.dob} />
              <DetailItem label="Aadhar" value={application.aadhar} />
              <DetailItem label="Owner Address" value={application.owner_address} />
              <Separator className="md:col-span-2 lg:col-span-3 my-2" />
              <DetailItem label="Patta No." value={application.patta_no} />
              <DetailItem label="Dag No." value={application.dag_no} />
              <DetailItem label="Original Area of Plot" value={`${application.original_area_of_plot} ${application.original_area_of_plot_unit}`} />
              <DetailItem label="Area for Change" value={`${application.area_for_change} ${application.area_for_change_unit}`} />
              <DetailItem label="District" value={application.district} />
              <DetailItem label="SDO Circle" value={application.sdo_circle} />
              <DetailItem label="Village" value={application.village} />
              <DetailItem label="Village Number" value={application.village_number} />
              <Separator className="md:col-span-2 lg:col-span-3 my-2" />
              <DetailItem label="Location Type" value={application.location_type} />
              <DetailItem
                label="Present Land Classification"
                value={application.land_classification}
              />
              <DetailItem label="Purpose" value={application.purpose} />
              <DetailItem label="Status" value={application.status} />
            </div>
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
                 <div className="space-y-4">
                    {Object.entries(documents).map(([groupName, files]) => (
                        <div key={groupName}>
                            <h4 className="font-semibold capitalize mb-2">{groupName.replace(/_/g, ' ')}</h4>
                            <div className="border rounded-md">
                               <Table>
                                 <TableHeader>
                                     <TableRow>
                                         <TableHead>File Name</TableHead>
                                         <TableHead className="text-right">Action</TableHead>
                                     </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                     {files.map((file, index) => (
                                         <TableRow key={index}>
                                             <TableCell className="flex items-center gap-2">
                                                 <FileText className="text-muted-foreground" />
                                                 <span>{file.file_name}</span>
                                             </TableCell>
                                             <TableCell className="text-right">
                                                 <Button variant="outline" size="sm" asChild>
                                                     <a href={file.file_path} target="_blank" rel="noopener noreferrer">
                                                         <Download className="mr-2"/>
                                                         View/Download
                                                     </a>
                                                 </Button>
                                             </TableCell>
                                         </TableRow>
                                     ))}
                                 </TableBody>
                               </Table>
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
    </>
  );
}
