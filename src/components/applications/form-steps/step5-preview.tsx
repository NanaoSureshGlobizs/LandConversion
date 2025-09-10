
'use client';

import { useFormContext } from 'react-hook-form';
import type { FormValues } from '../multi-step-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


interface DetailItemProps {
  label: string;
  value: string | number | undefined | null;
  className?: string;
}

function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 ${className}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-sm sm:text-right break-words">{value || '-'}</p>
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
    locationTypes: { id: number; name:string }[];
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
    if (!uploaded || uploaded.length === 0) return [];
    if (typeof uploaded[0] === 'object' && uploaded[0].file_name) {
       return uploaded.map((f: any) => f.file_name);
    }
    // Assuming it's an array of server filenames (strings)
    return uploaded;
  };
  
  const allDocumentFields: {label: string, field: keyof FormValues}[] = [
    { label: 'Latest Patta Copy', field: 'patta' },
    { label: 'Aadhaar', field: 'applicant_aadhar' },
    { label: 'Passport Photo', field: 'passport_photo' },
    { label: 'MARSAC Imagery Report', field: 'marsac_report' },
    { label: 'Tax Receipt', field: 'tax_receipt' },
    { label: 'Sale/Title Deed', field: 'deed_certificate' },
    { label: 'Affidavit/Encumbrance Certificate', field: 'affidavit_certificate' },
    { label: 'NOC', field: 'noc_certificate' },
    { label: 'Other Relevant Documents', field: 'others_relevant_document' },
  ];

  const relevantDocuments = allDocumentFields.filter(doc => {
     if (documentType === 'land_conversion' && doc.field === 'marsac_report') return false;
     const files = getUploadedFileNames(doc.field);
     return files.length > 0;
  });

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="font-headline">Review Your Application</CardTitle>
        <CardDescription>
          Please review all the details below carefully before submitting. You can go back to previous steps to make changes.
        </CardDescription>
      </CardHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Applicant Details</CardTitle></CardHeader>
                <CardContent className="divide-y">
                    <DetailItem label="Name of Patta Holder" value={values.name} />
                    <DetailItem label="Date of Birth" value={format(values.date_of_birth, 'PPP')} />
                    <DetailItem label="Aadhaar Number" value={values.aadhar_no} />
                    <DetailItem label="Address" value={values.address} />
                    <DetailItem label="Phone Number" value={values.phone_number} />
                    <DetailItem label="Email" value={values.email} />
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Land Details</CardTitle></CardHeader>
                <CardContent className="divide-y">
                    <DetailItem label="District" value={findNameById(data.districts, values.district_id)} />
                    <DetailItem label="Circle" value={findNameById(data.circles, values.circle_id)} />
                    <DetailItem label="Sub Division" value={findNameById(data.subDivisions, values.sub_division_id)} />
                    <DetailItem label="Village" value={findNameById(data.villages, values.village_id)} />
                    <DetailItem label="Purpose for which land is presently used" value={findLandPurposeNameById(data.landPurposes, values.land_purpose_id)} />
                    <DetailItem label="Date of change of land use" value={findNameById(data.changeOfLandUseDates, values.change_of_land_use_id)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Detailed Plot Information</CardTitle></CardHeader>
                <CardContent className="divide-y">
                    <DetailItem label="Patta No." value={values.patta_no} />
                    <DetailItem label="Dag No." value={values.dag_no} />
                    <DetailItem label="Location Type" value={findNameById(data.locationTypes, values.location_type_id)} />
                    <DetailItem label="Original area of plot" value={`${values.original_area_of_plot} ${findNameById(data.areaUnits, values.area_unit_id)}`} />
                    <DetailItem label="Area applied for conversion" value={`${values.area_applied_for_conversion} ${findNameById(data.areaUnits, values.application_area_unit_id)}`} />
                    <DetailItem label="Present Land Classification" value={findNameById(data.landClassifications, values.land_classification_id)} />
                    <DetailItem label="Purpose for which conversion is requested" value={findNameById(data.purposes, values.purpose_id)} />
                    {(findNameById(data.purposes, values.purpose_id) === 'Other') && (
                        <DetailItem label="Other Purpose" value={values.other_entry} />
                    )}
                    {documentType === 'land_diversion' && (
                        <>
                            <DetailItem label="Exact build up area" value={`${values.exact_build_up_area} ${findNameById(data.areaUnits, values.exact_build_up_area_unit_id!)}`} />
                            <DetailItem label="Previously Occupied area" value={`${values.previously_occupied_area} ${findNameById(data.areaUnits, values.previously_occupied_area_unit_id!)}`} />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {relevantDocuments.length > 0 ? relevantDocuments.map(doc => (
                        <div key={doc.field}>
                            <h4 className="font-medium text-sm">{doc.label}</h4>
                            <div className="pl-2 mt-1 space-y-1">
                               {getUploadedFileNames(doc.field).map((name, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate">{name}</span>
                                </div>
                               ))}
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No documents have been uploaded.</p>
                    )}
                </CardContent>
            </Card>
             {values.relatives && values.relatives.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Family/Co-owners</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {values.relatives.map((relative, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 border rounded-md bg-muted/50">
                                <User className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{relative.relative_name}</p>
                                    <p className="text-xs text-muted-foreground">{relative.relationship} &bull; DOB: {format(new Date(relative.relative_date_of_birth), 'dd MMM yyyy')}</p>
                                    <Badge variant="secondary" className="mt-2">Aadhaar Uploaded</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
            )}
        </div>
      </div>
    </div>
  );
}
