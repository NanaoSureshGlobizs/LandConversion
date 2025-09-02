
'use client';

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud } from "lucide-react";
import React, { useRef, useState } from "react";
import Image from "next/image";

interface DocumentUploadItemProps {
  title: string;
  description: string;
  isMultiple?: boolean;
}

const DocumentUploadItem = ({ title, description, isMultiple = false }: DocumentUploadItemProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-4 border-b last:border-b-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, application/pdf"
        multiple={isMultiple}
      />
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button 
          variant="default" 
          className="mt-4 bg-gray-800 hover:bg-gray-700 text-white"
          onClick={handleUploadClick}
        >
          {isMultiple ? 'Multiple Upload' : 'Upload'}
        </Button>
      </div>
      <div 
        className="w-full md:w-64 h-32 bg-gray-200 rounded-md flex items-center justify-center border-2 border-dashed border-gray-400 cursor-pointer"
        onClick={handleUploadClick}
      >
        {preview ? (
          <Image src={preview} alt="Document preview" width={256} height={128} className="object-contain h-full w-full" />
        ) : (
          <div className="text-center text-gray-500">
              <UploadCloud className="mx-auto h-10 w-10" />
              <p className="mt-2 text-sm">Click to upload</p>
          </div>
        )}
      </div>
    </div>
  );
};


const landDiversionDocs = [
  { title: 'Latest Patta Copy', description: 'Not less than 10 days from the date of filing (PDF or JPG)', isMultiple: true },
  { title: 'Aadhar', description: 'Upload a copy of your Aadhar card (PDF or JPG)' },
  { title: 'Passport Photo', description: 'Upload a recent passport sized photo (JPG)' },
  { title: 'MARSAC Imagery Report', description: 'Upload the MARSAC report (PDF)' },
  { title: 'Tax Receipt', description: 'Upload the latest tax receipt (PDF or JPG)' },
  { title: 'Sale Deed/Title Deed/Partial Deed', description: 'Upload the relevant deed document (PDF)' },
  { title: 'Affidavit/Encumbrance Certificate', description: 'Upload the necessary certificates (PDF)' },
  { title: 'NOC', description: 'From Co-owner, Municipal Council or GP (PDF)' },
];

const landConversionDocs = [
  { title: 'Latest Patta Copy', description: 'Not less than 10 days from the date of filing (PDF or JPG)', isMultiple: true },
  { title: 'Aadhar', description: 'Upload a copy of your Aadhar card (PDF or JPG)' },
  { title: 'Passport Photo', description: 'Upload a recent passport sized photo (JPG)' },
  { title: 'Tax Receipt', description: 'Upload the latest tax receipt (PDF or JPG)' },
  { title: 'Sale Deed/Title Deed/Partial Deed', 'description': 'Upload the relevant deed document (PDF)' },
  { title: 'Affidavit/Encumbrance Certificate', 'description': 'Upload the necessary certificates (PDF)' },
  { title: 'NOC', description: 'From Co-owner, Municipal Council or GP (PDF)' },
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
        <CardContent className="p-0 mt-4">
            {documents.map((doc) => (
                <DocumentUploadItem key={doc.title} {...doc} />
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
