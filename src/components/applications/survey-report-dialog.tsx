

'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { uploadFile, submitSurveyReport } from '@/app/actions';
import type { FullApplicationResponse, ApplicationStatusOption } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';

interface SurveyQuestion {
    id: number;
    name: string;
}

interface SurveyReportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    application: FullApplicationResponse;
    questions: SurveyQuestion[];
    statuses: ApplicationStatusOption[];
    accessToken: string;
    onSuccess?: () => void;
}

const surveyTitles = {
    'Survey': 'Land Acquisition Check',
    'KML_Survey': 'KML Survey Report',
    'Survey_2': 'Paddy Land Assessment',
    'Survey_3': 'Environmental and Planning Compliance',
    'Survey_4': 'Additional Paddy Land Verification'
}


export function SurveyReportDialog({ isOpen, onOpenChange, application, questions, statuses, accessToken, onSuccess }: SurveyReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addLog } = useDebug();

  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [kmlFile, setKmlFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [landSchedule, setLandSchedule] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');


  const formType = application.form_type as keyof typeof surveyTitles;
  const dialogTitle = useMemo(() => surveyTitles[formType] || 'Survey Report', [formType]);
  
  const resetForm = () => {
    setCheckboxes({});
    setStatus('');
    setReportFile(null);
    setKmlFile(null);
    setRemarks('');
    setLandSchedule('');
    setLatitude('');
    setLongitude('');
  }

  const handleCheckboxChange = (id: number, checked: boolean) => {
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

    let uploadedFileName: string | null = null;
    if (reportFile) {
        const formData = new FormData();
        formData.append('survey_report_file', reportFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({ title: 'File Upload Failed', description: uploadResult.message || 'Could not upload the survey report.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
        uploadedFileName = uploadResult.data.filename;
    }
    
    // KML file upload is separate if needed for the KML_Survey type
    if (formType === 'KML_Survey' && kmlFile) {
        const formData = new FormData();
        formData.append('survey_kml_file', kmlFile);
        const uploadResult = await uploadFile(formData, accessToken);

        if(uploadResult.debugLog) addLog(uploadResult.debugLog);

        if (!uploadResult.success || !uploadResult.data.filename) {
            toast({ title: 'KML Upload Failed', description: uploadResult.message || 'Could not upload the KML file.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
        // In a real scenario, you might need another field in the payload for this.
        // For now, it's not being added to the final payload.
    }
    
    const surveyDetails = questions.map(q => ({
        survey_details_id: q.id,
        is_checked: checkboxes[q.id] ? 1 : 0
    }));

    const payload = {
        application_details_id: application.id,
        land_schedule: landSchedule,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        survey_status_id: parseInt(status),
        attachment: uploadedFileName, // Using 'attachment' as requested
        survey_details: surveyDetails,
        remark: remarks,
    };

    const submitResult = await submitSurveyReport(payload, accessToken);
    if(submitResult.debugLog) addLog(submitResult.debugLog);

    if (submitResult.success) {
        toast({ title: 'Survey Report Submitted', description: 'The report has been sent successfully.'});
        resetForm();
        onOpenChange(false);
        onSuccess?.();
    } else {
        toast({ title: 'Submission Failed', description: submitResult.message || 'Could not submit the survey report.', variant: 'destructive' });
    }

    setIsLoading(false);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{dialogTitle}</DialogTitle>
           <DialogDescription>Complete the checklist and submit the report.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            
            {questions && questions.length > 0 && (
                <div className="space-y-4 rounded-md border p-4">
                    {questions.map(item => (
                        <div key={item.id} className="flex items-start justify-between">
                            <Label htmlFor={item.id.toString()} className="flex-1 pr-4">{item.name}</Label>
                            <Checkbox id={item.id.toString()} checked={checkboxes[item.id] || false} onCheckedChange={(checked) => handleCheckboxChange(item.id, !!checked)} />
                        </div>
                    ))}
                </div>
            )}

            {formType === 'KML_Survey' && (
              <>
                <div className='space-y-2'>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" placeholder="Enter latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" placeholder="Enter longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                </div>
                <div className='space-y-2'>
                    <Label htmlFor="upload-kml">Upload KML File (Optional)</Label>
                    <Input id="upload-kml" type="file" onChange={(e) => setKmlFile(e.target.files?.[0] || null)} accept=".kml" />
                </div>
              </>
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

    

    