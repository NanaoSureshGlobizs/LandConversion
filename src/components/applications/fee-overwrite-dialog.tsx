
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { getFeeActualAmount, overwriteFeeAmount } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { FullApplicationResponse } from '@/lib/definitions';


interface FeeOverwriteDialogProps {
    children: React.ReactNode;
    application: FullApplicationResponse;
    accessToken: string;
    onSuccess?: () => void;
}


export function FeeOverwriteDialog({ children, application, accessToken, onSuccess }: FeeOverwriteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAmount, setIsFetchingAmount] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [systemAmount, setSystemAmount] = useState<number | null>(null);
  const [overwriteAmount, setOverwriteAmount] = useState('');
  
  useEffect(() => {
    if (isOpen) {
        const fetchAmount = async () => {
            setIsFetchingAmount(true);
            const { data, log } = await getFeeActualAmount(application.id.toString(), accessToken);
            addLog(log || 'Log for getFeeActualAmount');
            if (data !== null) {
                setSystemAmount(data);
            }
            setIsFetchingAmount(false);
        }
        fetchAmount();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async () => {
    const amount = parseFloat(overwriteAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({
            title: 'Invalid Amount',
            description: 'Please enter a valid positive number for the fee.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);
    
    const result = await overwriteFeeAmount(application.id.toString(), amount, accessToken);
    addLog(result.debugLog || 'Log for overwriteFeeAmount');

    if (result.success) {
        toast({
            title: 'Fee Overwritten Successfully',
            description: result.message
        });
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: 'Operation Failed',
            description: result.message || 'Could not overwrite the fee amount.',
            variant: 'destructive',
        });
    }

    setIsLoading(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Overwrite Fee Amount</DialogTitle>
           <DialogDescription>
            View the system-calculated fee and enter a new amount if needed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
             <div className='space-y-2'>
                <Label htmlFor="system-amount">System Calculated Amount</Label>
                <div className="flex items-center space-x-2">
                    <Input 
                        id="system-amount" 
                        type="text" 
                        value={systemAmount !== null ? `₹ ${systemAmount.toLocaleString('en-IN')}` : 'Fetching...'}
                        readOnly
                        className="bg-muted"
                    />
                    {isFetchingAmount && <Loader2 className="h-5 w-5 animate-spin" />}
                </div>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="overwrite-amount">New Amount</Label>
                <Input 
                    id="overwrite-amount" 
                    type="number"
                    placeholder="Enter new fee amount"
                    value={overwriteAmount}
                    onChange={(e) => setOverwriteAmount(e.target.value)}
                />
            </div>
        </div>
        <DialogFooter>
           <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || isFetchingAmount}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit New Amount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
