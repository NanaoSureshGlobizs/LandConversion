
'use client';

import { useFormContext } from 'react-hook-form';
import type { FormValues } from '../multi-step-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';

interface DetailItemProps {
  label: string;
  value: string | number | undefined | null;
  className?: string;
}

function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-right">{value || '-'}</p>
    </div>
  );
}

function findNameById(items: { id: number; name: string }[] | undefined, id: string) {
  if (!items || !id) return 'N/A';
  return items.find(item => item.id.toString() === id)?.name || 'N/A';
}

function findLandPurposeNameById(items: { id: number; purpose_name: string }[] | undefined, id: string) {
  if (!items || !id) return 'N/A';
  return items.find(item => item.id.toString() === id)?.purpose_name || 'N/A';
}


interface Step5PreviewProps {
  formValues: FormValues;
  documentType: 'land_diversion' | 'land_conversion';
  data: {
    districts: { id: number; name: string }[];
    circles: { id: number; name: string }[];
    subDivisions: { id: number; name: string }[];
    villages: { id: number; name: string }[];
    landPurposes: { id: number; purpose_name: string }[];
    locationTypes: { id: number; name: string }[];
    areaUnits: { id: number; name: string }[];
    landClassifications: { id: number; name: string }[];
    changeOfLandUseDates: { id: number; name: string }[];
    purposes: { id: number; name: string }[];
    relationships: { id: number; name: string }[];
  };
}

export function Step5Preview({ formValues, documentType, data }: Step5PreviewProps) {
  const { getValues } = useFormContext<FormValues>();
  const values = getValues();

  const getUploadedFileNames = (field: keyof FormValues) => {
    const uploaded = values[field] as any;
    if (!uploaded || uploaded.length === 0) return ['None'];
    if (typeof uploaded[0] === 'object' && uploaded[0].file_name) {
       return uploaded.map((f: any) => f.file_name);
    }
    // Assuming it's an array of server filenames (strings)
    return uploaded;
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline">Review Your Application</CardTitle>
        <CardDescription>
          Please review all the details below carefully before submitting. You can go back to previous steps to make changes.
        </CardDescription>
      </CardHeader>
      
      <Card>
        <CardHeader>
          <CardTitle>Applicant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailItem label="Name of Patta Holder" value={values.name} />
          <Separator />
          <DetailItem label="Date of Birth" value={format(values.date_of_birth, 'PPP')} />
          <Separator />
          <DetailItem label="Aadhaar Number" value={values.aadhar_no} />
          <Separator />
          <DetailItem label="Address" value={values.address} />
          <Separator />
          <DetailItem label="Phone Number" value={values.phone_number} />
          <Separator />
          <DetailItem label="Email" value={values.email} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Land Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailItem label="District" value={findNameById(data.districts, values.district_id)} />
          <Separator />
          <DetailItem label="Circle" value={findNameById(data.circles, values.circle_id)} />
          <Separator />
          <DetailItem label="Sub Division" value={findNameById(data.subDivisions, values.sub_division_id)} />
          <Separator />
          <DetailItem label="Village" value={findNameById(data.villages, values.village_id)} />
          <Separator />
          <DetailItem label="Purpose for which land is presently used" value={findLandPurposeNameById(data.landPurposes, values.land_purpose_id)} />
          <Separator />
          <DetailItem label="Date of change of land use" value={findNameById(data.changeOfLandUseDates, values.change_of_land_use_id)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Plot Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailItem label="Patta No." value={values.patta_no} />
          <Separator />
          <DetailItem label="Dag No." value={values.dag_no} />
          <Separator />
          <DetailItem label="Location Type" value={findNameById(data.locationTypes, values.location_type_id)} />
          <Separator />
          <DetailItem label="Original area of plot" value={`${values.original_area_of_plot} ${findNameById(data.areaUnits, values.area_unit_id)}`} />
          <Separator />
          <DetailItem label="Area applied for conversion" value={`${values.area_applied_for_conversion} ${findNameById(data.areaUnits, values.application_area_unit_id)}`} />
          <Separator />
          <DetailItem label="Present Land Classification" value={findNameById(data.landClassifications, values.land_classification_id)} />
          <Separator />
          <DetailItem label="Purpose for which conversion is requested" value={findNameById(data.purposes, values.purpose_id)} />
          {(findNameById(data.purposes, values.purpose_id) === 'Other') && (
            <>
                <Separator />
                <DetailItem label="Other Purpose" value={values.other_entry} />
            </>
          )}
          {documentType === 'land_diversion' && (
            <>
                <Separator />
                <DetailItem label="Exact build up area" value={`${values.exact_build_up_area} ${findNameById(data.areaUnits, values.exact_build_up_area_unit_id!)}`} />
                <Separator />
                <DetailItem label="Previously Occupied area" value={`${values.previously_occupied_area} ${findNameById(data.areaUnits, values.previously_occupied_area_unit_id!)}`} />
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
             <div>
                <h4 className="font-medium">Latest Patta Copy</h4>
                {getUploadedFileNames('patta').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
             <div>
                <h4 className="font-medium">Aadhaar</h4>
                {getUploadedFileNames('applicant_aadhar').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
             <div>
                <h4 className="font-medium">Passport Photo</h4>
                {getUploadedFileNames('passport_photo').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
            {values.change_of_land_use_id && findNameById(data.changeOfLandUseDates, values.change_of_land_use_id)?.includes('Before') && (
                 <div>
                    <h4 className="font-medium">MARSAC Imagery Report</h4>
                    {getUploadedFileNames('marsac_report').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
                </div>
            )}
            <div>
                <h4 className="font-medium">Tax Receipt</h4>
                {getUploadedFileNames('tax_receipt').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
             <div>
                <h4 className="font-medium">Sale Deed/Title Deed/Partial Deed</h4>
                {getUploadedFileNames('deed_certificate').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
            <div>
                <h4 className="font-medium">Affidavit/Encumbrance Certificate</h4>
                {getUploadedFileNames('affidavit_certificate').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
            <div>
                <h4 className="font-medium">NOC</h4>
                {getUploadedFileNames('noc_certificate').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
             <div>
                <h4 className="font-medium">Other Relevant Documents</h4>
                {getUploadedFileNames('others_relevant_document').map((name, i) => <p key={i} className="text-sm text-muted-foreground ml-4">- {name}</p>)}
            </div>
        </CardContent>
      </Card>

      {values.relatives && values.relatives.length > 0 && (
         <Card>
            <CardHeader>
                <CardTitle>Family/Co-owner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {values.relatives.map((relative, index) => (
                    <div key={index} className="p-4 border rounded-md">
                        <h4 className="font-semibold mb-2">Member {index + 1}</h4>
                        <DetailItem label="Name" value={relative.relative_name} />
                        <Separator className="my-2" />
                        <DetailItem label="Date of Birth" value={format(new Date(relative.relative_date_of_birth), 'PPP')} />
                        <Separator className="my-2" />
                        <DetailItem label="Relation" value={relative.relationship} />
                         <Separator className="my-2" />
                        <div className="grid grid-cols-2 gap-2">
                           <p className="text-sm text-muted-foreground">Aadhaar Document</p>
                           <p className="font-medium text-right text-green-600">Uploaded</p>
                        </div>
                    </div>
                ))}
            </CardContent>
         </Card>
      )}

    </div>
  );
}
