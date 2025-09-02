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
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import { getApplicationById } from '@/app/actions';
import { cookies } from 'next/headers';
import Link from 'next/link';

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

  const application = await getApplicationById(accessToken, id);

  if (!application) {
    return notFound();
  }

  return (
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
        <Button asChild>
          <Link href={`/dashboard/my-applications/${id}/edit`}>
            <Pencil className="mr-2" />
            Edit
          </Link>
        </Button>
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
            <DetailItem label="Patta" value={application.patta_no} />
            <DetailItem label="Dag No." value={application.dag_no} />
            <DetailItem label="Original Area of Plot" value={application.original_area_of_plot} />
            <DetailItem label="Area for Change" value={application.area_for_change} />
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
           <p className="text-muted-foreground">Document functionality is not yet implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
}
