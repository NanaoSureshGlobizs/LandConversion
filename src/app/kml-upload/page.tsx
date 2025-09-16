
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/context/DebugContext';
import { uploadFile } from '@/app/actions';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, FileUp } from 'lucide-react';
import Link from 'next/link';

export default function KmlUploadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { addLog } = useDebug();
    const { accessToken } = useAuth(); // Assume we need auth to upload

    const [kmlFile, setKmlFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.name.toLowerCase().endsWith('.kml')) {
                setKmlFile(file);
            } else {
                toast({
                    title: 'Invalid File Type',
                    description: 'Please select a .kml file.',
                    variant: 'destructive',
                });
                event.target.value = ''; // Clear the input
            }
        }
    };

    const handleUpload = async () => {
        if (!kmlFile) {
            toast({ title: 'No File Selected', description: 'Please choose a KML file to upload.', variant: 'destructive' });
            return;
        }

        if (!accessToken) {
            toast({ title: 'Authentication Error', description: 'You must be logged in to upload files.', variant: 'destructive' });
            return;
        }
        
        setIsLoading(true);

        const formData = new FormData();
        formData.append('kml_file', kmlFile);

        const result = await uploadFile(formData, accessToken);
        if (result.debugLog) addLog(result.debugLog);

        if (result.success && result.data?.file_url) {
            toast({ title: 'Upload Successful', description: 'Redirecting to KML viewer...' });
            
            // The API response from uploadFile should contain the full URL
            const fileUrl = result.data.file_url;
            router.push(`/kml-viewer?url=${encodeURIComponent(fileUrl)}`);
        } else {
            toast({
                title: 'Upload Failed',
                description: result.message || 'Could not upload the KML file.',
                variant: 'destructive'
            });
            setIsLoading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-50 p-4">
            <div className="absolute -top-1/4 left-0 -z-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-1/4 right-0 -z-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                        <FileUp className="h-6 w-6 text-primary" />
                        Upload KML File
                    </CardTitle>
                    <CardDescription>
                        Select a .kml file from your device to view it on the map.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="kml-upload">KML File</Label>
                        <div 
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            onClick={() => document.getElementById('kml-upload')?.click()}
                        >
                            {kmlFile ? (
                                <div className="text-center">
                                    <FileUp className="mx-auto h-12 w-12 text-gray-500" />
                                    <p className="font-semibold">{kmlFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{(kmlFile.size / 1024).toFixed(2)} KB</p>
                                    <p className="text-xs text-muted-foreground mt-2">Click here to select a different file</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <UploadCloud className="h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">KML files only</p>
                                </div>
                            )}
                        </div>
                        <Input
                            id="kml-upload"
                            type="file"
                            className="hidden"
                            accept=".kml"
                            onChange={handleFileChange}
                        />
                    </div>
                    <Button onClick={handleUpload} disabled={isLoading || !kmlFile} className="w-full">
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileUp className="mr-2 h-4 w-4" />
                        )}
                        Upload and View
                    </Button>
                     <Button variant="link" asChild className="w-full">
                        <Link href="/">Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
