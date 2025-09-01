'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { districts, villages, landUseTypes } from '@/lib/mock-data';
import { suggestLandUseIssues } from '@/ai/flows/suggest-land-use-issues';

const formSchema = z.object({
  surveyNumber: z.string().min(1, 'Survey number is required.'),
  village: z.string().min(1, 'Village is required.'),
  district: z.string().min(1, 'District is required.'),
  currentLandUse: z.string().min(1, 'Current land use is required.'),
  proposedLandUse: z.string().min(10, 'Proposed land use description is required.'),
  zoningRegulations: z.string().min(10, 'Zoning regulations are required for AI analysis.'),
});

type FormValues = z.infer<typeof formSchema>;

export function NewApplicationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyNumber: '',
      village: '',
      district: '',
      currentLandUse: '',
      proposedLandUse: '',
      zoningRegulations: 'The area is zoned for agricultural use. Commercial buildings are restricted. Minimum plot size for residential construction is 5000 sq. ft.',
    },
  });

  const proposedLandUseValue = useWatch({
    control: form.control,
    name: 'proposedLandUse',
  });
  const zoningRegulationsValue = useWatch({
    control: form.control,
    name: 'zoningRegulations',
  });

  const handleAnalyze = async () => {
    const isProposedLandUseValid = await form.trigger('proposedLandUse');
    const isZoningValid = await form.trigger('zoningRegulations');

    if (!isProposedLandUseValid || !isZoningValid) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide both proposed land use and zoning regulations for analysis.",
        });
        return;
    }

    setIsAnalyzing(true);
    setAiSuggestions('');
    try {
      const result = await suggestLandUseIssues({
        proposedLandUse: proposedLandUseValue,
        existingZoningRegulations: zoningRegulationsValue,
      });
      setAiSuggestions(result.suggestedIssues);
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: 'Could not get suggestions from the AI. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);

    console.log('Form Submitted:', values);

    toast({
      title: 'Application Submitted!',
      description: `Your application for survey no. ${values.surveyNumber} has been received.`,
    });
    form.reset();
    setAiSuggestions('');
  };

  return (
    <Form {...form}>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 shadow-lg">
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>Proposed Land Use</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the proposed changes, e.g., 'Construct a 3-bedroom single family home with a garden.'" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              
              <Button type="submit" disabled={isSubmitting} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </form>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card className="shadow-lg bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Sparkles className="text-accent" />
                    AI-Powered Compliance Check
                </CardTitle>
                <CardDescription>
                    Use our AI tool to identify potential issues with your proposal before you submit.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <FormField
                  control={form.control}
                  name="zoningRegulations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Zoning Regulations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the area's zoning rules..." className="min-h-[100px] bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full" type="button">
                    {isAnalyzing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze with AI
                </Button>
            </CardContent>
        </Card>
        
        {(isAnalyzing || aiSuggestions) && (
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline">AI Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {isAnalyzing ? (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            <span>Analyzing...</span>
                        </div>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap">{aiSuggestions}</p>
                    )}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
    </Form>
  );
}
