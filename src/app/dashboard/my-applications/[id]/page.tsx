'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
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
import { mockApplications } from '@/lib/mock-data';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import type { Application } from '@/lib/definitions';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const application = mockApplications.find((app) => app.id === id);

  if (!application) {
    return notFound();
  }

  const {
    ownerName,
    dob,
    pattaNumber,
    email,
    aadhar,
    phoneNumber,
    dagNo,
    ownerAddress,
    area,
    areaForChange,
    district,
    sdoCircle,
    village,
    villageNumber,
    landAddress,
    locationType,
    presentLandClassification,
    purpose,
    status,
    documents,
  } = application;

  return (
    <div className="flex-1 space-y-6 px-4 md:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Application Details
        </h1>
        <div className="flex-1" />
        <Button onClick={() => router.push(`/dashboard/my-applications/${id}/edit`)}>
          <Pencil className="mr-2" />
          Edit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem label="Owner Name" value={ownerName} />
            <DetailItem label="Email" value={email} />
            <DetailItem label="Phone Number" value={phoneNumber} />
            <DetailItem label="DOB" value={dob} />
            <DetailItem label="Aadhar" value={aadhar} />
            <DetailItem label="Owner Address" value={ownerAddress} />
            <Separator className="md:col-span-2 lg:col-span-3 my-2" />
            <DetailItem label="Patta" value={pattaNumber} />
            <DetailItem label="Dag No." value={dagNo} />
            <DetailItem label="Area (Hectare/Acres)" value={area.toString()} />
            <DetailItem label="Area for Change" value={areaForChange} />
            <DetailItem label="District" value={district} />
            <DetailItem label="SDO Circle" value={sdoCircle} />
            <DetailItem label="Village" value={village} />
            <DetailItem label="Village Number" value={villageNumber} />
            <DetailItem label="Land Address" value={landAddress} />
            <Separator className="md:col-span-2 lg:col-span-3 my-2" />
            <DetailItem label="Location Type" value={locationType} />
            <DetailItem
              label="Present Land Classification"
              value={presentLandClassification}
            />
            <DetailItem label="Purpose" value={purpose} />
            <DetailItem label="Status" value={status} />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>{doc.uploadedDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}