
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
import { Download, File, FileCode, MapPin, Send } from 'lucide-react';
import Link from 'next/link';
import { ReverificationDialog } from './reverification-dialog';

interface WorkflowDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: WorkflowItem;
  accessToken: string;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <p className="text-sm text-muted-foreground col-span-1">{label}</p>
      <div className="text-sm col-span-2 break-words">{value}</div>
    </div>
  );
}

export function WorkflowDetailDialog({ isOpen, onOpenChange, item, accessToken }: WorkflowDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Workflow Step Details</DialogTitle>
          <DialogDescription className="text-base">
            Assigned to <span className="font-medium text-foreground">{item.to_user}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-2 max-h-[65vh] overflow-y-auto">
          <DetailItem label="Assigned To" value={item.to_user} />
          <Separator />
          <DetailItem label="Assigned From" value={item.from_user} />
          <Separator />
          <DetailItem 
            label="Status" 
            value={
              <Badge variant="secondary" className="font-normal">
                {item.status.name}
              </Badge>
            } 
          />
          <Separator />
          <DetailItem label="Date" value={item.created_at} />
          <Separator />
          <DetailItem label="Days Held" value={item.days_held} />
          
          {item.remark && (
            <>
              <Separator />
              <DetailItem 
                label="Remark" 
                value={<p className="whitespace-pre-wrap text-foreground/90">{item.remark}</p>} 
              />
            </>
          )}
          
          {item.land_schedule && (
            <>
              <Separator />
              <DetailItem 
                label="Land Schedule" 
                value={<p className="whitespace-pre-wrap text-foreground/90">{item.land_schedule}</p>} 
              />
            </>
          )}

          {(item.lattitute_of_land || item.longitute_of_land) && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-4 py-3">
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <div className="text-sm col-span-2 space-y-1">
                  {item.lattitute_of_land && <div>Lat: {item.lattitute_of_land}</div>}
                  {item.longitute_of_land && <div>Lng: {item.longitute_of_land}</div>}
                </div>
              </div>
            </>
          )}
          
          {(item.attachment || item.kml_file) && (
            <>
              <Separator />
              <div className="space-y-2 pt-2">
                {item.attachment && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/50">
                    <div className="flex items-center gap-3">
                      <File className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-900 dark:text-blue-100">General Attachment</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-200 dark:border-blue-800" asChild>
                      <a href={item.attachment} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                )}
                {item.kml_file && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50">
                    <div className="flex items-center gap-3">
                      <FileCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-emerald-900 dark:text-emerald-100">KML File</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-emerald-200 dark:border-emerald-800" asChild>
                      <Link href={`/kml-viewer?url=${encodeURIComponent(item.kml_file)}`} target="_blank">
                        <MapPin className="h-4 w-4 mr-2" />
                        View Map
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <ReverificationDialog workflowItem={item} accessToken={accessToken}>
            <Button type="button" variant="outline" className="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50">
              <Send className="h-4 w-4 mr-2" />
              Reverification
            </Button>
          </ReverificationDialog>
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
