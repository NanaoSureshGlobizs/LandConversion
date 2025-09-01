'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { districts, villages, landUseTypes } from '@/lib/mock-data';
import type { Application } from '@/lib/definitions';

const formSchema = z.object({
  surveyNumber: z.string().min(1, 'Survey number is required.'),
  village: z.string().min(1, 'Village is required.'),
  district: z.string().min(1, 'District is required.'),
  currentLandUse: z.string().min(1, 'Current land use is required.'),
  proposedLandUse: z.string().min(10, 'Proposed land use description is required.'),
});

type FormValues = z.infer<typeof formSchema>;

interface NewApplicationFormProps {
  existingApplication?: Application;
}

export function NewApplicationForm({ existingApplication }: NewApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyNumber: '',
      village: '',
      district: '',
      currentLandUse: '',
      proposedLandUse: '',
    },
  });

  useEffect(() => {
    if (existingApplication) {
      form.reset({
        surveyNumber: existingApplication.surveyNumber,
        village: existingApplication.village,
        district: existingApplication.district,
        currentLandUse: existingApplication.currentLandUse,
        proposedLandUse: existingApplication.purpose,
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
      title: existingApplication ? 'Application Updated!' : 'Application Submitted!',
      description: `Your application for survey no. ${values.surveyNumber} has been ${existingApplication ? 'updated' : 'received'}.`,
    });
    
    if (!existingApplication) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Application Details</CardTitle>
          <CardDescription>Provide the details for the plot of land.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="surveyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survey Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 123/4A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a district" />
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
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a village" />
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
                  name="currentLandUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Land Use</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select current use type" />
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
              </div>

               <FormField
                  control={form.control}
                  name="proposedLandUse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proposed Land Use / Purpose</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the proposed changes, e.g., 'Construct a 3-bedroom single family home with a garden.'" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingApplication ? 'Save Changes' : 'Submit Application'}
              </Button>
            </form>
        </CardContent>
      </Card>
    </Form>
  );
}
