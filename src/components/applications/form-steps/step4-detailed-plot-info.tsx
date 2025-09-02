
'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { LocationType, AreaUnit, LandClassification, LandPurpose, FormValues } from '../multi-step-form';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface Step4Props {
    locationTypes: LocationType[];
    areaUnits: AreaUnit[];
    landClassifications: LandClassification[];
    landPurposes: LandPurpose[];
}

export function Step4DetailedPlotInfo({ locationTypes, areaUnits, landClassifications, landPurposes }: Step4Props) {
  const { control } = useFormContext<FormValues>();
  
  return (
    <div className="space-y-8">
        <CardHeader className='p-0'>
            <CardTitle className="font-headline">Detailed Plot Information</CardTitle>
            <CardDescription>Specify the area and purpose for the land use change.</CardDescription>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <FormField
                control={control}
                name="purpose_id"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Purpose for which conversion is requested</FormLabel>                    <Select onValueChange={field.onChange} value={field.value}>
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
    </div>
  );
}
