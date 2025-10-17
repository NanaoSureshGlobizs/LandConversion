
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
import { Loader2, Send } from 'lucide-react';
import type { WorkflowItem } from '@/lib/definitions';
import { useAuth } from '@/context/AuthContext';
import { useDebug } from '@/context/DebugContext';
import { requestReverification } from '@/app/actions';


interface ReverificationDialogProps {
    children: React.ReactNode;
    workflowItem: WorkflowItem;
    onSuccess?: () => void;
}

export function ReverificationDialog({ children, workflowItem, onSuccess }: ReverificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addLog } = useDebug();
  const { accessToken } = useAuth();

  const [remarks, setRemarks] = useState('');

  const handleSubmit = async () => {
    if (!workflowItem.from_user_id) {
        toast({
            title: "Cannot Request Reverification",
            description: "The original sender of this workflow step could not be identified.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    
    const payload = {
        application_details_id: workflowItem.application_details_id,
        workflow_sequence_id: workflowItem.workflow_sequence_id,
        to_user_id: workflowItem.from_user_id, // Sending back to the original sender
        remark: remarks,
    };

    const result = await requestReverification(payload, accessToken);

    if (result.debugLog) addLog(result.debugLog);

    if (result.success) {
        toast({
            title: "Reverification Requested",
            description: result.message || `The request has been sent back to ${workflowItem.from_user}.`
        });
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: "Request Failed",
            description: result.message || "Could not request reverification.",
            variant: "destructive",
        });
    }

    setIsLoading(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Request Reverification</DialogTitle>
           <DialogDescription>
            Send this workflow step back for reverification.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className='space-y-2'>
                <Label htmlFor="from-user">From User (You)</Label>
                <Input id="from-user" value={workflowItem.to_user || ''} readOnly className='bg-muted'/>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="to-user">To User (Recipient)</Label>
                <Input id="to-user" value={workflowItem.from_user || 'Original Sender'} readOnly className='bg-muted'/>
            </div>
            <div className='space-y-2'>
                <Label htmlFor="remark">Remarks</Label>
                <Textarea 
                    id="remark"
                    placeholder="Enter your remarks for reverification..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
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
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
