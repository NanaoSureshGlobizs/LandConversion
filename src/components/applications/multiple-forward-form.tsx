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
import { uploadFile, forwardMultipleApplications } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface MultipleForwardFormProps {
    children: React.ReactNode;
    applicationIds: string[];
    accessToken: string;
    onSuccess?: () => void;
}

export function MultipleForwardForm({ children, applicationIds, accessToken, onSuccess }: MultipleForwardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [remark, setRemark] = useState('');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  const resetForm = () => {
    setRemark('');
    setAttachmentFile(null);
  }

  const handleSubmit = async () => {
    if (applicationIds.length === 0) {
        toast({
            title: "No Applications Selected",
            description: "Please select at least one application to forward.",
            variant: "destructive"
        });
        return;
    }
    
    setIsLoading(true);

    let uploadedFileName = '';
    // Step 1: Upload the file if it exists
    if (attachmentFile) {
        const formData = new FormData();
        formData.append('forward_attachment', attachmentFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({
                title: 'Attachment Upload Failed',
                description: uploadResult.message || 'Could not upload the attachment.',
                variant: 'destructive'
            });
            setIsLoading(false);
            return;
        }
        uploadedFileName = uploadResult.data.filename;
    }

    // Step 2: Submit the forward details
    const payload = {
        application_details_id: applicationIds.map(id => parseInt(id)),
        verification_status_id: 6, // This seems to be a fixed value for 'Forward'
        remark,
        attachment: uploadedFileName,
        status: 1, // 1 for forward
    };

    const submitResult = await forwardMultipleApplications(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);
    
    setIsLoading(false);

    if (submitResult.success) {
        toast({
            title: 'Action Successful',
            description: submitResult.message || `${applicationIds.length} application(s) have been forwarded.`
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not forward the applications.',
            variant: 'destructive'
        });
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Forward Multiple Applications</DialogTitle>
           <DialogDescription>
            You are about to forward {applicationIds.length} application(s). Add a remark and an optional attachment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
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
          <Button type="button" onClick={handleSubmit} disabled={isLoading || applicationIds.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Forward ({applicationIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
