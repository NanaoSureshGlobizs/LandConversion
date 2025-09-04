
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SurveyReportDialogProps {
    children: React.ReactNode;
}

export function SurveyReportDialog({ children }: SurveyReportDialogProps) {
  const [noHomestead, setNoHomestead] = useState<'yes' | 'no' | 'none'>('none');
  const [notAffected, setNotAffected] = useState<'yes' | 'no' | 'none'>('none');
  const [notForest, setNotForest] = useState<'yes' | 'no' | 'none'>('none');
  
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Survey Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="no-homestead">Applicant & family have no homestead land</Label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox id="no-homestead-yes" checked={noHomestead === 'yes'} onCheckedChange={() => setNoHomestead('yes')} />
                            <Label htmlFor="no-homestead-yes">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="no-homestead-no" checked={noHomestead === 'no'} onCheckedChange={() => setNoHomestead('no')} />
                            <Label htmlFor="no-homestead-no">No</Label>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="not-affected">Land not affected by land acquisition</Label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox id="not-affected-yes" checked={notAffected === 'yes'} onCheckedChange={() => setNotAffected('yes')} />
                            <Label htmlFor="not-affected-yes">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="not-affected-no" checked={notAffected === 'no'} onCheckedChange={() => setNotAffected('no')} />
                            <Label htmlFor="not-affected-no">No</Label>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="not-forest">Land not falling under forest Area (Ha)s</Label>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox id="not-forest-yes" checked={notForest === 'yes'} onCheckedChange={() => setNotForest('yes')} />
                            <Label htmlFor="not-forest-yes">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="not-forest-no" checked={notForest === 'no'} onCheckedChange={() => setNotForest('no')} />
                            <Label htmlFor="not-forest-no">No</Label>
                        </div>
                    </div>
                </div>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="status">Status</Label>
                <Select>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="upload-report">Upload Report</Label>
                <Input id="upload-report" type="file" />
            </div>
            <div className='space-y-2'>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" placeholder="Enter remarks..." />
            </div>
            <div className="space-y-3">
                <Label className='font-semibold'>Auto-Email</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="send-dc" />
                    <Label htmlFor="send-dc">Send to DCs of valley/surveyed districts</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="send-sdao" />
                    <Label htmlFor="send-sdao">Send to SDAO</Label>
                </div>
            </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
           <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button">Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}