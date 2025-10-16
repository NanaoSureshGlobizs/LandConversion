
'use client';

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImagePicker, UploadedFile } from "./image-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, FileText, X, HelpCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { FormValues, Relationship } from "../multi-step-form";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/app/actions";
import { useDebug } from "@/context/DebugContext";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const getDocumentCategories = (formType: 'normal' | 'hill') => {
    const isHill = formType === 'hill';
    return [
      { id: 'patta', title: isHill ? 'Land Ownership Certificate' : 'Latest Patta/ Jamabandi', description: isHill ? 'Upload the land ownership document' : 'Not less than 10 days from the date of filing', isMultiple: true },
      { id: 'applicant_aadhar', title: 'Aadhaar', description: 'Upload a copy of your Aadhaar card' },
      { id: 'passport_photo', title: 'Passport Photo', description: 'Upload a recent passport sized photo' },
      { id: 'tax_receipt', title: isHill ? 'Hill House Tax Receipt' : 'Tax Receipt', description: 'Upload the latest tax receipt' },
      { id: 'deed_certificate', title: 'Sale Deed/Title Deed/Partial Deed', description: 'Upload the relevant deed document' },
      { id: 'affidavit_certificate', title: 'Affidavit/Encumbrance Certificate', description: 'Upload the necessary certificates' },
      { id: 'noc_certificate', title: 'NOC', description: isHill ? 'From ADC' : 'From Co-owner, Municipal Council or GP' },
      { id: 'others_relevant_document', title: 'Other Relevant Documents', description: 'Upload any other supporting documents', isMultiple: true },
    ];
};


interface Step4Props {
  documentType: 'land_diversion' | 'land_conversion';
  accessToken: string;
  relationships: Relationship[];
  formType: 'normal' | 'hill';
}

export function Step4DocumentUpload({ documentType, accessToken, relationships, formType }: Step4Props) {
  const { getValues, setValue } = useFormContext<FormValues>();
  const { toast } = useToast();
  const { addLog } = useDebug();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for the new family member form
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState<Date | undefined>();
  const [newRelation, setNewRelation] = useState('');
  const [newAadharFile, setNewAadharFile] = useState<File | null>(null);
  const [newAadharPreview, setNewAadharPreview] = useState<string | null>(null);

  const documents = getDocumentCategories(formType);
  const familyMembers = getValues('relatives') || [];

  const resetDialog = () => {
    setNewName('');
    setNewDob(undefined);
    setNewRelation('');
    setNewAadharFile(null);
    if (newAadharPreview) {
      URL.revokeObjectURL(newAadharPreview);
    }
    setNewAadharPreview(null);
  };

  const handleAddMember = async () => {
    if (!newName || !newDob || !newRelation || !newAadharFile) {
        toast({ title: "Missing Information", description: "Please fill out all fields and upload an Aadhaar file.", variant: "destructive" });
        return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('relative_aadhar', newAadharFile);

    const result = await uploadFile(formData, accessToken);
    if(result.debugLog) addLog(result.debugLog);
    

    if (result.success && result.data.filename) {
        const selectedRelationship = relationships.find(r => r.id.toString() === newRelation);
        const newMember = {
            relative_name: newName,
            relative_date_of_birth: format(newDob, 'yyyy-MM-dd'),
            relationship: selectedRelationship?.name || '',
            relative_aadhar: result.data.filename,
            relationship_id: parseInt(newRelation)
        };
        setValue('relatives', [...familyMembers, newMember]);
        
        resetDialog();
        setIsDialogOpen(false);
        toast({ title: "Family Member Added", description: "The new family member has been added to the list." });
    } else {
        toast({ title: "Upload Failed", description: result.message || "Could not upload the Aadhaar file.", variant: "destructive" });
    }
    setIsUploading(false);
  };
  
  const handleAadharFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast({
                title: 'Invalid File Type',
                description: 'Please upload only images or PDFs for the Aadhaar.',
                variant: 'destructive',
            });
            return;
          }
          setNewAadharFile(file);
          if (newAadharPreview) {
              URL.revokeObjectURL(newAadharPreview);
          }
          setNewAadharPreview(URL.createObjectURL(file));
      }
  }

  const handleRemoveAadhar = () => {
      setNewAadharFile(null);
      if (newAadharPreview) {
          URL.revokeObjectURL(newAadharPreview);
      }
      setNewAadharPreview(null);
  }
  
  const onUploadComplete = (categoryId: string, uploadedFile: UploadedFile) => {
      if (categoryId === 'others_relevant_document') {
          const currentFiles = getValues('others_relevant_document') || [];
          const newFileEntry = {
              file_name: uploadedFile.originalName,
              file_path: uploadedFile.serverFileName
          };
          setValue('others_relevant_document', [...currentFiles, newFileEntry]);
      } else {
          const currentFiles = getValues(categoryId as keyof FormValues) as (string[] | string) || [];
          const newFiles = Array.isArray(currentFiles) 
            ? [...currentFiles, uploadedFile.serverFileName]
            : [uploadedFile.serverFileName];
          setValue(categoryId as keyof FormValues, newFiles as any);
      }
  }

  const onRemove = (categoryId: string, fileToRemove: UploadedFile) => {
    if (categoryId === 'others_relevant_document') {
        const currentFiles = getValues('others_relevant_document') || [];
        setValue('others_relevant_document', currentFiles.filter(f => f.file_path !== fileToRemove.serverFileName));
    } else {
        const currentFiles = getValues(categoryId as keyof FormValues) as string[] || [];
        setValue(categoryId as keyof FormValues, currentFiles.filter(f => f !== fileToRemove.serverFileName) as any);
    }
  }

  useEffect(() => {
    // Cleanup object URL on unmount
    return () => {
        if (newAadharPreview) {
            URL.revokeObjectURL(newAadharPreview);
        }
    };
  }, [newAadharPreview]);


  return (
    <div className="space-y-8">
      <div>
        <CardHeader className="p-0">
          <CardTitle className="font-headline">Upload Documents</CardTitle>
          <CardDescription>Upload all the necessary documents for your application.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4 space-y-4">
            {documents.map((doc) => (
                <ImagePicker 
                    key={doc.id} 
                    id={doc.id}
                    title={doc.title}
                    description={doc.description}
                    isMultiple={doc.isMultiple}
                    accessToken={accessToken}
                    onUploadComplete={onUploadComplete}
                    onRemove={onRemove}
                />
            ))}
        </CardContent>
      </div>
      <div>
        <CardHeader className="p-0 mt-8">
          <CardTitle className="font-headline">Family/Co-owner</CardTitle>
          <CardDescription>Add family members or co-owners if applicable for the application.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Date of Birth</TableHead>
                            <TableHead>Relation</TableHead>
                            <TableHead>Aadhaar Uploaded</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {familyMembers.length > 0 ? (
                        familyMembers.map((member, index) => (
                            <TableRow key={index}>
                                <TableCell>{member.relative_name}</TableCell>
                                <TableCell>{format(new Date(member.relative_date_of_birth), 'PPP')}</TableCell>
                                <TableCell>{member.relationship}</TableCell>
                                <TableCell className="text-green-600 font-semibold">Uploaded</TableCell>
                            </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No family members added.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="mt-4">Add Family/Co-owner</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Family/Co-owner</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new family member or co-owner. Click save when you're done.
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
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            selected={newDob}
                            onSelect={setNewDob}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="relation" className="text-right">
                      Relation
                    </Label>
                    <Select onValueChange={setNewRelation} value={newRelation}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Relation" />
                        </SelectTrigger>
                        <SelectContent>
                            {relationships.map((rel) => (
                                <SelectItem key={rel.id} value={rel.id.toString()}>
                                    {rel.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <div className="text-right pt-2 flex items-center gap-1">
                      <Label htmlFor="aadhar">
                        Aadhaar
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                            <p className="font-bold mb-2">Aadhaar Privacy Notice</p>
                            <p className="text-xs">
                                We collect your Aadhaar number for identity verification and KYC compliance as required for this service. Providing Aadhaar is mandatory for this application. Your information will be used only for authentication through UIDAI's system. We will not store your biometric information.
                            </p>
                            </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="col-span-3">
                      {!newAadharPreview ? (
                          <Input id="aadhar" type="file" onChange={handleAadharFileSelect} accept="image/*,application/pdf" />
                      ) : (
                          <div className="relative group w-32 h-32">
                             {newAadharFile?.type.startsWith('image/') ? (
                                <Image
                                    src={newAadharPreview}
                                    alt="Aadhaar Preview"
                                    fill
                                    className="object-cover rounded-md border"
                                />
                             ) : (
                                <div className="w-full h-full bg-muted rounded-md flex flex-col items-center justify-center p-2 border">
                                    <FileText className="w-8 h-8 text-destructive" />
                                    <p className="text-xs font-semibold text-center break-all mt-2">{newAadharFile?.name}</p>
                                </div>
                             )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={handleRemoveAadhar}
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove</span>
                                </Button>
                               </div>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                   <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="button" onClick={handleAddMember} disabled={isUploading}>
                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Member
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardContent>
      </div>
    </div>
  );
}
