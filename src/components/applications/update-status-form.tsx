
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { uploadFile, forwardApplication } from '@/app/actions';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ApplicationStatusOption } from '@/lib/definitions';


interface UpdateStatusFormProps {
    children: React.ReactNode;
    applicationId: string;
    accessToken: string;
    statuses: ApplicationStatusOption[];
    onSuccess?: () => void;
}


export function UpdateStatusForm({ children, applicationId, accessToken, statuses, onSuccess }: UpdateStatusFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [remark, setRemark] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  
  const resetForm = () => {
    setRemark('');
    setImageFile(null);
    setStatus('');
    setDate(undefined);
  }

  const handleSubmit = async () => {
    if (!status || !date) {
        toast({
            title: 'Missing Information',
            description: 'Please select a status and a date.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);

    let uploadedFileName = '';
    // Step 1: Upload the file if it exists
    if (imageFile) {
        const formData = new FormData();
        // Use a generic key for the attachment in the forward/update context
        formData.append('workflow_attachment', imageFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({
                title: 'Image Upload Failed',
                description: uploadResult.message || 'Could not upload the image.',
                variant: 'destructive'
            });
            setIsLoading(false);
            return;
        }
        uploadedFileName = uploadResult.data.filename;
    }

    // Step 2: Submit the details using the forwardApplication action
    const payload = {
        application_details_id: parseInt(applicationId),
        verification_status_id: parseInt(status), // The status selected from the dropdown
        remark,
        attachment: uploadedFileName,
        status: 1, // Status `1` indicates a forward/update action
        date: format(date, 'yyyy-MM-dd'),
    };

    const submitResult = await forwardApplication(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({
            title: 'Action Successful',
            description: submitResult.message || 'The application status has been updated.'
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not update the status.',
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
          <DialogTitle className="font-headline">Report</DialogTitle>
           <DialogDescription>
            Update the status of this application by filing a report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className='space-y-2'>
                <Label htmlFor="status">Status</Label>
                 <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((s) => (
                           <SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='space-y-2'>
                 <Label>Date</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={'outline'}
                            className={cn(
                                'w-full justify-start text-left font-normal',
                                !date && 'text-muted-foreground'
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="remark">Remark</Label>
                <Textarea 
                    id="remark"
                    placeholder="Enter your remarks..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />
            </div>
             <div className='space-y-2'>
                <Label htmlFor="upload-image">Upload Attachment (Optional)</Label>
                <Input 
                    id="upload-image" 
                    type="file" 
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                />
            </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
