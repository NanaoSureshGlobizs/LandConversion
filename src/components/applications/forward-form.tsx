
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
import { Loader2 } from 'lucide-react';

interface ForwardFormProps {
    children: React.ReactNode;
    applicationId: string;
    accessToken: string;
    onSuccess?: () => void;
}

export function ForwardForm({ children, applicationId, accessToken, onSuccess }: ForwardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [remark, setRemark] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const resetForm = () => {
    setRemark('');
    setImageFile(null);
  }

  const handleSubmit = async () => {
    
    setIsLoading(true);

    let uploadedFileName = '';
    // Step 1: Upload the file if it exists
    if (imageFile) {
        const formData = new FormData();
        // The API expects the key to be 'forward_attachment'
        formData.append('forward_attachment', imageFile);
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

    // Step 2: Submit the forward details
    const payload = {
        application_details_id: parseInt(applicationId),
        verification_status_id: 6, // This seems to be a fixed value from the API example
        remark,
        attachment: uploadedFileName,
        status: 1, // 1 for forward
    };

    const submitResult = await forwardApplication(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);
    
    setIsLoading(false);

    if (submitResult.success) {
        toast({
            title: 'Action Successful',
            description: submitResult.message || 'Application has been forwarded.'
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.(); // Trigger refresh
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not forward the application.',
            variant: 'destructive'
        });
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Forward</DialogTitle>
           <DialogDescription>
            Forward this application for the next stage of processing.
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
