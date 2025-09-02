
'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Circle, District, SubDivision, Village, FormValues, LandPurpose, ChangeOfLandUseDate } from '../multi-step-form';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Step1Props {
  districts: District[];
  circles: Circle[];
  subDivisions: SubDivision[];
  villages: Village[];
  landPurposes: LandPurpose[];
  changeOfLandUseDates: ChangeOfLandUseDate[];
}

export function Step1LandDetails({ districts, circles, subDivisions, villages, landPurposes, changeOfLandUseDates }: Step1Props) {
  const { control, watch, setValue, getValues } = useFormContext<FormValues>();

  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  
  const selectedDistrictId = watch('district_id');
  const selectedCircleId = watch('circle_id');
  const selectedSubDivisionId = watch('sub_division_id');
  
  useEffect(() => {
    const initialDistrictId = getValues('district_id');
    if (initialDistrictId) {
        setFilteredCircles(circles.filter(c => c.district_id === parseInt(initialDistrictId)));
    }
    const initialCircleId = getValues('circle_id');
    if (initialCircleId) {
        setFilteredSubDivisions(subDivisions.filter(sd => sd.circle_id === parseInt(initialCircleId)));
    }
    const initialSubDivisionId = getValues('sub_division_id');
    if (initialSubDivisionId) {
        setFilteredVillages(villages.filter(v => v.sub_division_id === parseInt(initialSubDivisionId)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDistrictId) {
      const relevantCircles = circles.filter(c => c.district_id === parseInt(selectedDistrictId));
      setFilteredCircles(relevantCircles);
      
      const currentCircleId = getValues('circle_id');
      if (currentCircleId && !relevantCircles.some(c => c.id.toString() === currentCircleId)) {
        setValue('circle_id', '');
        setValue('sub_division_id', '');
        setValue('village_id', '');
      }
    } else {
      setFilteredCircles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId, circles]);

  useEffect(() => {
    if (selectedCircleId) {
      const relevantSubDivisions = subDivisions.filter(sd => sd.circle_id === parseInt(selectedCircleId));
      setFilteredSubDivisions(relevantSubDivisions);

      const currentSubDivisionId = getValues('sub_division_id');
      if (currentSubDivisionId && !relevantSubDivisions.some(sd => sd.id.toString() === currentSubDivisionId)) {
        setValue('sub_division_id', '');
        setValue('village_id', '');
      }
    } else {
      setFilteredSubDivisions([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCircleId, subDivisions]);

  useEffect(() => {
    if (selectedSubDivisionId) {
      const relevantVillages = villages.filter(v => v.sub_division_id === parseInt(selectedSubDivisionId));
      setFilteredVillages(relevantVillages);

      const currentVillageId = getValues('village_id');
      if (currentVillageId && !relevantVillages.some(v => v.id.toString() === currentVillageId)) {
        setValue('village_id', '');
      }
    } else {
      setFilteredVillages([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubDivisionId, villages]);

  return (
    <div className="space-y-8">
      <CardHeader className='p-0'>
        <CardTitle className="font-headline">Plot Details</CardTitle>
        <CardDescription>Provide details about the plot of land.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
            control={control}
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
      </div>
    </div>
  );
}
