
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

const fileUploadSchema = z.array(z.string()).optional();

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
  
  original_area_of_plot: z.coerce.number().min(0.00001, "Area must be a positive number"),
  area_unit_id: z.string().min(1, "Area unit is required."),
  area_applied_for_conversion: z.coerce.number().min(0.00001, "Area must be a positive number"),
  application_area_unit_id: z.string().min(1, "Area unit is required."),

  land_classification_id: z.string().min(1, 'Present land classification is required.'),
  land_purpose_id: z.string().min(1, 'Present land use purpose is required.'),
  change_of_land_use_id: z.string().min(1, 'Date of change of land use is required.'),
  purpose_id: z.string().min(1, 'Purpose for which conversion is requested is required.'),

  // Document fields
  patta: fileUploadSchema,
  applicant_aadhar: fileUploadSchema,
  passport_photo: fileUploadSchema,
  marsac_report: fileUploadSchema,
  tax_receipt: fileUploadSchema,
  sale_deed: fileUploadSchema,
  affidavit: fileUploadSchema,
  noc: fileUploadSchema,
  others_relevant_document: fileUploadSchema,

  // Family members
  relatives: z.array(z.object({
    relative_name: z.string(),
    relative_date_of_birth: z.string(),
    relationship: z.string(),
    relative_aadhar: z.string(),
  })).optional(),
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

  const emptyValues: FormValues = {
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
      original_area_of_plot: '' as any,
      area_unit_id: '',
      area_applied_for_conversion: '' as any,
      application_area_unit_id: '',
      land_classification_id: '',
      land_purpose_id: '',
      change_of_land_use_id: '',
      purpose_id: '',
      relatives: [],
    };

  if (!application) {
    return emptyValues;
  }

  const dobDate = application.dob ? parse(application.dob, 'yyyy-MM-dd', new Date()) : new Date();

  // Mapping from name to ID
  const district = districts.find(d => d.name === application.district);
  const circle = circles.find(c => c.name === application.sdo_circle && c.district_id === district?.id);
  // Note: sub_division is not in the new API response, so we can't map it directly.
  // We'll rely on the chained selection logic to handle this.
  const village = villages.find(v => v.name === application.village); 

  const landClassification = landClassifications.find(lc => lc.name === application.land_classification);
  const purpose = landPurposes.find(p => p.purpose_name === application.purpose);
  const locationType = locationTypes.find(lt => lt.name === application.location_type);
  const areaUnit = areaUnits.find(u => u.name === application.original_area_of_plot_unit);
  const applicationAreaUnit = areaUnits.find(u => u.name === application.area_for_change_unit);

  // These are not in the new response, so we need to handle potential undefined values.
  const landPurpose = application.land_purpose_id ? landPurposes.find(p => p.id === application.land_purpose_id) : undefined;
  const changeOfLandUse = application.change_of_land_use_id ? changeOfLandUseDates.find(d => d.id === application.change_of_land_use_id) : undefined;
  
  return {
    name: application.owner_name || '',
    date_of_birth: dobDate,
    aadhar_no: application.aadhar || '',
    address: application.owner_address || '',
    phone_number: application.phone_number || '',
    email: application.email || '',
    district_id: district?.id.toString() || '',
    circle_id: circle?.id.toString() || '',
    sub_division_id: '', // Cannot determine from API, user must re-select
    village_id: village?.id.toString() || '',
    patta_no: application.patta_no || '',
    dag_no: application.dag_no || '',
    location_type_id: locationType?.id.toString() || '',
    original_area_of_plot: application ? parseFloat(application.original_area_of_plot) : ('' as any),
    area_unit_id: areaUnit?.id.toString() || '',
    area_applied_for_conversion: application ? parseFloat(application.area_for_change) : ('' as any),
    application_area_unit_id: applicationAreaUnit?.id.toString() || '',
    land_classification_id: landClassification?.id.toString() || '',
    land_purpose_id: landPurpose?.id.toString() || '', // May be undefined
    change_of_land_use_id: changeOfLandUse?.id.toString() || '', // May be undefined
    purpose_id: purpose?.id.toString() || '',
    relatives: [], // Existing app data doesn't contain this yet
  };
};

const steps = [
  { id: 'Step 1', name: 'Land Details', fields: ['district_id', 'circle_id', 'sub_division_id', 'village_id', 'land_purpose_id', 'change_of_land_use_id'] },
  { id: 'Step 2', name: 'Document Requirements', fields: [] },
  { id: 'Step 3', name: 'Applicant & Plot Info', fields: ['name', 'date_of_birth', 'aadhar_no', 'address', 'phone_number', 'email', 'patta_no', 'dag_no', 'location_type_id', 'original_area_of_plot', 'area_unit_id', 'area_applied_for_conversion', 'application_area_unit_id', 'land_classification_id', 'purpose_id'] },
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
  const [documentType, setDocumentType] = useState<'land_diversion' | 'land_conversion'>('land_conversion');

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
    
    // Create a copy to avoid mutating the original form values
    const payload: { [key: string]: any } = { ...values };

    // Format and convert IDs
    payload.date_of_birth = format(values.date_of_birth, 'yyyy-MM-dd');
    const integerFields = [
      'district_id', 'circle_id', 'sub_division_id', 'village_id', 
      'location_type_id', 'area_unit_id', 'application_area_unit_id', 
      'land_classification_id', 'land_purpose_id', 'change_of_land_use_id', 
      'purpose_id'
    ];
    integerFields.forEach(field => {
        if (payload[field]) payload[field] = parseInt(payload[field]);
    });

    // The API expects single-file uploads to be a string, not an array.
    // We will take the first element of the array for these fields.
    const singleFileFields = ['applicant_aadhar', 'passport_photo', 'marsac_report', 'tax_receipt', 'sale_deed', 'affidavit', 'noc'];
    singleFileFields.forEach(field => {
        if (Array.isArray(payload[field]) && payload[field].length > 0) {
            payload[field] = payload[field][0];
        } else {
            delete payload[field]; // Remove if no file was uploaded
        }
    });

    // For multiple file fields, ensure they are arrays.
    const multiFileFields = ['patta', 'others_relevant_document'];
    multiFileFields.forEach(field => {
        if (!Array.isArray(payload[field]) || payload[field].length === 0) {
            delete payload[field]; // Remove if no files were uploaded
        }
    });

    if(!payload.relatives || payload.relatives.length === 0) {
        delete payload.relatives;
    }
    
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
                <Step4DocumentUpload documentType={documentType} accessToken={accessToken} />
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
