
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
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
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { uploadFile, submitSurveyReport } from '@/app/actions';
import type { FullApplicationResponse } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';

interface SurveyReportDialogProps {
    children: React.ReactNode;
    application: FullApplicationResponse;
    accessToken: string;
}

export function SurveyReportDialog({ children, application, accessToken }: SurveyReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [noHomestead, setNoHomestead] = useState(false);
  const [notAffected, setNotAffected] = useState(false);
  const [notForest, setNotForest] = useState(false);
  const [status, setStatus] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [sendToDc, setSendToDc] = useState(false);
  const [sendToSdao, setSendToSdao] = useState(false);
  
  const resetForm = () => {
    setNoHomestead(false);
    setNotAffected(false);
    setNotForest(false);
    setStatus('');
    setReportFile(null);
    setRemarks('');
    setSendToDc(false);
    setSendToSdao(false);
  }

  const handleSubmit = async () => {
    if (!status || !reportFile) {
        toast({
            title: 'Missing Information',
            description: 'Please select a status and upload a report file.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);

    // Step 1: Upload the file
    const formData = new FormData();
    formData.append('upload_survey_record', reportFile);
    const uploadResult = await uploadFile(formData, accessToken);

    if(uploadResult.debugLog) addLog(uploadResult.debugLog);

    if (!uploadResult.success || !uploadResult.data.filename) {
        toast({
            title: 'File Upload Failed',
            description: uploadResult.message || 'Could not upload the survey report.',
            variant: 'destructive'
        });
        setIsLoading(false);
        return;
    }

    // Step 2: Submit the survey report details
    const payload = {
        application_details_id: application.id,
        survey_details_id: 1, // This seems to be a fixed value from the API example
        survey_status: noHomestead && notAffected && notForest ? '1' : '0',
        department_review_status_id: parseInt(status, 10),
        review_number: `RV-${application.application_no}`,
        upload_survey_record: uploadResult.data.filename,
        remarks: remarks,
    };

    const submitResult = await submitSurveyReport(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({
            title: 'Survey Report Submitted',
            description: 'The report has been sent successfully.'
        });
        resetForm();
        setIsOpen(false);
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not submit the survey report.',
            variant: 'destructive'
        });
    }

    setIsLoading(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Survey Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="no-homestead" className="flex-1">Applicant & family have no homestead land</Label>
                    <div className="flex items-center gap-4">
                       <Checkbox id="no-homestead" checked={noHomestead} onCheckedChange={(checked) => setNoHomestead(!!checked)} />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="not-affected" className="flex-1">Land not affected by land acquisition</Label>
                    <div className="flex items-center gap-4">
                       <Checkbox id="not-affected" checked={notAffected} onCheckedChange={(checked) => setNotAffected(!!checked)} />
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="not-forest" className="flex-1">Land not falling under forest Area (Ha)s</Label>
                    <div className="flex items-center gap-4">
                       <Checkbox id="not-forest" checked={notForest} onCheckedChange={(checked) => setNotForest(!!checked)} />
                    </div>
                </div>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Approved</SelectItem>
                        <SelectItem value="2">Rejected</SelectItem>
                        <SelectItem value="3">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="upload-report">Upload Report</Label>
                <Input 
                    id="upload-report" 
                    type="file" 
                    onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                    accept="application/pdf,image/*"
                />
            </div>
            <div className='space-y-2'>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea 
                    id="remarks"
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </div>
            <div className="space-y-3">
                <Label className='font-semibold'>Auto-Email</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="send-dc"
                        checked={sendToDc}
                        onCheckedChange={(checked) => setSendToDc(!!checked)}
                    />
                    <Label htmlFor="send-dc">Send to DCs of valley/surveyed districts</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="send-sdao"
                        checked={sendToSdao}
                        onCheckedChange={(checked) => setSendToSdao(!!checked)}
                    />
                    <Label htmlFor="send-sdao">Send to SDAO</Label>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
           <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
