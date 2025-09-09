

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
  order_upload: z.any().refine(file => file, 'Order document is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface LegacyDataFormProps {
  accessToken: string;
}

export function LegacyDataForm({ accessToken }: LegacyDataFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, control } = form;

  const processForm = async (values: FormValues) => {
    setIsSubmitting(true);

    const file = values.order_upload[0];
    const formData = new FormData();
    formData.append('legacy_order_file', file);
    
    const uploadResult = await uploadFile(formData, accessToken);
    if(uploadResult.debugLog) addLog(uploadResult.debugLog);

    if (!uploadResult.success || !uploadResult.data?.filename) {
        toast({ title: 'File Upload Failed', description: uploadResult.message || 'Could not upload the order file.', variant: 'destructive'});
        setIsSubmitting(false);
        return;
    }

    const payload = {
        order_no: values.order_no,
        order_date: format(values.order_date, 'yyyy-MM-dd'),
        legacy_type: values.legacy_type === 'Approve' ? 1 : 2, // Map Approve/Reject to 1/2
        remark: values.remark,
        legacy_order: [uploadResult.data.filename], // Use legacy_order and wrap in an array
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
                         <FormField
                            control={control}
                            name="order_upload"
                            render={({ field: { onChange, ...fieldProps} }) => (
                                <FormItem>
                                <FormLabel>Order Upload</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="file" 
                                        {...fieldProps}
                                        onChange={(e) => onChange(e.target.files)}
                                        accept="application/pdf,image/*"
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
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
