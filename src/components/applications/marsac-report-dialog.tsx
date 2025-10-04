

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
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { uploadFile, submitMarsacReport } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import type { FullApplicationResponse, AreaUnit } from '@/lib/definitions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


interface MarsacReportDialogProps {
    children: React.ReactNode;
    application: FullApplicationResponse;
    areaUnits: AreaUnit[];
    accessToken: string;
    onSuccess?: () => void;
}


export function MarsacReportDialog({ children, application, areaUnits, accessToken, onSuccess }: MarsacReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [previouslyOccupiedArea, setPreviouslyOccupiedArea] = useState('');
  const [previouslyOccupiedAreaUnitId, setPreviouslyOccupiedAreaUnitId] = useState('');
  const [exactlyOccupiedArea, setExactlyOccupiedArea] = useState('');
  const [exactlyOccupiedAreaUnitId, setExactlyOccupiedAreaUnitId] = useState('');
  const [marsacFile, setMarsacFile] = useState<File | null>(null);

  
  const resetForm = () => {
    setPreviouslyOccupiedArea('');
    setPreviouslyOccupiedAreaUnitId('');
    setExactlyOccupiedArea('');
    setExactlyOccupiedAreaUnitId('');
    setMarsacFile(null);
  }

  const handleSubmit = async () => {
    if (!previouslyOccupiedArea || !previouslyOccupiedAreaUnitId || !exactlyOccupiedArea || !exactlyOccupiedAreaUnitId) {
        toast({
            title: 'Missing Information',
            description: 'Please fill out all area fields.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);

    let marsacFileName = '';
    let marsacFilePath = '';
    // Step 1: Upload the file if it exists
    if (marsacFile) {
        const formData = new FormData();
        formData.append('marsac_file', marsacFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({
                title: 'File Upload Failed',
                description: uploadResult.message || 'Could not upload the MARSAC file.',
                variant: 'destructive'
            });
            setIsLoading(false);
            return;
        }
        marsacFileName = marsacFile.name;
        marsacFilePath = uploadResult.data.filename;
    }

    // Step 2: Submit the survey report details
    const payload = {
        application_details_id: application.id,
        previously_occupied_area: parseFloat(previouslyOccupiedArea),
        previously_occupied_area_unit_id: parseInt(previouslyOccupiedAreaUnitId),
        exactly_occupied_area: parseFloat(exactlyOccupiedArea),
        exactly_occupied_area_unit_id: parseInt(exactlyOccupiedAreaUnitId),
        marsac_file_name: marsacFileName,
        marsac_file_path: marsacFilePath,
        is_active: "1",
    };

    const submitResult = await submitMarsacReport(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({
            title: 'MARSAC Report Submitted',
            description: 'The report has been sent successfully.'
        });
        resetForm();
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({
            title: 'Submission Failed',
            description: submitResult.message || 'Could not submit the MARSAC report.',
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
          <DialogTitle className="font-headline">MARSAC Report</DialogTitle>
          <DialogDescription>
            Enter the details for the MARSAC report.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            <div className="space-y-2">
                <Label>Previously occupied area</Label>
                <div className="grid grid-cols-3 gap-2">
                    <Input
                        type="number"
                        placeholder="Enter area"
                        value={previouslyOccupiedArea}
                        onChange={(e) => setPreviouslyOccupiedArea(e.target.value)}
                        className="col-span-2"
                    />
                    <Select value={previouslyOccupiedAreaUnitId} onValueChange={setPreviouslyOccupiedAreaUnitId}>
                        <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {areaUnits.map((unit) => (<SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Exactly occupied area</Label>
                <div className="grid grid-cols-3 gap-2">
                     <Input
                        type="number"
                        placeholder="Enter area"
                        value={exactlyOccupiedArea}
                        onChange={(e) => setExactlyOccupiedArea(e.target.value)}
                        className="col-span-2"
                    />
                    <Select value={exactlyOccupiedAreaUnitId} onValueChange={setExactlyOccupiedAreaUnitId}>
                        <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                        <SelectContent>
                            {areaUnits.map((unit) => (<SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

             <div className='space-y-2'>
                <Label htmlFor="upload-marsac">Upload MARSAC File (Optional)</Label>
                <Input 
                    id="upload-marsac" 
                    type="file" 
                    onChange={(e) => setMarsacFile(e.target.files?.[0] || null)}
                    accept="application/pdf,image/*"
                />
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
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
