
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkflowItem } from '@/lib/definitions';
import { Separator } from '../ui/separator';
import { Download, File, FileCode, MapPin } from 'lucide-react';
import Link from 'next/link';

interface WorkflowDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: WorkflowItem;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <p className="text-sm text-muted-foreground col-span-1">{label}</p>
      <div className="font-medium text-sm col-span-2 break-words">{value}</div>
    </div>
  );
}

export function WorkflowDetailDialog({ isOpen, onOpenChange, item }: WorkflowDetailDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Workflow Step Details</DialogTitle>
          <DialogDescription>
            Detailed information for the step assigned to <span className="font-semibold">{item.to_user}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <DetailItem label="Assigned To" value={item.to_user} />
            <Separator />
            <DetailItem label="Assigned From" value={item.from_user} />
            <Separator />
            <DetailItem label="Status" value={<Badge variant="secondary">{item.status.name}</Badge>} />
            <Separator />
            <DetailItem label="Date" value={item.created_at} />
            <Separator />
            <DetailItem label="Days Held" value={item.days_held} />
            <Separator />
            <DetailItem label="Remark" value={<p className="whitespace-pre-wrap">{item.remark}</p>} />
            <Separator />
            <DetailItem label="Land Schedule" value={<p className="whitespace-pre-wrap">{item.land_schedule}</p>} />
            <Separator />
            <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Latitude" value={item.lattitute_of_land} />
                <DetailItem label="Longitude" value={item.longitute_of_land} />
            </div>
            
            {(item.attachment || item.kml_file) && <Separator />}

            {item.attachment && (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <File className="text-muted-foreground" />
                        <span className="font-mono text-sm capitalize">General Attachment</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a href={item.attachment} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2"/>
                            View
                        </a>
                    </Button>
                </div>
            )}
            {item.kml_file && (
                <div className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <FileCode className="text-muted-foreground" />
                        <span className="font-mono text-sm capitalize">KML File</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/kml-viewer?url=${encodeURIComponent(item.kml_file)}`} target="_blank">
                            <MapPin className="mr-2"/>
                            View on Map
                        </Link>
                    </Button>
                </div>
            )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
