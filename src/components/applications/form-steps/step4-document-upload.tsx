
'use client';

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImagePicker } from "./image-picker";

const landDiversionDocs = [
  { title: 'Latest Patta Copy', description: 'Not less than 10 days from the date of filing', isMultiple: true },
  { title: 'Aadhar', description: 'Upload a copy of your Aadhar card' },
  { title: 'Passport Photo', description: 'Upload a recent passport sized photo' },
  { title: 'MARSAC Imagery Report', description: 'Upload the MARSAC report' },
  { title: 'Tax Receipt', description: 'Upload the latest tax receipt' },
  { title: 'Sale Deed/Title Deed/Partial Deed', description: 'Upload the relevant deed document' },
  { title: 'Affidavit/Encumbrance Certificate', description: 'Upload the necessary certificates' },
  { title: 'NOC', description: 'From Co-owner, Municipal Council or GP' },
];

const landConversionDocs = [
  { title: 'Latest Patta Copy', description: 'Not less than 10 days from the date of filing', isMultiple: true },
  { title: 'Aadhar', description: 'Upload a copy of your Aadhar card' },
  { title: 'Passport Photo', description: 'Upload a recent passport sized photo' },
  { title: 'Tax Receipt', description: 'Upload the latest tax receipt' },
  { title: 'Sale Deed/Title Deed/Partial Deed', 'description': 'Upload the relevant deed document' },
  { title: 'Affidavit/Encumbrance Certificate', 'description': 'Upload the necessary certificates' },
  { title: 'NOC', description: 'From Co-owner, Municipal Council or GP' },
];

const familyMembers = [
  { name: 'Rohan Sharma', dob: '1985-05-15', relation: 'Father' },
  { name: 'Priya Sharma', dob: '1990-08-22', relation: 'Mother' },
]

interface Step4Props {
  documentType: 'land_diversion' | 'land_conversion' | null;
}

export function Step4DocumentUpload({ documentType }: Step4Props) {

  const documents = documentType === 'land_diversion' ? landDiversionDocs : landConversionDocs;

  return (
    <div className="space-y-8">
      <div>
        <CardHeader className="p-0">
          <CardTitle className="font-headline">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4 space-y-4">
            {documents.map((doc) => (
                <ImagePicker key={doc.title} {...doc} />
            ))}
        </CardContent>
      </div>
      <div>
        <CardHeader className="p-0 mt-8">
          <CardTitle className="font-headline">Family Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Relation</TableHead>
                            <TableHead>Aadhar</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {familyMembers.map((member) => (
                            <TableRow key={member.name}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.dob}</TableCell>
                                <TableCell>{member.relation}</TableCell>
                                <TableCell>
                                    <Button variant="link" className="p-0 h-auto">Upload</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Button variant="default" className="mt-4 bg-gray-800 hover:bg-gray-700 text-white">Add Family Member</Button>
        </CardContent>
      </div>
    </div>
  );
}
