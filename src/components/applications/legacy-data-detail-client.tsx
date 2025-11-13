
'use client';

import type { FullLegacyDataResponse } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Printer } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    <div className="grid grid-cols-2 gap-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-right">{value || '-'}</p>
    </div>
  );
}

interface LegacyDataDetailClientProps {
    legacyRecord: FullLegacyDataResponse;
}

export function LegacyDataDetailClient({ legacyRecord }: LegacyDataDetailClientProps) {

  const getStatusVariant = (statusId: number): 'default' | 'destructive' | 'secondary' => {
      switch(statusId) {
          case 1: return 'default'; // Approve
          case 2: return 'destructive'; // Reject
          default:
            return 'secondary'; // Review
      }
  }

    const getStatusName = (statusId: number): 'Approve' | 'Reject' | 'Review' => {
        switch(statusId) {
            case 1: return 'Approve';
            case 2: return 'Reject';
            default: return 'Review';
        }
    }


  return (
    <div className="flex-1 space-y-6 px-4 md:px-8">
        <div className="flex items-center gap-4 no-print">
            <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/legacy-data">
                    <ArrowLeft />
                    <span className="sr-only">Back to Legacy Data</span>
                </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight font-headline">
                Legacy Record Details
            </h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Record Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DetailItem label="Order Number" value={legacyRecord.order_no} />
                    <Separator />
                    <DetailItem label="Order Date" value={legacyRecord.order_date} />
                    <Separator />
                    <DetailItem label="Remark" value={legacyRecord.remark} />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {legacyRecord.uploaded_files && legacyRecord.uploaded_files.length > 0 ? (
                        <div className="space-y-2">
                            {legacyRecord.uploaded_files.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-muted-foreground" />
                                        <span className="font-mono text-sm">{file.file_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={file.full_path} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2"/>
                                            View
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No documents attached to this record.</p>
                    )}
                </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Record ID</p>
                        <p className="font-semibold text-lg font-mono">{legacyRecord.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={getStatusVariant(legacyRecord.legacy_type)} className="text-base mt-1">
                            {getStatusName(legacyRecord.legacy_type)}
                        </Badge>
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
                        Print Record
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>

      </div>
  );
}
