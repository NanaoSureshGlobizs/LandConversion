'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface ImagePickerProps {
  isMultiple?: boolean;
  title: string;
  description: string;
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

export const ImagePicker = ({ isMultiple = false, title, description }: ImagePickerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newlySelectedFiles: File[] = Array.from(files);
    const validFiles: File[] = [];

    // Filter for valid image types
    for (const file of newlySelectedFiles) {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        toast({
          title: 'Invalid File Type',
          description: `File "${file.name}" was ignored. Please upload only images.`,
          variant: 'destructive',
        });
      }
    }

    if (validFiles.length === 0) return;

    const newFilePreviews = validFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (isMultiple) {
      setSelectedFiles(prevFiles => [...prevFiles, ...newFilePreviews]);
    } else {
      // If not multiple, revoke previous URL to prevent memory leaks
      selectedFiles.forEach(fp => URL.revokeObjectURL(fp.previewUrl));
      setSelectedFiles(newFilePreviews);
    }
  };

  const handleRemoveImage = (index: number) => {
    const fileToRemove = selectedFiles[index];
    URL.revokeObjectURL(fileToRemove.previewUrl); // Clean up object URL
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(fp => URL.revokeObjectURL(fp.previewUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
            <p className="text-xs text-muted-foreground mt-1">Accepted formats: .jpg, .png, .gif, .webp</p>
        </div>
        {(isMultiple && selectedFiles.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerFileInput}
            >
              Add More
            </Button>
        )}
      </div>

      <div className="mt-4">
        {selectedFiles.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={handleTriggerFileInput}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {selectedFiles.map((filePreview, index) => (
              <div key={index} className="relative aspect-square group">
                <Image
                  src={filePreview.previewUrl}
                  alt={`Preview ${filePreview.file.name}`}
                  layout="fill"
                  className="object-cover rounded-md border"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                   <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            ))}
            {isMultiple && (
                 <div
                    className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={handleTriggerFileInput}
                >
                    <div className="flex flex-col items-center justify-center">
                        <UploadCloud className="w-8 h-8 text-gray-500" />
                         <p className="mt-2 text-sm text-center text-gray-500">Add more</p>
                    </div>
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
        accept="image/png, image/jpeg, image/gif, image/webp"
        multiple={isMultiple}
      />
       {selectedFiles.length > 0 && (
         <div className="mt-2 text-sm text-muted-foreground">
            Total files selected: {selectedFiles.length}
        </div>
      )}
    </div>
  );
};
