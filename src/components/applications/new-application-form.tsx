
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, parse } from 'date-fns';
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
  FormDescription,
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
import { submitApplication } from '@/app/actions';
import { Textarea } from '../ui/textarea';
import { useDebug } from '@/context/DebugContext';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  date_of_birth: z.date({ required_error: 'Date of birth is required.' }),
  aadhar_no: z.string().length(12, 'Aadhar number must be 12 digits.'),
  address: z.string().min(1, 'Address is required.'),
  phone_number: z.string().length(10, 'Phone number must be 10 digits.'),
  email: z.string().email('Invalid email address.'),
  
  district_id: z.string().min(1, 'District is required.'),
  circle_id: z.string().min(1, 'Circle is required.'),
  sub_division_id: z.string().min(1, 'Sub Division is required.'),
  village_id: z.string().min(1, 'Village is required.'),
  patta_no: z.string().min(1, 'Patta number is required.'),
  dag_no: z.string().min(1, 'Dag number is required.'),
  location_type_id: z.string().min(1, 'Location type is required.'),
  
  original_area_of_plot: z.coerce.number().min(0, "Area must be a positive number"),
  area_unit_id: z.string().min(1, "Area unit is required."),
  area_applied_for_conversion: z.coerce.number().min(0, "Area must be a positive number"),
  application_area_unit_id: z.string().min(1, "Area unit is required."),

  land_classification_id: z.string().min(1, 'Present land classification is required.'),
  land_purpose_id: z.string().min(1, 'Present land use purpose is required.'),
  change_of_land_use_id: z.string().min(1, 'Date of change of land use is required.'),
  purpose_id: z.string().min(1, 'Purpose for which conversion is requested is required.'),
});

type FormValues = z.infer<typeof formSchema>;

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
interface LocationType extends Option {}
interface AreaUnit extends Option {}
interface LandClassification extends Option {}
interface ChangeOfLandUseDate extends Option {}


interface NewApplicationFormProps {
  existingApplication?: Application;
  districts: District[];
  circles: Circle[];
  subDivisions: SubDivision[];
  villages: Village[];
  landPurposes: LandPurpose[];
  locationTypes: LocationType[];
  areaUnits: AreaUnit[];
  landClassifications: LandClassification[];
  changeOfLandUseDates: ChangeOfLandUseDate[];
  accessToken: string;
}

export function NewApplicationForm({
  existingApplication,
  districts,
  circles,
  subDivisions,
  villages,
  landPurposes,
  locationTypes,
  areaUnits,
  landClassifications,
  changeOfLandUseDates,
  accessToken,
}: NewApplicationFormProps) {
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [dobInput, setDobInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingApplication ? undefined : {
      name: '',
      aadhar_no: '',
      address: '',
      phone_number: '',
      email: '',
      patta_no: '',
      dag_no: '',
      original_area_of_plot: 0,
      area_applied_for_conversion: 0,
      district_id: '',
      circle_id: '',
      sub_division_id: '',
      village_id: '',
      location_type_id: '',
      area_unit_id: '',
      application_area_unit_id: '',
      land_classification_id: '',
      land_purpose_id: '',
      change_of_land_use_id: '',
      purpose_id: '',
    },
  });

  useEffect(() => {
    if (existingApplication) {
      const dobDate = existingApplication.dob ? parse(existingApplication.dob, 'yyyy-MM-dd', new Date()) : undefined;

      form.reset({
        name: existingApplication.owner_name || '',
        date_of_birth: dobDate,
        aadhar_no: existingApplication.aadhar || '',
        address: existingApplication.owner_address || '',
        phone_number: existingApplication.phone_number || '',
        email: existingApplication.email || '',
        district_id: existingApplication.district_id?.toString() || '',
        circle_id: existingApplication.circle_id?.toString() || '',
        sub_division_id: existingApplication.sub_division_id?.toString() || '',
        village_id: existingApplication.village_id?.toString() || '',
        patta_no: existingApplication.patta_no || '',
        dag_no: existingApplication.dag_no || '',
        location_type_id: existingApplication.location_type_id?.toString() || '',
        original_area_of_plot: parseFloat(existingApplication.original_area_of_plot) || 0,
        area_unit_id: existingApplication.area_unit_id?.toString() || '',
        area_applied_for_conversion: parseFloat(existingApplication.area_for_change) || 0,
        application_area_unit_id: existingApplication.application_area_unit_id?.toString() || '',
        land_classification_id: existingApplication.land_classification_id?.toString() || '',
        land_purpose_id: existingApplication.land_purpose_id?.toString() || '',
        change_of_land_use_id: existingApplication.change_of_land_use_id?.toString() || '',
        purpose_id: existingApplication.purpose_id?.toString() || '',
      });
       if (dobDate) {
        setDobInput(format(dobDate, 'dd/MM/yyyy'));
      }
    }
  }, [existingApplication, form]);

  const selectedDistrictId = form.watch('district_id');
  const selectedCircleId = form.watch('circle_id');
  const selectedSubDivisionId = form.watch('sub_division_id');
  const dobValue = form.watch('date_of_birth');

  useEffect(() => {
    if (dobValue) {
      setDobInput(format(dobValue, 'dd/MM/yyyy'));
    } else {
      setDobInput('');
    }
  }, [dobValue]);
  
  useEffect(() => {
    const districtId = form.getValues('district_id');
    if (districtId) {
      const relevantCircles = circles.filter(c => c.district_id === parseInt(districtId));
      setFilteredCircles(relevantCircles);

      if (!relevantCircles.find(c => c.id.toString() === form.getValues('circle_id'))) {
        form.setValue('circle_id', '');
        form.setValue('sub_division_id', '');
        form.setValue('village_id', '');
      }
    } else {
      setFilteredCircles([]);
    }
  }, [selectedDistrictId, circles, form]);

  useEffect(() => {
    const circleId = form.getValues('circle_id');
    if (circleId) {
      const relevantSubDivisions = subDivisions.filter(sd => sd.circle_id === parseInt(circleId));
      setFilteredSubDivisions(relevantSubDivisions);

      if (!relevantSubDivisions.find(sd => sd.id.toString() === form.getValues('sub_division_id'))) {
        form.setValue('sub_division_id', '');
        form.setValue('village_id', '');
      }
    } else {
      setFilteredSubDivisions([]);
    }
  }, [selectedCircleId, subDivisions, form]);

  useEffect(() => {
    const subDivisionId = form.getValues('sub_division_id');
    if (subDivisionId) {
      const relevantVillages = villages.filter(v => v.sub_division_id === parseInt(subDivisionId));
      setFilteredVillages(relevantVillages);

      if (!relevantVillages.find(v => v.id.toString() === form.getValues('village_id'))) {
        form.setValue('village_id', '');
      }
    } else {
      setFilteredVillages([]);
    }
  }, [selectedSubDivisionId, villages, form]);


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const payload = {
      ...values,
      date_of_birth: format(values.date_of_birth, 'yyyy-MM-dd'),
      district_id: parseInt(values.district_id),
      circle_id: parseInt(values.circle_id),
      sub_division_id: parseInt(values.sub_division_id),
      village_id: parseInt(values.village_id),
      location_type_id: parseInt(values.location_type_id),
      area_unit_id: parseInt(values.area_unit_id),
      application_area_unit_id: parseInt(values.application_area_unit_id),
      land_classification_id: parseInt(values.land_classification_id),
      land_purpose_id: parseInt(values.land_purpose_id),
      change_of_land_use_id: parseInt(values.change_of_land_use_id),
      purpose_id: parseInt(values.purpose_id),
    };
    
    const result = await submitApplication(payload, accessToken);
    
    if (result.debugLog) {
        addLog(result.debugLog);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: existingApplication ? 'Application Updated!' : 'Application Submitted!',
        description: result.message || `Your application has been ${existingApplication ? 'updated' : 'received'}.`,
      });
      if (!existingApplication) {
        form.reset();
      }
    } else {
       toast({
        title: 'Submission Failed',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='pb-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Applicant Details</CardTitle>
              <CardDescription>Enter the personal details of the applicant.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Patta Holder</FormLabel>
                      <FormControl><Input placeholder="Enter full name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
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
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
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
                <FormField
                  control={form.control}
                  name="aadhar_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Number</FormLabel>
                      <FormControl><Input placeholder="Enter 12-digit Aadhar" {...field} maxLength={12} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel>Address</FormLabel>
                      <FormControl><Textarea placeholder="Enter full address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="Enter 10-digit mobile number" {...field} maxLength={10} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="Enter email address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Land Details</CardTitle>
              <CardDescription>Provide details about the plot of land.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="district_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {districts.map((district) => (<SelectItem key={district.id} value={district.id.toString()}>{district.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="circle_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Circle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrictId || filteredCircles.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedDistrictId ? "Select a district first" : "Select Circle"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredCircles.map((circle) => (<SelectItem key={circle.id} value={circle.id.toString()}>{circle.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sub_division_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Division</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCircleId || filteredSubDivisions.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedCircleId ? "Select a circle first" : "Select Sub Division"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredSubDivisions.map((subDivision) => (<SelectItem key={subDivision.id} value={subDivision.id.toString()}>{subDivision.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="village_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubDivisionId || filteredVillages.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!selectedSubDivisionId ? "Select a sub-division first" : "Select Village"} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredVillages.map((village) => (<SelectItem key={village.id} value={village.id.toString()}>{village.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patta_no"
                  render={({ field }) => (<FormItem><FormLabel>Patta No.</FormLabel><FormControl><Input placeholder="Enter Patta No." {...field} /></FormControl><FormMessage /></FormItem>)}
                />
                <FormField
                  control={form.control}
                  name="dag_no"
                  render={({ field }) => (<FormItem><FormLabel>Dag No.</FormLabel><FormControl><Input placeholder="Enter Dag No." {...field} /></FormControl><FormMessage /></FormItem>)}
                />
                <FormField
                  control={form.control}
                  name="location_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Location Type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {locationTypes.map((loc) => (<SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">Conversion Details</CardTitle>
              <CardDescription>Specify the area and purpose for the land use change.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <FormLabel>Original area of plot</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                          <FormField
                              control={form.control}
                              name="original_area_of_plot"
                              render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Enter area" {...field} /></FormControl><FormMessage /></FormItem>)}
                          />
                          <FormField
                              control={form.control}
                              name="area_unit_id"
                              render={({ field }) => (
                              <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {areaUnits.map((unit) => (<SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>))}
                                  </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                      </div>
                  </div>

                  <div className="space-y-2">
                      <FormLabel>Area applied for conversion</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                          <FormField
                              control={form.control}
                              name="area_applied_for_conversion"
                              render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Enter area" {...field} /></FormControl><FormMessage /></FormItem>)}
                          />
                          <FormField
                              control={form.control}
                              name="application_area_unit_id"
                              render={({ field }) => (
                              <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      {areaUnits.map((unit) => (<SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>))}
                                  </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                      </div>
                  </div>

                <FormField
                  control={form.control}
                  name="land_classification_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Present Land Classification</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select classification" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {landClassifications.map((lc) => (<SelectItem key={lc.id} value={lc.id.toString()}>{lc.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="land_purpose_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose for which land is presently used</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select current purpose" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {landPurposes.map((purpose) => (<SelectItem key={purpose.id} value={purpose.id.toString()}>{purpose.purpose_name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="change_of_land_use_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of change of land use</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {changeOfLandUseDates.map((d) => (<SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose for which conversion is requested</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select requested purpose" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {landPurposes.map((purpose) => (<SelectItem key={purpose.id} value={purpose.id.toString()}>{purpose.purpose_name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Save Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (<Loader2 className="mr-2 h-4 w-4 animate-spin" />)}
              {existingApplication ? 'Update Application' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
