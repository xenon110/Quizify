
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractQuizDataFromPdf } from "@/ai/flows/extract-quiz-data-from-pdf";
import { useRouter } from "next/navigation";
import { useExams } from "@/hooks/use-exams";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/app-header";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const router = useRouter();
    const { addExam } = useExams();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isUploading && progress < 90) {
            timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(timer);
                        return 90;
                    }
                    return prev + 1;
                });
            }, 100); 
        }
        return () => {
            clearInterval(timer);
        };
    }, [isUploading, progress]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
            } else {
                toast({
                    variant: "destructive",
                    title: "Invalid File Type",
                    description: "Please upload a PDF file.",
                });
            }
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast({
                variant: "destructive",
                title: "No File Selected",
                description: "Please select a PDF file to upload.",
            });
            return;
        }

        setIsUploading(true);
        setProgress(0);
        toast({
            title: "Generating Quiz...",
            description: "Please wait while we process your PDF. This may take a moment.",
        });
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const pdfDataUri = reader.result as string;
                
                const result = await extractQuizDataFromPdf({ pdfDataUri });

                setProgress(100);
                
                if (!result.questions || result.questions.length === 0) {
                    toast({
                        variant: "destructive",
                        title: "Quiz Generation Failed",
                        description: "The AI could not find any questions in the PDF. Please try a different file with a clearer format.",
                    });
                     setIsUploading(false);
                     setProgress(0);
                     setFile(null);
                    return;
                }

                const newExam = {
                  id: `exam-${Date.now()}`,
                  title: file.name.replace('.pdf', ''),
                  questions: result.questions,
                  status: 'Not Started' as const
                };

                addExam(newExam);

                toast({
                    title: "Quiz Generated Successfully!",
                    description: `Your quiz "${newExam.title}" is now available.`,
                });
                
                setTimeout(() => {
                    router.push('/exams');
                }, 1000);

            } catch (error: any) {
                console.error("Error generating quiz:", error);
                if (error.message === 'MISSING_API_KEY') {
                    toast({
                        variant: "destructive",
                        title: "Configuration Error: API Key Missing",
                        description: "Your Google AI API key is not set. Please add GEMINI_API_KEY to your .env file.",
                        duration: 15000,
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Quiz Generation Failed",
                        description: "The AI was unable to process the PDF. It might be corrupted or in an unsupported format. Please try another file.",
                    });
                }
                setIsUploading(false);
                setProgress(0);
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the file. Please try again.",
            });
            setIsUploading(false);
            setProgress(0);
        };
    };
    
    const removeFile = () => {
        setFile(null);
    }
    
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 flex items-center justify-center p-6 md:p-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Upload Exam PDF</CardTitle>
                    <CardDescription>Upload a PDF file to automatically generate a quiz.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                        <UploadCloud className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Drag & drop a file here</h3>
                        <p className="text-sm text-muted-foreground mb-4">or</p>
                        <Button asChild variant="outline" disabled={isUploading}>
                           <label htmlFor="file-upload" className={!isUploading ? "cursor-pointer" : "cursor-not-allowed"}>
                                Browse Files
                                <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" disabled={isUploading}/>
                           </label>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-4">Only PDF files are supported.</p>
                    </div>

                    {file && !isUploading && (
                        <Card className="bg-muted/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <File className="h-6 w-6 text-primary"/>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={removeFile} disabled={isUploading}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {isUploading && file && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-center">Generating quiz from {file.name}...</p>
                            <Progress value={progress} />
                            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% complete</p>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={handleUpload} disabled={!file || isUploading} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isUploading ? 'Generating...' : 'Generate Quiz'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
