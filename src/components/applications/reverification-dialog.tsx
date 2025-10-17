
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

interface ReverificationDialogProps {
    children: React.ReactNode;
    fromUser: string;
    toUser: string;
    onSuccess?: () => void;
}

export function ReverificationDialog({ children, fromUser, toUser, onSuccess }: ReverificationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [remarks, setRemarks] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    // This is a placeholder for the actual API call.
    // In a real scenario, you would call a server action here.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log({
        from: fromUser,
        to: toUser,
        remarks: remarks,
    });
    
    toast({
        title: "Reverification Requested",
        description: `The request has been sent from ${fromUser} to ${toUser}.`
    });

    setIsLoading(false);
    setIsOpen(false);
    onSuccess?.();
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
                <Label htmlFor="from-user">From User</Label>
                <Input id="from-user" value={fromUser} readOnly className='bg-muted'/>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="to-user">To User</Label>
                <Input id="to-user" value={toUser} readOnly className='bg-muted'/>
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
