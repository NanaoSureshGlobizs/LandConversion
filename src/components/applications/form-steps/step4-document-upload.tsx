
'use client';

import { useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImagePicker } from "./image-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

const initialFamilyMembers = [
  { name: 'Rohan Sharma', dob: new Date('1985-05-15'), relation: 'Father' },
  { name: 'Priya Sharma', dob: new Date('1990-08-22'), relation: 'Mother' },
]

interface Step4Props {
  documentType: 'land_diversion' | 'land_conversion' | null;
}

interface FamilyMember {
    name: string;
    dob: Date;
    relation: string;
}

export function Step4DocumentUpload({ documentType }: Step4Props) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for the new family member form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState<Date | undefined>();
  const [newRelation, setNewRelation] = useState('');

  const documents = documentType === 'land_diversion' ? landDiversionDocs : landConversionDocs;

  const handleAddMember = () => {
    if (newName && newDob && newRelation) {
      setFamilyMembers([...familyMembers, { name: newName, dob: newDob, relation: newRelation }]);
      // Reset form and close dialog
      setNewName('');
      setNewDob(undefined);
      setNewRelation('');
      setIsDialogOpen(false);
    } else {
        // Basic validation feedback
        alert('Please fill out all fields.');
    }
  };

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
                        {familyMembers.map((member, index) => (
                            <TableRow key={index}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{format(member.dob, 'PPP')}</TableCell>
                                <TableCell>{member.relation}</TableCell>
                                <TableCell>
                                    <Button variant="link" className="p-0 h-auto">Upload</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="mt-4 bg-gray-800 hover:bg-gray-700 text-white">Add Family Member</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Family Member</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new family member. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">
                        Date of Birth
                    </Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={'outline'}
                            className={cn(
                                'col-span-3 justify-start text-left font-normal',
                                !newDob && 'text-muted-foreground'
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newDob ? format(newDob, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={newDob}
                            onSelect={setNewDob}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="relation" className="text-right">
                      Relation
                    </Label>
                    <Input id="relation" value={newRelation} onChange={(e) => setNewRelation(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardContent>
      </div>
    </div>
  );
}
