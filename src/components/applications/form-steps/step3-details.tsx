
'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, HelpCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LocationType, AreaUnit, LandClassification, LandPurpose, Purpose, FormValues } from '../multi-step-form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
                    <FormLabel>{formType === 'hill' ? 'Name of the Village Authorities' : 'Name of Patta Holder'}</FormLabel>
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
                    <FormLabel>Date of Birth</FormLabel>
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
             <FormField
                control={control}
                name="aadhar_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                        Aadhaar Number
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-bold mb-2">Aadhaar Privacy Notice</p>
                            <p className="text-xs">
                              We collect your Aadhaar number for identity verification and KYC compliance as required for this service. Providing Aadhaar is mandatory for this application. Your information will be used only for authentication through UIDAI's system. We will not store your biometric information.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl><Input placeholder="Enter 12-digit Aadhaar" {...field} maxLength={12} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
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
                    <FormLabel>Phone Number</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
                        render={({ field }) => (<FormItem><FormLabel>Patta No.</FormLabel><FormControl><Input placeholder="Enter Patta No." {...field} /></FormControl><FormMessage /></FormItem>)}
                    />
                    <FormField
                        control={control}
                        name="dag_no"
                        render={({ field }) => (<FormItem><FormLabel>Dag No.</FormLabel><FormControl><Input placeholder="Enter Dag No." {...field} /></FormControl><FormMessage /></FormItem>)}
                    />
                    <FormField
                        control={control}
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
                    <div></div>
                </>
              )}
              <div className="space-y-2">
                  <FormLabel>Original area of plot</FormLabel>
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
                  <FormLabel>Area applied for conversion</FormLabel>
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
              )}
              <FormField
                  control={control}
                  name="purpose_id"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Purpose for which conversion is requested</FormLabel>                    
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
                      <FormLabel>Please specify other purpose</FormLabel>
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
                      <FormLabel>Land Address</FormLabel>
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

  

    
