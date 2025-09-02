
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { format, parse } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { submitApplication } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Application } from '@/lib/definitions';
import { Step1LandDetails } from './form-steps/step1-land-details';
import { Step2DocumentRequirements } from './form-steps/step2-document-requirements';
import { Step3Details } from './form-steps/step3-details';
import { StepIndicator } from './form-steps/step-indicator';
import { Step4DocumentUpload } from './form-steps/step4-document-upload';

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

export type FormValues = z.infer<typeof formSchema>;

export interface Option {
  id: number;
  name: string;
}
export interface District extends Option {}
export interface Circle extends Option {
  district_id: number;
}
export interface SubDivision extends Option {
  circle_id: number;
}
export interface Village extends Option {
  sub_division_id: number;
}
export interface LandPurpose extends Option {
  purpose_name: string;
}
export interface LocationType extends Option {}
export interface AreaUnit extends Option {}
export interface LandClassification extends Option {}
export interface ChangeOfLandUseDate extends Option {}


interface MultiStepFormProps {
  existingApplication?: Application | null;
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

const getInitialValues = (
    application: Application | null | undefined,
    districts: District[],
    circles: Circle[],
    subDivisions: SubDivision[],
    villages: Village[],
    landClassifications: LandClassification[],
    landPurposes: LandPurpose[],
    locationTypes: LocationType[],
    changeOfLandUseDates: ChangeOfLandUseDate[],
    areaUnits: AreaUnit[]
  ): FormValues => {

  if (!application) {
    return {
        name: '',
        date_of_birth: new Date(),
        aadhar_no: '',
        address: '',
        phone_number: '',
        email: '',
        district_id: '',
        circle_id: '',
        sub_division_id: '',
        village_id: '',
        patta_no: '',
        dag_no: '',
        location_type_id: '',
        original_area_of_plot: undefined as any,
        area_unit_id: '',
        area_applied_for_conversion: undefined as any,
        application_area_unit_id: '',
        land_classification_id: '',
        land_purpose_id: '',
        change_of_land_use_id: '',
        purpose_id: '',
      };
  }

  const dobDate = application.dob ? parse(application.dob, 'yyyy-MM-dd', new Date()) : new Date();

  const district = districts.find(d => d.name === application.district);
  const circle = circles.find(c => c.name === application.sdo_circle && c.district_id === district?.id);
  const subDivision = subDivisions.find(s => s.name === application.sub_division && s.circle_id === circle?.id);
  const village = villages.find(v => v.name === application.village && v.sub_division_id === subDivision?.id);

  const landClassification = landClassifications.find(lc => lc.name === application.land_classification);
  const purpose = landPurposes.find(p => p.purpose_name === application.purpose);
  const locationType = locationTypes.find(lt => lt.name === application.location_type);
  
  const landPurpose = landPurposes.find(p => p.id === application.land_purpose_id); 
  const changeOfLandUse = changeOfLandUseDates.find(d => d.id === application.change_of_land_use_id);
  
  return {
    name: application.owner_name || '',
    date_of_birth: dobDate,
    aadhar_no: application.aadhar || '',
    address: application.owner_address || '',
    phone_number: application.phone_number || '',
    email: application.email || '',
    district_id: district?.id.toString() || '',
    circle_id: circle?.id.toString() || '',
    sub_division_id: subDivision?.id.toString() || '',
    village_id: village?.id.toString() || '',
    patta_no: application.patta_no || '',
    dag_no: application.dag_no || '',
    location_type_id: locationType?.id.toString() || '',
    original_area_of_plot: application ? parseFloat(application.original_area_of_plot) : undefined as any,
    area_unit_id: application.area_unit_id?.toString() || '',
    area_applied_for_conversion: application ? parseFloat(application.area_for_change) : undefined as any,
    application_area_unit_id: application.application_area_unit_id?.toString() || '',
    land_classification_id: landClassification?.id.toString() || '',
    land_purpose_id: landPurpose?.id.toString() || '',
    change_of_land_use_id: changeOfLandUse?.id.toString() || '',
    purpose_id: purpose?.id.toString() || '',
  };
};

const steps = [
  { id: 'Step 1', name: 'Plot Details', fields: ['district_id', 'circle_id', 'sub_division_id', 'village_id', 'land_purpose_id', 'change_of_land_use_id'] },
  { id: 'Step 2', name: 'Document Requirements', fields: [] },
  { id: 'Step 3', name: 'Applicant & Detailed Info', fields: ['name', 'date_of_birth', 'aadhar_no', 'address', 'phone_number', 'email', 'patta_no', 'dag_no', 'location_type_id', 'original_area_of_plot', 'area_unit_id', 'area_applied_for_conversion', 'application_area_unit_id', 'land_classification_id', 'purpose_id'] },
  { id: 'Step 4', name: 'Document Upload', fields: [] },
]

export function MultiStepForm({
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
}: MultiStepFormProps) {
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<'land_diversion' | 'land_conversion' | null>(null);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(existingApplication, districts, circles, subDivisions, villages, landClassifications, landPurposes, locationTypes, changeOfLandUseDates, areaUnits),
  });

  const { handleSubmit, trigger, watch } = methods;

  const watchedLandUseChangeId = watch('change_of_land_use_id');

  useEffect(() => {
    if (watchedLandUseChangeId) {
      const selectedOption = changeOfLandUseDates.find(d => d.id.toString() === watchedLandUseChangeId);
      if (selectedOption?.name.includes('Before')) {
        setDocumentType('land_diversion');
        addLog("Document type set to: land_diversion");
      } else {
        setDocumentType('land_conversion');
        addLog("Document type set to: land_conversion");
      }
    }
  }, [watchedLandUseChangeId, changeOfLandUseDates, addLog]);

  const handleNext = async () => {
    const fields = steps[currentStep].fields as (keyof FormValues)[];
    // Only trigger validation if there are fields to validate in the current step
    if (fields.length > 0) {
      const output = await trigger(fields, { shouldFocus: true });
      if (!output) return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
    }
  };

  const processForm = async (values: FormValues) => {
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
        methods.reset(getInitialValues(null, districts, circles, subDivisions, villages, landClassifications, landPurposes, locationTypes, changeOfLandUseDates, areaUnits));
        setCurrentStep(0);
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
    <div className='pb-8 space-y-8'>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(processForm)}>
          <Card className='shadow-lg'>
            <CardContent className='pt-6'>
              {currentStep === 0 && (
                <Step1LandDetails
                  districts={districts}
                  circles={circles}
                  subDivisions={subDivisions}
                  villages={villages}
                  landPurposes={landPurposes}
                  changeOfLandUseDates={changeOfLandUseDates}
                />
              )}
              {currentStep === 1 && <Step2DocumentRequirements documentType={documentType} />}
              {currentStep === 2 && (
                <Step3Details
                    locationTypes={locationTypes}
                    areaUnits={areaUnits}
                    landClassifications={landClassifications}
                    landPurposes={landPurposes}
                />
              )}
              {currentStep === 3 && (
                <Step4DocumentUpload documentType={documentType} />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 pt-5">
            <div className="flex justify-between">
              <div>
                {currentStep < steps.length - 1 && (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                )}
              </div>
              <div className='flex gap-2'>
                <Button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0 || isSubmitting}
                  variant="outline"
                >
                  Go Back
                </Button>
                {currentStep < steps.length - 1 && (
                  <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                  >
                      Next Step
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {existingApplication ? 'Update Application' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
