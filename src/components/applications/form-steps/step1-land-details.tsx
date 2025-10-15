
'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { District, Circle, SubDivision, Village, LandPurpose, ChangeOfLandUseDate, FormValues } from '../multi-step-form';

interface Step1Props {
  districts: District[];
  circles: Circle[];
  subDivisions: SubDivision[];
  villages: Village[];
  landPurposes: LandPurpose[];
  changeOfLandUseDates: ChangeOfLandUseDate[];
  formType: 'normal' | 'hill';
}

export function Step1LandDetails({
  districts,
  circles,
  subDivisions,
  villages,
  landPurposes,
  changeOfLandUseDates,
  formType,
}: Step1Props) {
  const { control, watch, setValue, getValues } = useFormContext<FormValues>();

  const [filteredSubDivisions, setFilteredSubDivisions] = useState<SubDivision[]>([]);
  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  
  const watchedDistrictId = watch('district_id');
  const watchedSubDivisionId = watch('sub_division_id');
  const watchedCircleId = watch('circle_id');
  
  useEffect(() => {
    const districtId = parseInt(watchedDistrictId);
    if (!isNaN(districtId)) {
      const relevantSubDivisions = subDivisions.filter(sd => sd.district_id === districtId);
      setFilteredSubDivisions(relevantSubDivisions);
      
      const currentSubDivisionId = getValues('sub_division_id');
      if (currentSubDivisionId && !relevantSubDivisions.some(sd => sd.id.toString() === currentSubDivisionId)) {
        setValue('sub_division_id', '');
        setValue('circle_id', '');
        setValue('village_id', '');
      }
    } else {
      setFilteredSubDivisions([]);
      setFilteredCircles([]);
      setFilteredVillages([]);
    }
  }, [watchedDistrictId, subDivisions, setValue, getValues]);

  useEffect(() => {
    const subDivisionId = parseInt(watchedSubDivisionId);
    if (!isNaN(subDivisionId)) {
      const relevantCircles = circles.filter(c => c.sub_division_id === subDivisionId);
      setFilteredCircles(relevantCircles);

      const currentCircleId = getValues('circle_id');
      if (currentCircleId && !relevantCircles.some(c => c.id.toString() === currentCircleId)) {
        setValue('circle_id', '');
        setValue('village_id', '');
      }
    } else {
      setFilteredCircles([]);
      setFilteredVillages([]);
    }
  }, [watchedSubDivisionId, circles, setValue, getValues]);

  useEffect(() => {
    const circleId = parseInt(watchedCircleId);
    if (formType === 'normal' && !isNaN(circleId)) {
      const relevantVillages = villages.filter(v => v.circle_id === circleId);
      setFilteredVillages(relevantVillages);

      const currentVillageId = getValues('village_id');
      if (currentVillageId && !relevantVillages.some(v => v.id.toString() === currentVillageId)) {
        setValue('village_id', '');
      }
    } else {
      setFilteredVillages([]);
    }
  }, [watchedCircleId, villages, setValue, getValues, formType]);

  useEffect(() => {
    const initialDistrictId = getValues('district_id');
    if (initialDistrictId) {
      setFilteredSubDivisions(subDivisions.filter(sd => sd.district_id === parseInt(initialDistrictId)));
    }
    const initialSubDivisionId = getValues('sub_division_id');
    if (initialSubDivisionId) {
       setFilteredCircles(circles.filter(c => c.sub_division_id === parseInt(initialSubDivisionId)));
    }
    const initialCircleId = getValues('circle_id');
    if (initialCircleId) {
       setFilteredVillages(villages.filter(v => v.circle_id === parseInt(initialCircleId)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="font-headline">Land Details</CardTitle>
        <CardDescription>Provide details about the plot of land.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="district_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District <span className="text-destructive">*</span></FormLabel>
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
          name="sub_division_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Division <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!watchedDistrictId || filteredSubDivisions.length === 0}>
                <FormControl><SelectTrigger><SelectValue placeholder={!watchedDistrictId ? "Select a district first" : "Select Sub Division"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {filteredSubDivisions.map((subDivision) => (<SelectItem key={subDivision.id} value={subDivision.id.toString()}>{subDivision.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {formType === 'normal' && (
          <>
            <FormField
              control={control}
              name="circle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circle <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchedSubDivisionId || filteredCircles.length === 0}>
                    <FormControl><SelectTrigger><SelectValue placeholder={!watchedSubDivisionId ? "Select a sub-division first" : "Select Circle"} /></SelectTrigger></FormControl>
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
              name="village_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!watchedCircleId || filteredVillages.length === 0}>
                    <FormControl><SelectTrigger><SelectValue placeholder={!watchedCircleId ? "Select a circle first" : "Select Village"} /></SelectTrigger></FormControl>
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
                  <FormLabel>Purpose for which land is presently used <span className="text-destructive">*</span></FormLabel>
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
                  <FormLabel>Date of change of land use <span className="text-destructive">*</span></FormLabel>
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
          </>
        )}
      </div>
    </div>
  );
}
