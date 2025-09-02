'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { useToast } from '@/hooks/use-toast';
import type { Application } from '@/lib/definitions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getDropdownData } from '@/app/actions';

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

interface Option {
  id: number;
  name: string;
}
interface District extends Option {}
interface Circle extends Option {
  district_id: number;
}
interface SubDivision extends Option {
  circle_id: number;
}
interface Village extends Option {
  sub_division_id: number;
}
interface LandPurpose extends Option {
    purpose_name: string;
}


export function NewApplicationForm({
  existingApplication,
}: NewApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [districts, setDistricts] = useState<District[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [subDivisions, setSubDivisions] = useState<SubDivision[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [landPurposes, setLandPurposes] = useState<LandPurpose[]>([]);
  
  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);


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
  
  const selectedDistrictId = form.watch('district');
  const selectedCircleId = form.watch('circle');
  const selectedSubDivisionId = form.watch('subDivision');

  useEffect(() => {
    const fetchData = async () => {
      // In a real app, the token might be stored in context or a more secure httpOnly cookie
      // For this scenario, we read it from the cookie if available on the client.
      const token = Cookies.get('accessToken');
      if (!token) {
        console.error("Authentication token not found. Cannot fetch form data.");
        // Optionally, show a toast to the user
        toast({
            title: "Authentication Error",
            description: "Could not fetch form data. Please try logging in again.",
            variant: "destructive"
        });
        return;
      }

      const [districtsData, circlesData, subDivisionsData, villagesData, landPurposesData] = await Promise.all([
        getDropdownData('/district', token),
        getDropdownData('/circle', token),
        getDropdownData('/sub-division', token),
        getDropdownData('/village', token),
        getDropdownData('/land-purpose', token),
      ]);
      setDistricts(districtsData);
      setCircles(circlesData);
      setSubDivisions(subDivisionsData);
      setVillages(villagesData);
      setLandPurposes(landPurposesData);
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (selectedDistrictId) {
      form.setValue('circle', '');
      form.setValue('subDivision', '');
      form.setValue('village', '');
      setFilteredCircles(circles.filter(c => c.district_id === parseInt(selectedDistrictId)));
      setFilteredSubDivisions([]);
      setFilteredVillages([]);
    }
  }, [selectedDistrictId, circles, form]);
  
  useEffect(() => {
    if (selectedCircleId) {
      form.setValue('subDivision', '');
      form.setValue('village', '');
      setFilteredSubDivisions(subDivisions.filter(sd => sd.circle_id === parseInt(selectedCircleId)));
      setFilteredVillages([]);
    }
  }, [selectedCircleId, subDivisions, form]);

  useEffect(() => {
    if (selectedSubDivisionId) {
      form.setValue('village', '');
      setFilteredVillages(villages.filter(v => v.sub_division_id === parseInt(selectedSubDivisionId)));
    }
  }, [selectedSubDivisionId, villages, form]);

  useEffect(() => {
    if (existingApplication) {
      // This part would need more complex logic to match names to IDs from fetched data
      // For now, it will set the IDs if they exist on the mock.
      form.reset({
        // district: existingApplication.district,
        // village: existingApplication.village,
        purpose: existingApplication.purpose,
        // circle: existingApplication.sdoCircle,
        // subDivision: existingApplication.sdoCircle,
        dateOfChange: new Date(existingApplication.dateSubmitted),
      });
    }
  }, [existingApplication, form, districts, circles, subDivisions, villages]);

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
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.name}
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
                      disabled={!selectedDistrictId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Circle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCircles.map((circle) => (
                          <SelectItem key={circle.id} value={circle.id.toString()}>
                            {circle.name}
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
                      disabled={!selectedCircleId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sub Division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubDivisions.map((subDivision) => (
                          <SelectItem key={subDivision.id} value={subDivision.id.toString()}>
                            {subDivision.name}
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
                      disabled={!selectedSubDivisionId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Village" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredVillages.map((village) => (
                          <SelectItem key={village.id} value={village.id.toString()}>
                            {village.name}
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
                        {landPurposes.map((purpose) => (
                          <SelectItem key={purpose.id} value={purpose.id.toString()}>
                            {purpose.purpose_name}
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
