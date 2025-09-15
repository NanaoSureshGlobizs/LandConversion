
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import type { FullApplicationResponse } from '@/lib/definitions';
import { Step1LandDetails } from './form-steps/step1-land-details';
import { Step2DocumentRequirements } from './form-steps/step2-document-requirements';
import { Step3Details } from './form-steps/step3-details';
import { StepIndicator } from './form-steps/step-indicator';
import { Step4DocumentUpload } from './form-steps/step4-document-upload';
import { Step5Preview } from './form-steps/step5-preview';

const fileUploadSchema = z.array(z.string()).optional();
const otherDocumentSchema = z.array(z.object({
  file_name: z.string(),
  file_path: z.string(),
})).optional();

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  date_of_birth: z.date({ required_error: 'Date of birth is required.' }),
  aadhar_no: z.string().length(12, 'Aadhaar number must be 12 digits.'),
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
  other_entry: z.string().optional(),

  // Land Diversion fields
  exact_build_up_area: z.coerce.number().optional(),
  exact_build_up_area_unit_id: z.string().optional(),
  previously_occupied_area: z.coerce.number().optional(),
  previously_occupied_area_unit_id: z.string().optional(),

  // Document fields
  patta: fileUploadSchema,
  applicant_aadhar: fileUploadSchema,
  passport_photo: fileUploadSchema,
  tax_receipt: fileUploadSchema,
  deed_certificate: fileUploadSchema,
  affidavit_certificate: fileUploadSchema,
  noc_certificate: fileUploadSchema,
  others_relevant_document: otherDocumentSchema,

  // Family members
  relatives: z.array(z.object({
    relative_name: z.string(),
    relative_date_of_birth: z.string(),
    relationship: z.string(),
    relationship_id: z.number(),
    relative_aadhar: z.string(),
  })).optional(),
});


export type FormValues = z.infer<typeof formSchema>;

export interface Option {
  id: number;
  name: string;
}
export interface District extends Option {}
export interface SubDivision extends Option {
  district_id: number;
}
export interface Circle extends Option {
  sub_division_id: number;
}
export interface Village extends Option {
  circle_id: number;
}
export interface LandPurpose extends Option {
  purpose_name: string;
}
export interface LocationType extends Option {}
export interface AreaUnit extends Option {}
export interface LandClassification extends Option {}
export interface ChangeOfLandUseDate extends Option {}
export interface Purpose extends Option {}
export interface Relationship extends Option {}


interface MultiStepFormProps {
  existingApplication?: FullApplicationResponse | null;
  districts: District[];
  circles: Circle[];
  subDivisions: SubDivision[];
  villages: Village[];
  landPurposes: LandPurpose[];
  locationTypes: LocationType[];
  areaUnits: AreaUnit[];
  landClassifications: LandClassification[];
  changeOfLandUseDates: ChangeOfLandUseDate[];
  purposes: Purpose[];
  relationships: Relationship[];
  accessToken: string;
}

const getInitialValues = (
    application: FullApplicationResponse | null | undefined,
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
      other_entry: '',
      relatives: [],
      others_relevant_document: [],
    };

  if (!application) {
    return emptyValues;
  }

  const dobDate = application.date_of_birth ? parse(application.date_of_birth, 'yyyy-MM-dd', new Date()) : new Date();
  
  return {
    name: application.applicant_name || '',
    date_of_birth: dobDate,
    aadhar_no: application.aadhar_no || '',
    address: application.address || '',
    phone_number: application.phone_number || '',
    email: application.email || '',
    district_id: application.district.id.toString() || '',
    circle_id: application.circle_id.toString() || '',
    sub_division_id: application.sub_division.id.toString() || '',
    village_id: application.village_id.toString() || '',
    patta_no: application.patta_no || '',
    dag_no: application.dag_no || '',
    location_type_id: application.location_type_id.toString() || '',
    original_area_of_plot: application ? parseFloat(application.original_area_of_plot) : ('' as any),
    area_unit_id: application.land_area_unit_id.toString() || '',
    area_applied_for_conversion: application ? parseFloat(application.area_applied_for_conversion) : ('' as any),
    application_area_unit_id: application.application_area_unit_id.toString() || '',
    land_classification_id: application.land_classification_id.toString() || '',
    land_purpose_id: application.land_purpose_id.toString() || '',
    change_of_land_use_id: application.change_of_land_use_id.toString() || '',
    purpose_id: application.purpose_id.toString() || '',
    other_entry: '',
    relatives: [], // Existing app data doesn't contain this yet
    others_relevant_document: [],
  };
};

const steps = [
  { id: 'Step 1', name: 'Land Details', fields: ['district_id', 'sub_division_id', 'circle_id', 'village_id', 'land_purpose_id', 'change_of_land_use_id'] },
  { id: 'Step 2', name: 'Document Requirements', fields: [] },
  { id: 'Step 3', name: 'Applicant & Plot Info', fields: ['name', 'date_of_birth', 'aadhar_no', 'address', 'phone_number', 'email', 'patta_no', 'dag_no', 'location_type_id', 'original_area_of_plot', 'area_unit_id', 'area_applied_for_conversion', 'application_area_unit_id', 'land_classification_id', 'purpose_id', 'other_entry', 'exact_build_up_area', 'exact_build_up_area_unit_id', 'previously_occupied_area', 'previously_occupied_area_unit_id'] },
  { id: 'Step 4', name: 'Document Upload', fields: [] },
  { id: 'Step 5', name: 'Preview & Submit', fields: [] },
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
  purposes,
  relationships,
  accessToken,
}: MultiStepFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addLog } = useDebug();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentType, setDocumentType] = useState<'land_diversion' | 'land_conversion'>('land_conversion');

  const validationSchema = formSchema.superRefine((data, ctx) => {
    const otherPurpose = purposes.find(p => p.name === 'Other');
    if (otherPurpose && data.purpose_id === otherPurpose.id.toString()) {
      if (!data.other_entry || data.other_entry.trim() === '') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['other_entry'],
            message: 'Please specify the other purpose.',
        });
      }
    }

    const selectedOption = changeOfLandUseDates.find(d => d.id.toString() === data.change_of_land_use_id);
    const isDiversion = selectedOption?.name.includes('Before');

    if (isDiversion) {
      // if (!data.exact_build_up_area) {
      //   ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exact_build_up_area'], message: 'Build up area is required.' });
      // }
      // if (!data.exact_build_up_area_unit_id) {
      //   ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exact_build_up_area_unit_id'], message: 'Unit is required.' });
      // }
      // if (!data.previously_occupied_area) {
      //   ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previously_occupied_area'], message: 'Occupied area is required.' });
      // }
      //  if (!data.previously_occupied_area_unit_id) {
      //   ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['previously_occupied_area_unit_id'], message: 'Unit is required.' });
      // }
    }
  });
  
  const methods = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: getInitialValues(existingApplication),
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
      'purpose_id', 'exact_build_up_area_unit_id', 'previously_occupied_area_unit_id'
    ];
    integerFields.forEach(field => {
        if (payload[field]) payload[field] = parseInt(payload[field]);
    });

    // The API expects single-file uploads to be a string, not an array.
    // We will take the first element of the array for these fields.
    const singleFileFields = ['applicant_aadhar', 'passport_photo', 'tax_receipt', 'deed_certificate', 'affidavit_certificate', 'noc_certificate'];
    singleFileFields.forEach(field => {
        if (Array.isArray(payload[field]) && payload[field].length > 0) {
            payload[field] = payload[field][0];
        } else {
            delete payload[field]; // Remove if no file was uploaded
        }
    });

    // For multiple file fields, ensure they are arrays of strings.
    const multiFileFields = ['patta'];
    multiFileFields.forEach(field => {
        if (!Array.isArray(payload[field]) || payload[field].length === 0) {
            delete payload[field]; // Remove if no files were uploaded
        }
    });

    // Handle 'others_relevant_document' - API expects an array of objects.
    if (Array.isArray(payload.others_relevant_document) && payload.others_relevant_document.length > 0) {
      // The field already has the correct structure from the form state, so we just ensure it's not empty.
    } else {
        delete payload.others_relevant_document;
    }

    if(!payload.relatives || payload.relatives.length === 0) {
        delete payload.relatives;
    } else {
        // Ensure the relationship_id is removed and relationship (string) is kept.
        payload.relatives = payload.relatives.map((relative: any) => {
            const { relationship_id, ...rest } = relative;
            return { ...rest };
        });
    }

    const otherPurpose = purposes.find(p => p.name === 'Other');
    if (!otherPurpose || payload.purpose_id !== otherPurpose.id) {
      delete payload.other_entry;
    }

     if(documentType !== 'land_diversion') {
        delete payload.exact_build_up_area;
        delete payload.exact_build_up_area_unit_id;
        delete payload.previously_occupied_area;
        delete payload.previously_occupied_area_unit_id;
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
        // Form was for a new application, so reset it
        methods.reset(getInitialValues(null));
        setCurrentStep(0);
      } else if (existingApplication) {
        // Form was for an update. You might want to redirect or refresh data here.
        // For now, we'll just leave the user on the form.
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
                    purposes={purposes}
                    documentType={documentType}
                />
              )}
              {currentStep === 3 && (
                <Step4DocumentUpload documentType={documentType} accessToken={accessToken} relationships={relationships} />
              )}
              {currentStep === 4 && (
                 <Step5Preview
                    formValues={watch()}
                    documentType={documentType}
                    data={{
                      districts,
                      circles,
                      subDivisions,
                      villages,
                      landPurposes,
                      locationTypes,
                      areaUnits,
                      landClassifications,
                      changeOfLandUseDates,
                      purposes,
                      relationships,
                    }}
                  />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-8 pt-5">
            <div className="flex justify-end">
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
