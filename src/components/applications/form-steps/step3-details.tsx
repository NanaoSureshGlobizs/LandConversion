
'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LocationType, AreaUnit, LandClassification, LandPurpose, Purpose, FormValues } from '../multi-step-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface Step3Props {
    locationTypes: LocationType[];
    areaUnits: AreaUnit[];
    landClassifications: LandClassification[];
    landPurposes: LandPurpose[];
    purposes: Purpose[];
    documentType: 'land_diversion' | 'land_conversion';
    formType: 'normal' | 'hill';
}

export function Step3Details({ locationTypes, areaUnits, landClassifications, landPurposes, purposes, documentType, formType }: Step3Props) {
  const { control, watch } = useFormContext<FormValues>();

  const watchedPurposeId = watch('purpose_id');
  const otherPurpose = purposes.find(p => p.name === 'Other');
  const showOtherPurposeField = otherPurpose && watchedPurposeId === otherPurpose.id.toString();

  const aadharConsent = watch('aadhar_consent');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Applicant Details</CardTitle>
          <CardDescription>Enter the personal details of the applicant.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formType === 'hill' ? 'Name of the Village Authorities' : 'Name of Patta Holder'} <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder={formType === 'hill' ? 'Enter village authority name' : 'Enter full name'} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal h-10',
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
            </div>
            <Separator />
             <FormField
                control={control}
                name="aadhar_consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Aadhaar Consent
                      </FormLabel>
                      <FormDescription>
                        I hereby give my consent for the use of my AADHAAR number for verification and data retrieval purposes. I understand that my AADHAAR number will be used to confirm my identity and retrieve relevant information associated with my AADHAAR profile. I also understand that this information will be kept confidential and secure and will only be used for the specific purpose for which I am giving my consent. I have the right to withdraw my consent at any time by contacting the organization using this verification and data retrieval process. By giving my consent, I confirm that the information provided is accurate and that I am the person to whom the Aadhaar number belongs.
                      </FormDescription>
                       <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

             <FormField
                control={control}
                name="aadhar_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Enter 12-digit Aadhaar" {...field} maxLength={12} disabled={!aadharConsent} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <Separator />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Textarea placeholder="Enter full address" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Enter 10-digit mobile number" {...field} maxLength={10} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Enter email address" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Detailed Plot Information</CardTitle>
          <CardDescription>Specify the area and purpose for the land use change.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formType === 'normal' && (
                <>
                    <FormField
                        control={control}
                        name="patta_no"
                        render={({ field }) => (<FormItem><FormLabel>Patta No. <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Enter Patta No." {...field} /></FormControl><FormMessage /></FormItem>)}
                    />
                    <FormField
                        control={control}
                        name="dag_no"
                        render={({ field }) => (<FormItem><FormLabel>Dag No. <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="Enter Dag No." {...field} /></FormControl><FormMessage /></FormItem>)}
                    />
                    <FormField
                        control={control}
                        name="location_type_id"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location Type <span className="text-destructive">*</span></FormLabel>
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
                    <div></div>
                </>
              )}
              <div className="space-y-2">
                  <FormLabel>Original area of plot <span className="text-destructive">*</span></FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                      <FormField
                          control={control}
                          name="original_area_of_plot"
                          render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Enter area" {...field} /></FormControl><FormMessage /></FormItem>)}
                      />
                      <FormField
                          control={control}
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
                  <FormLabel>Area applied for conversion <span className="text-destructive">*</span></FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                      <FormField
                          control={control}
                          name="area_applied_for_conversion"
                          render={({ field }) => (<FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Enter area" {...field} /></FormControl><FormMessage /></FormItem>)}
                      />
                      <FormField
                          control={control}
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

              {formType === 'normal' && (
                <FormField
                    control={control}
                    name="land_classification_id"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Present Land Classification <span className="text-destructive">*</span></FormLabel>
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
              )}
              <FormField
                  control={control}
                  name="purpose_id"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Purpose for which conversion is requested <span className="text-destructive">*</span></FormLabel>                    
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select requested purpose" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {purposes.map((purpose) => (<SelectItem key={purpose.id} value={purpose.id.toString()}>{purpose.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              {showOtherPurposeField && (
                <FormField
                  control={control}
                  name="other_entry"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Please specify other purpose <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter other purpose" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
               {formType === 'hill' && (
                <FormField
                  control={control}
                  name="land_address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Land Address <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Textarea placeholder="Enter land address" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
