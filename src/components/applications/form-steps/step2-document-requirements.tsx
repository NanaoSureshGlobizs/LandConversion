
'use client';

import { CheckCircle2 } from 'lucide-react';
import { CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DocumentListProps {
  items: string[];
}

function DocumentList({ items }: DocumentListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

const landDiversionDocs = [
  'Aadhaar',
  'Latest Patta Copy (Not more than 10 days from filing)',
  'Passport Photo',
  'Tax Receipt',
  'Sale Deed/Title Deed/Partial Deed',
  'Affidavit/Encumbrance Certificate',
  'NOC (Co-owner, Municipal Council or GP)',
];

const landConversionDocs = [
  'Aadhaar',
  'Latest Patta Copy (Not more than 10 days from filing)',
  'Passport Photo',
  'Tax Receipt',
  'Sale Deed/Title Deed/Partial Deed',
  'Affidavit/Encumbrance Certificate',
  'NOC (Co-owner, Municipal Council or GP)',
];

const hillAreaDocs = [
  'Aadhaar',
  'Land Ownership certificate',
  'Passport Photo',
  'Hill House Tax Receipt',
  'Sale Deed/Title Deed/Partial Deed',
  'Affidavit/Encumbrance Certificate',
  'NOC From ADC',
];

interface Step2Props {
  documentType: 'land_diversion' | 'land_conversion' | null;
  formType: 'normal' | 'hill';
}

export function Step2DocumentRequirements({ documentType, formType }: Step2Props) {
  if (formType === 'normal' && !documentType) {
    return (
        <Alert>
          <AlertTitle>Select a Date</AlertTitle>
          <AlertDescription>
            Please go back to the previous step and select a 'Date of change of land use' to see the required documents.
          </AlertDescription>
        </Alert>
    );
  }

  const isDiversion = documentType === 'land_diversion';
  
  let docsToShow: string[];
  let title: string;

  if (formType === 'hill') {
      docsToShow = hillAreaDocs;
      title = 'Required Documents for Hill Area Application';
  } else {
      docsToShow = isDiversion ? landDiversionDocs : landConversionDocs;
      title = `Required Documents for ${isDiversion ? 'Land Diversion' : 'Land Conversion'}`;
  }


  return (
    <div className="space-y-8">
      <CardHeader className="p-0">
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>
          Based on your selection, you will need to upload the following documents in a later step.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <DocumentList items={docsToShow} />
      </CardContent>
    </div>
  );
}
