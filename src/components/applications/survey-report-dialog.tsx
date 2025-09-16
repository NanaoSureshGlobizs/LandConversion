
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
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
import { uploadFile, forwardApplication } from '@/app/actions';
import type { FullApplicationResponse, ApplicationStatusOption } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';

interface SurveyReportDialogProps {
    children: React.ReactNode;
    application: FullApplicationResponse;
    statuses: ApplicationStatusOption[];
    accessToken: string;
    onSuccess?: () => void;
}

const surveyChecklists = {
    'Survey': [
        { id: 'land_acquisition', label: 'The land is affected by land acquisition' }
    ],
    'Survey_2': [
        { id: 'adverse_ecology', label: 'The reclamation of paddy land shall not adversely affect the ecological condition and the agricultural activities in the adjoining paddy land' },
        { id: 'surrounded_by_paddy', label: 'The said land is not surrounded on all four sides by paddy land' }
    ],
    'Survey_3': [
        { id: 'forest_area', label: 'Land falls under forest area' },
        { id: 'violates_master_plan', label: 'The proposal violates the Greater Imphal Master Plan 2043' }
    ],
    'Survey_4': [
        { id: 'adverse_ecology_2', label: 'The reclamation of paddy land shall not adversely affect the ecological condition and the agricultural activities in the adjoining paddy land' },
        { id: 'surrounded_by_paddy_2', label: 'The said land is not surrounded on all four sides by paddy land' }
    ]
};

const surveyTitles = {
    'Survey': 'Land Acquisition Check',
    'Survey_2': 'Paddy Land Assessment',
    'Survey_3': 'Environmental and Planning Compliance',
    'Survey_4': 'Additional Paddy Land Verification'
}


export function SurveyReportDialog({ children, application, statuses, accessToken, onSuccess }: SurveyReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [landSchedule, setLandSchedule] = useState('');
  const [sendToDc, setSendToDc] = useState(false);
  const [sendToSdao, setSendToSdao] = useState(false);

  const formType = application.form_type as keyof typeof surveyChecklists;
  const checklist = useMemo(() => surveyChecklists[formType] || [], [formType]);
  const dialogTitle = useMemo(() => surveyTitles[formType] || 'Survey Report', [formType]);
  
  const resetForm = () => {
    setCheckboxes({});
    setStatus('');
    setReportFile(null);
    setRemarks('');
    setLandSchedule('');
    setSendToDc(false);
    setSendToSdao(false);
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckboxes(prev => ({ ...prev, [id]: checked }));
  }

  const handleSubmit = async () => {
    if (!status) {
        toast({
            title: 'Missing Information',
            description: 'Please select a status.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);

    let uploadedFileName = '';
    if (reportFile) {
        const formData = new FormData();
        formData.append('workflow_attachment', reportFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({ title: 'File Upload Failed', description: uploadResult.message || 'Could not upload the survey report.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
        uploadedFileName = uploadResult.data.filename;
    }

    const fullRemarks = `Land Schedule: ${landSchedule}\n\nChecklist: ${JSON.stringify(checkboxes)}\n\nRemarks: ${remarks}`;
    
    const payload = {
        application_details_id: application.id,
        verification_status_id: parseInt(status),
        remark: fullRemarks,
        attachment: uploadedFileName,
        status: 1,
    };

    const submitResult = await forwardApplication(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({ title: 'Survey Report Submitted', description: 'The report has been sent successfully.'});
        resetForm();
        setIsOpen(false);
        onSuccess?.();
    } else {
        toast({ title: 'Submission Failed', description: submitResult.message || 'Could not submit the survey report.', variant: 'destructive' });
    }

    setIsLoading(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{dialogTitle}</DialogTitle>
           <DialogDescription>Complete the checklist and submit the report.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            {checklist.length > 0 && (
                <div className="space-y-4 rounded-md border p-4">
                    {checklist.map(item => (
                        <div key={item.id} className="flex items-start justify-between">
                            <Label htmlFor={item.id} className="flex-1 pr-4">{item.label}</Label>
                            <Checkbox id={item.id} checked={checkboxes[item.id] || false} onCheckedChange={(checked) => handleCheckboxChange(item.id, !!checked)} />
                        </div>
                    ))}
                </div>
            )}

            <div className='space-y-2'>
                <Label htmlFor="land_schedule">Land Schedule</Label>
                <Textarea id="land_schedule" placeholder="Enter land schedule details..." value={landSchedule} onChange={(e) => setLandSchedule(e.target.value)} />
            </div>
            <div className='space-y-2'>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger>
                    <SelectContent>
                        {statuses.map((s) => (<SelectItem key={s.id} value={s.id.toString()}>{s.status_name}</SelectItem>))}
                    </SelectContent>
                </Select>
            </div>
             <div className='space-y-2'>
                <Label htmlFor="upload-report">Upload Report (Optional)</Label>
                <Input id="upload-report" type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} accept="application/pdf,image/*" />
            </div>
            <div className='space-y-2'>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" placeholder="Enter remarks..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
            <div className="space-y-3">
                <Label className='font-semibold'>Auto-Email</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="send-dc" checked={sendToDc} onCheckedChange={(checked) => setSendToDc(!!checked)} />
                    <Label htmlFor="send-dc">Send to DCs of valley/surveyed districts</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="send-sdao" checked={sendToSdao} onCheckedChange={(checked) => setSendToSdao(!!checked)} />
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
