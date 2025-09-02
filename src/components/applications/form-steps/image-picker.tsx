
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, UploadCloud, Loader2, FileText } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { uploadFile } from '@/app/actions';

export interface UploadedFile {
  id: string; // Used for unique key in rendering
  originalName: string;
  previewUrl: string;
  serverFileName: string; // Filename from the API response
}

interface ImagePickerProps {
  id: string; // This will be the key for react-hook-form, e.g., 'patta'
  isMultiple?: boolean;
  title: string;
  description: string;
  accessToken: string;
  onUploadComplete: (categoryId: string, file: UploadedFile) => void;
  onRemove: (categoryId: string, file: UploadedFile) => void;
}

export const ImagePicker = ({
  id,
  isMultiple = false,
  title,
  description,
  accessToken,
  onUploadComplete,
  onRemove,
}: ImagePickerProps) => {
  const [previews, setPreviews] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { addLog } = useDebug();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
         toast({
          title: 'Invalid File Type',
          description: `File "${file.name}" was ignored. Please upload only images or PDFs.`,
          variant: 'destructive',
        });
        continue;
      }
      
      const formData = new FormData();
      formData.append(id, file); // Use the component id as the key for the file

      const result = await uploadFile(formData, accessToken);

      if (result.debugLog) addLog(result.debugLog);

      if (result.success && result.data.filename) {
        const newFile: UploadedFile = {
            id: `${file.name}-${Date.now()}`,
            originalName: file.name,
            previewUrl: URL.createObjectURL(file),
            serverFileName: result.data.filename
        };
        
        if (isMultiple) {
            setPreviews(prev => [...prev, newFile]);
        } else {
            // Revoke old URL if it exists
            if(previews.length > 0) URL.revokeObjectURL(previews[0].previewUrl);
            setPreviews([newFile]);
        }
        onUploadComplete(id, newFile);

        toast({
            title: "Upload Successful",
            description: `"${file.name}" has been uploaded.`
        });
      } else {
        toast({
            title: "Upload Failed",
            description: result.message || `Could not upload "${file.name}".`,
            variant: "destructive"
        });
      }
    }
    setIsUploading(false);
    // Reset file input to allow selecting the same file again
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (fileToRemove: UploadedFile) => {
    URL.revokeObjectURL(fileToRemove.previewUrl);
    setPreviews(prev => prev.filter(p => p.id !== fileToRemove.id));
    onRemove(id, fileToRemove);
  };

  const handleTriggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPreviewContent = (file: UploadedFile) => {
    const isPdf = file.originalName.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
        return (
            <div className="w-full h-full bg-muted rounded-md flex flex-col items-center justify-center p-2 border">
                <FileText className="w-8 h-8 text-destructive" />
                <p className="text-xs font-semibold text-center break-all mt-2">{file.originalName}</p>
            </div>
        );
    }
    
    // Fallback for image files
    return (
        <Image
            src={file.previewUrl}
            alt={`Preview ${file.originalName}`}
            fill
            className="object-cover rounded-md border"
        />
    );
  };


  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">Accepted formats: .jpg, .png, .gif, .webp, .pdf</p>
        </div>
        {(isMultiple && previews.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerFileInput}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : "Add More"}
            </Button>
        )}
      </div>

      <div className="mt-4">
        {previews.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={handleTriggerFileInput}
          >
             {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previews.map((filePreview) => (
              <div key={filePreview.id} className="relative aspect-square group">
                {renderPreviewContent(filePreview)}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                   <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(filePreview)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
            {isMultiple && (
                 <div
                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={handleTriggerFileInput}
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                            <UploadCloud className="w-8 h-8 text-gray-500" />
                            <p className="mt-2 text-sm text-gray-500">Add more</p>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
        multiple={isMultiple}
        disabled={isUploading}
      />
       {previews.length > 0 && (
         <div className="mt-2 text-sm text-muted-foreground">
            Total files selected: {previews.length}
        </div>
      )}
    </div>
  );
};
