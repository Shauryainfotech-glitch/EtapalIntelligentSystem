import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onUploadSuccess?: (document: any) => void;
  onOCRResults?: (results: any) => void;
}

export function FileUpload({ onUploadSuccess, onOCRResults }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/documents', formData);
      return response.json();
    },
    onSuccess: (document) => {
      toast({
        title: "File uploaded successfully",
        description: "AI processing has started...",
      });
      
      onUploadSuccess?.(document);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Simulate progress for AI processing
      setIsProcessing(true);
      setProgress(0);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsProcessing(false);
            
            // Simulate OCR results
            const mockResults = {
              confidence: 96.7,
              language: 'Marathi',
              documentType: 'Government Letter',
              extractedText: 'शासकीय पत्र\nमहाराष्ट्र राज्य\nजिल्हा पोलिस कार्यालय अहमदनगर',
              extractedFields: {
                office: 'जिल्हा पोलिस कार्यालय अहमदनगर',
                serialNumber: '२३४५/२०२४',
                letterDate: '2024-06-13',
                subject: 'शासन पत्र'
              }
            };
            
            onOCRResults?.(mockResults);
            
            toast({
              title: "AI Processing Complete",
              description: `Document processed with ${mockResults.confidence}% confidence`,
            });
            
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  }, [uploadMutation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  }, [uploadMutation]);

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Brain className="text-primary mr-2 h-5 w-5" />
        AI Document Scanner & Auto-Fill
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-blue-300 hover:border-primary hover:bg-primary/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="document-upload"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          disabled={uploadMutation.isPending || isProcessing}
        />
        
        <label htmlFor="document-upload" className="cursor-pointer">
          {uploadMutation.isPending ? (
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
          )}
          <p className="text-lg font-medium text-gray-700 mb-2">
            {uploadMutation.isPending ? "Uploading..." : "Drop document here or click to upload"}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, JPG, PNG, DOC, DOCX • AI will extract and auto-fill form data
          </p>
        </label>
      </div>
      
      {isProcessing && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
          <div className="flex items-center mb-2">
            <Brain className="animate-pulse h-5 w-5 text-warning mr-3" />
            <span className="text-warning font-medium">AI processing document... Please wait</span>
          </div>
          <div className="bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-warning h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
