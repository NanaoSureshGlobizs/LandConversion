
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
import { uploadFile } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface RejectFormProps {
    children: React.ReactNode;
    applicationId: string;
    accessToken: string;
    onSuccess?: () => void;
}

// Placeholder for the new server action
async function rejectApplication(payload: any, token: string) {
    console.log('Rejecting application with payload:', payload);
    // In a real scenario, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Application rejected successfully.', debugLog: `--- Rejecting Application ---\nPayload: ${JSON.stringify(payload, null, 2)}\n--------------------------` };
}


export function RejectForm({ children, applicationId, accessToken, onSuccess }: RejectFormProps) {
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
        formData.append('reject_image', imageFile);
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

    // Step 2: Submit the reject details
    const payload = {
        application_id: applicationId,
        remark,
        image: uploadedFileName,
        status: 0,
    };

    const submitResult = await rejectApplication(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({
            title: 'Action Successful',
            description: submitResult.message
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not reject the application.',
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
          <DialogTitle className="font-headline">Reject</DialogTitle>
           <DialogDescription>
            Reject this application. Provide a remark for the rejection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className='space-y-2'>
                <Label htmlFor="remark">Remark</Label>
                <Textarea 
                    id="remark"
                    placeholder="Enter your remarks for rejection..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                />
            </div>
             <div className='space-y-2'>
                <Label htmlFor="upload-image">Upload Image (Optional)</Label>
                <Input 
                    id="upload-image" 
                    type="file" 
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    accept="image/*"
                />
            </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
