'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  districts,
  villages,
  landUseTypes,
  sdoCircles,
} from '@/lib/mock-data';
import type { Application } from '@/lib/definitions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  district: z.string().min(1, 'District is required.'),
  circle: z.string().min(1, 'Circle is required.'),
  subDivision: z.string().min(1, 'Sub Division is required.'),
  village: z.string().min(1, 'Village is required.'),
  purpose: z.string().min(1, 'Purpose is required.'),
  dateOfChange: z.date({
    required_error: 'Date of change of land use is required.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface NewApplicationFormProps {
  existingApplication?: Application;
}

export function NewApplicationForm({
  existingApplication,
}: NewApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: '',
      circle: '',
      subDivision: '',
      village: '',
      purpose: '',
    },
  });

  useEffect(() => {
    if (existingApplication) {
      form.reset({
        district: existingApplication.district,
        village: existingApplication.village,
        purpose: existingApplication.purpose,
        circle: existingApplication.sdoCircle,
        subDivision: existingApplication.sdoCircle, // Mocking subDivision with sdoCircle
        dateOfChange: new Date(existingApplication.dateSubmitted),
      });
    }
  }, [existingApplication, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    console.log('Form Submitted:', values);

    toast({
      title: existingApplication
        ? 'Application Updated!'
        : 'Application Submitted!',
      description: `Your application has been ${
        existingApplication ? 'updated' : 'received'
      }.`,
    });

    if (!existingApplication) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Current Plot Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="circle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Circle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Circle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sdoCircles.map((circle) => (
                          <SelectItem key={circle} value={circle}>
                            {circle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subDivision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Division</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sub Division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sdoCircles.map((circle) => (
                          <SelectItem key={circle} value={circle}>
                            {circle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Village" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Purpose for which the land is presently used
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {landUseTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfChange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of change of land use</FormLabel>
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
                              <span>Select Date</span>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => console.log('Save Draft')}
              >
                Save Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}
