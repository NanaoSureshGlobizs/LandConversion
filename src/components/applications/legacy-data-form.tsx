
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, FileText, X, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { submitLegacyData, uploadFile } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';

const formSchema = z.object({
  order_no: z.string().min(1, 'Order number is required.'),
  order_date: z.date({ required_error: 'Order date is required.' }),
  legacy_type: z.enum(['Approve', 'Reject'], { required_error: 'Legacy type is required.' }),
  remark: z.string().optional(),
  order_upload: z.custom<File[]>().refine(files => files && files.length > 0, 'At least one order document is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface PreviewFile extends File {
    preview: string;
}


interface LegacyDataFormProps {
  accessToken: string;
}

export function LegacyDataForm({ accessToken }: LegacyDataFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        order_upload: [],
    }
  });

  const { handleSubmit, control, setValue, trigger, formState: { errors } } = form;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newPreviews = files.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
    }));

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    
    // Update react-hook-form value
    const currentFiles = form.getValues('order_upload') || [];
    setValue('order_upload', [...currentFiles, ...files]);
    trigger('order_upload'); // Manually trigger validation
  };

  const handleRemoveFile = (fileToRemove: PreviewFile) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(fileToRemove.preview);

    const updatedPreviews = previews.filter(file => file !== fileToRemove);
    setPreviews(updatedPreviews);
    
    // Update react-hook-form value
    const currentFiles = form.getValues('order_upload') || [];
    const updatedFiles = currentFiles.filter(file => file.name !== fileToRemove.name || file.size !== fileToRemove.size);
    setValue('order_upload', updatedFiles, { shouldValidate: true });
    trigger('order_upload');
  };

  useEffect(() => {
    // Cleanup object URLs on component unmount
    return () => previews.forEach(file => URL.revokeObjectURL(file.preview));
  }, [previews]);


  const processForm = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const uploadedFileNames: string[] = [];
    const files = values.order_upload;

    for (const file of files) {
        const formData = new FormData();
        formData.append('legacy_order_file', file);
        
        const uploadResult = await uploadFile(formData, accessToken);
        addLog(uploadResult.debugLog || `Log for uploading ${file.name}`);

        if (!uploadResult.success || !uploadResult.data?.filename) {
            toast({ title: 'File Upload Failed', description: uploadResult.message || `Could not upload the file ${file.name}.`, variant: 'destructive'});
            setIsSubmitting(false);
            return;
        }
        uploadedFileNames.push(uploadResult.data.filename);
    }

    const payload = {
        order_no: values.order_no,
        order_date: format(values.order_date, 'yyyy-MM-dd'),
        legacy_type: values.legacy_type === 'Approve' ? 1 : 2,
        remark: values.remark,
        legacy_order: uploadedFileNames,
    };
    
    const result = await submitLegacyData(payload, accessToken);
    
    if (result.debugLog) {
        addLog(result.debugLog);
    }

    if (result.success) {
      toast({
        title: 'Legacy Record Created!',
        description: 'The new legacy data record has been saved.',
      });
      router.push('/dashboard/legacy-data');
    } else {
       toast({
        title: 'Submission Failed',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };
  
  const renderPreviewContent = (file: PreviewFile) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
        return (
            <div className="w-full h-full bg-muted rounded-md flex flex-col items-center justify-center p-2 border">
                <FileText className="w-8 h-8 text-destructive" />
                <p className="text-xs font-semibold text-center break-all mt-2">{file.name}</p>
            </div>
        );
    }
    
    return (
        <Image
            src={file.preview}
            alt={`Preview ${file.name}`}
            fill
            className="object-cover rounded-md border"
        />
    );
  };


  return (
    <Card className='shadow-lg'>
        <CardHeader>
            <CardTitle>Legacy Data Details</CardTitle>
            <CardDescription>Enter the details for the historical record.</CardDescription>
        </CardHeader>
        <CardContent>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(processForm)} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={control}
                            name="order_no"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Order No.</FormLabel>
                                <FormControl><Input placeholder="Enter order number" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={control}
                            name="order_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Order Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, 'PPP')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="legacy_type"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Legacy Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type (Approve/Reject)" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Approve">Approve</SelectItem>
                                    <SelectItem value="Reject">Reject</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div></div>
                        <FormField
                            control={control}
                            name="remark"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Remark</FormLabel>
                                <FormControl><Textarea placeholder="Enter remark (optional)" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="md:col-span-2">
                            <FormItem>
                                <FormLabel>Order Upload</FormLabel>
                                <FormControl>
                                    <div
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        onClick={() => document.getElementById('order-upload-input')?.click()}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                        </div>
                                        <Input 
                                            id="order-upload-input"
                                            type="file" 
                                            className="hidden"
                                            accept="application/pdf,image/*"
                                            multiple
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage>{errors.order_upload?.message}</FormMessage>
                            </FormItem>
                             {previews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {previews.map((file, index) => (
                                    <div key={index} className="relative aspect-square group">
                                        {renderPreviewContent(file)}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveFile(file)}
                                        >
                                            <X className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Record
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </CardContent>
    </Card>
  );
}
