import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LETTER_TYPES, LETTER_SUBJECTS, OFFICES } from "@/lib/constants";
import { Brain, Save, FileText, Building, User, Hash, Calendar, Phone, MessageSquare } from "lucide-react";

const formSchema = z.object({
  office: z.string().min(1, "Office is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  letterDate: z.string().min(1, "Letter date is required"),
  receivedDate: z.string().min(1, "Received date is required"),
  author: z.string().min(1, "Author is required"),
  letterType: z.string().min(1, "Letter type is required"),
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  mobile: z.string().optional(),
  documentCount: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewLetter() {
  const [ocrResults, setOcrResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      office: "",
      recipientName: "",
      serialNumber: "",
      letterDate: "",
      receivedDate: "",
      author: "",
      letterType: "",
      subject: "",
      topic: "",
      mobile: "",
      documentCount: "",
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/documents', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Letter registered successfully",
        description: "The new letter has been added to the system.",
      });
      form.reset();
      setOcrResults(null);
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOCRResults = (results: any) => {
    setOcrResults(results);
    
    // Auto-fill form fields with extracted data
    if (results.extractedFields) {
      const fields = results.extractedFields;
      Object.keys(fields).forEach(key => {
        if (form.getValues(key as keyof FormData) === "" && fields[key]) {
          form.setValue(key as keyof FormData, fields[key]);
        }
      });
    }
  };

  const onSubmit = (data: FormData) => {
    createDocumentMutation.mutate(data);
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-devanagari">नवीन पत्र नोंद</CardTitle>
            <p className="text-gray-600 mt-1">New Letter Registration with AI Auto-Fill</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" type="button">
              <Brain className="h-4 w-4 mr-2" />
              AI Auto-Fill
            </Button>
            <Button variant="outline" type="button">
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* AI Upload Section */}
        <FileUpload onOCRResults={handleOCRResults} />

        {/* OCR Results Display */}
        {ocrResults && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Extraction Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">Confidence Score:</span>
                  <span className="ml-2 text-green-900">{ocrResults.confidence}%</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Document Type:</span>
                  <span className="ml-2 text-green-900">{ocrResults.documentType}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Language:</span>
                  <span className="ml-2 text-green-900">{ocrResults.language}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Processing Time:</span>
                  <span className="ml-2 text-green-900">2.3 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="office"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <Building className="h-4 w-4 mr-2 text-primary" />
                      पत्र प्राप्तझाले कार्यालय *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-devanagari">
                          <SelectValue placeholder="कार्यालय निवडा..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OFFICES.map((office, index) => (
                          <SelectItem key={index} value={office} className="font-devanagari">
                            {office}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      पत्र प्राप्तविणाऱ्याचे नाव व पदनाम *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="नाव व पदनाम प्रविष्ट करा" 
                        className="font-devanagari"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <Hash className="h-4 w-4 mr-2 text-primary" />
                      प्राप्त पत्राचा प्राप्तक क्रमांक *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="क्रमांक प्रविष्ट करा" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      पत्र दिनांक *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      पत्र मिळाल्याच्या दिनांक *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <User className="h-4 w-4 mr-2 text-primary" />
                      पत्र कर्ता *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="पत्र कर्त्याचे नाव" 
                        className="font-devanagari"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="letterType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      पत्र प्रकार *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-devanagari">
                          <SelectValue placeholder="निवडा..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LETTER_TYPES.map((type, index) => (
                          <SelectItem key={index} value={type} className="font-devanagari">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                      पत्र आध्यक्ष *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-devanagari">
                          <SelectValue placeholder="निवडा..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LETTER_SUBJECTS.map((subject, index) => (
                          <SelectItem key={index} value={subject} className="font-devanagari">
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      मोबाइल क्रमांक
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="मोबाइल नंबर" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-devanagari">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      वह कागद पत्राची लख्या
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="कागदपत्रांची संख्या" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center font-devanagari">
                    <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                    पत्राचा विषय व तपशील *
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={5} 
                      placeholder="पत्राचा तपशीलवार विषय प्रविष्ट करा..."
                      className="font-devanagari"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear Form
              </Button>
              <Button type="button" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button type="submit" disabled={createDocumentMutation.isPending}>
                {createDocumentMutation.isPending ? "Submitting..." : "Submit Letter"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
