import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
} from "lucide-react";

const quickTemplateSchema = z.object({
  name: z.string().min(1, "टेम्प्लेट नाम आवश्यक है / Template name is required"),
  nameMarathi: z.string().optional(),
  category: z.string().min(1, "श्रेणी आवश्यक है / Category is required"),
  templateType: z.string().min(1, "टेम्प्लेट प्रकार आवश्यक है / Template type is required"),
  description: z.string().optional(),
  departmentCode: z.string().optional(),
});

type QuickTemplateForm = z.infer<typeof quickTemplateSchema>;

interface QuickTemplateCreatorProps {
  onTemplateCreated?: (template: any) => void;
}

// Predefined template configurations for quick creation
const QUICK_TEMPLATES = [
  {
    id: "covering_letter",
    icon: Mail,
    title: "कवरिंग लेटर / Covering Letter",
    description: "दस्तावेजों के साथ भेजे जाने वाले कवरिंग लेटर / Cover letters sent with documents",
    category: "covering_letter",
    templateType: "government_letter",
    defaultFields: [
      {
        fieldName: "recipientName",
        fieldLabel: "Recipient Name",
        fieldLabelMarathi: "प्राप्तकर्ता नाम",
        fieldType: "text",
        section: "header",
        isRequired: true,
        width: "full",
        placeholder: "Enter recipient name",
        displayOrder: 1,
      },
      {
        fieldName: "recipientDesignation",
        fieldLabel: "Designation",
        fieldLabelMarathi: "पदनाम",
        fieldType: "text",
        section: "header",
        isRequired: true,
        width: "full",
        placeholder: "Enter designation",
        displayOrder: 2,
      },
      {
        fieldName: "subject",
        fieldLabel: "Subject",
        fieldLabelMarathi: "विषय",
        fieldType: "text",
        section: "main",
        isRequired: true,
        width: "full",
        placeholder: "Enter subject",
        displayOrder: 3,
      },
      {
        fieldName: "mainContent",
        fieldLabel: "Main Content",
        fieldLabelMarathi: "मुख्य मजकूर",
        fieldType: "textarea",
        section: "main",
        isRequired: true,
        width: "full",
        placeholder: "Enter main content of the letter",
        displayOrder: 4,
      },
      {
        fieldName: "attachments",
        fieldLabel: "Attachments",
        fieldLabelMarathi: "संलग्नक",
        fieldType: "textarea",
        section: "main",
        width: "full",
        placeholder: "List of attached documents",
        displayOrder: 5,
      },
    ],
    defaultContent: `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2>SP Office Ahilyanagar</h2>
        <p>पुलिस अधीक्षक कार्यालय अहिलयानगर</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>प्रति,</p>
        <p>{{recipientName}}</p>
        <p>{{recipientDesignation}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>विषय: {{subject}}</strong></p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>महोदय,</p>
        <p>{{mainContent}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>संलग्नक:</strong></p>
        <p>{{attachments}}</p>
      </div>
      <div style="text-align: right; margin-top: 40px;">
        <p>आपका विश्वासू,</p>
        <p>पुलिस अधीक्षक</p>
        <p>अहिलयानगर</p>
      </div>
    `,
  },
  {
    id: "followup_letter",
    icon: Clock,
    title: "फॉलोअप लेटर / Followup Letter",
    description: "पूर्व पत्राचार का अनुसरण करने वाले पत्र / Letters following up on previous correspondence",
    category: "followup_letter",
    templateType: "government_letter",
    defaultFields: [
      {
        fieldName: "originalLetterRef",
        fieldLabel: "Original Letter Reference",
        fieldLabelMarathi: "मूल पत्र संदर्भ",
        fieldType: "text",
        section: "header",
        isRequired: true,
        width: "half",
        placeholder: "Enter original letter reference",
        displayOrder: 1,
      },
      {
        fieldName: "originalLetterDate",
        fieldLabel: "Original Letter Date",
        fieldLabelMarathi: "मूल पत्र दिनांक",
        fieldType: "date",
        section: "header",
        isRequired: true,
        width: "half",
        displayOrder: 2,
      },
      {
        fieldName: "recipientName",
        fieldLabel: "Recipient Name",
        fieldLabelMarathi: "प्राप्तकर्ता नाम",
        fieldType: "text",
        section: "header",
        isRequired: true,
        width: "full",
        placeholder: "Enter recipient name",
        displayOrder: 3,
      },
      {
        fieldName: "followupReason",
        fieldLabel: "Reason for Followup",
        fieldLabelMarathi: "फॉलोअप कारण",
        fieldType: "select",
        section: "main",
        isRequired: true,
        width: "full",
        options: [
          { value: "no_response", label: "No Response Received", labelMarathi: "प्रतिसाद नाही मिळाला" },
          { value: "incomplete_info", label: "Incomplete Information", labelMarathi: "अपूर्ण माहिती" },
          { value: "status_update", label: "Status Update Required", labelMarathi: "स्थिती अद्यतन आवश्यक" },
          { value: "urgent_matter", label: "Urgent Matter", labelMarathi: "तातडीची बाब" },
        ],
        displayOrder: 4,
      },
      {
        fieldName: "followupContent",
        fieldLabel: "Followup Content",
        fieldLabelMarathi: "फॉलोअप मजकूर",
        fieldType: "textarea",
        section: "main",
        isRequired: true,
        width: "full",
        placeholder: "Enter followup content",
        displayOrder: 5,
      },
      {
        fieldName: "expectedAction",
        fieldLabel: "Expected Action",
        fieldLabelMarathi: "अपेक्षित कार्य",
        fieldType: "textarea",
        section: "main",
        width: "full",
        placeholder: "Describe expected action from recipient",
        displayOrder: 6,
      },
      {
        fieldName: "responseDeadline",
        fieldLabel: "Response Deadline",
        fieldLabelMarathi: "प्रतिसाद मुदत",
        fieldType: "date",
        section: "main",
        width: "half",
        displayOrder: 7,
      },
    ],
    defaultContent: `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2>SP Office Ahilyanagar</h2>
        <p>पुलिस अधीक्षक कार्यालय अहिलयानगर</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>संदर्भ: {{originalLetterRef}} दिनांक {{originalLetterDate}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>प्रति,</p>
        <p>{{recipientName}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>विषय: फॉलोअप - {{subject}}</strong></p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>महोदय,</p>
        <p>आपल्या वरील संदर्भीत पत्राच्या संदर्भात, {{followupContent}}</p>
        <p>{{expectedAction}}</p>
        <p>कृपया {{responseDeadline}} पर्यंत प्रतिसाद द्यावा.</p>
      </div>
      <div style="text-align: right; margin-top: 40px;">
        <p>आपका विश्वासू,</p>
        <p>पुलिस अधीक्षक</p>
        <p>अहिलयानगर</p>
      </div>
    `,
  },
  {
    id: "reminder_letter",
    icon: AlertCircle,
    title: "रिमाइंडर लेटर / Reminder Letter",
    description: "लंबित कार्यों के लिए स्मरण पत्र / Reminder letters for pending tasks",
    category: "reminder_letter",
    templateType: "government_letter",
    defaultFields: [
      {
        fieldName: "reminderNumber",
        fieldLabel: "Reminder Number",
        fieldLabelMarathi: "स्मरण क्रमांक",
        fieldType: "select",
        section: "header",
        isRequired: true,
        width: "half",
        options: [
          { value: "1", label: "First Reminder", labelMarathi: "पहिले स्मरण" },
          { value: "2", label: "Second Reminder", labelMarathi: "दुसरे स्मरण" },
          { value: "3", label: "Final Reminder", labelMarathi: "अंतिम स्मरण" },
        ],
        displayOrder: 1,
      },
      {
        fieldName: "urgencyLevel",
        fieldLabel: "Urgency Level",
        fieldLabelMarathi: "तात्काळता पातळी",
        fieldType: "select",
        section: "header",
        isRequired: true,
        width: "half",
        options: [
          { value: "normal", label: "Normal", labelMarathi: "सामान्य" },
          { value: "urgent", label: "Urgent", labelMarathi: "तातडीचे" },
          { value: "very_urgent", label: "Very Urgent", labelMarathi: "अतिशय तातडीचे" },
        ],
        displayOrder: 2,
      },
      {
        fieldName: "originalReference",
        fieldLabel: "Original Reference",
        fieldLabelMarathi: "मूळ संदर्भ",
        fieldType: "text",
        section: "header",
        isRequired: true,
        width: "full",
        placeholder: "Enter original letter/order reference",
        displayOrder: 3,
      },
      {
        fieldName: "pendingTask",
        fieldLabel: "Pending Task",
        fieldLabelMarathi: "प्रलंबित कार्य",
        fieldType: "textarea",
        section: "main",
        isRequired: true,
        width: "full",
        placeholder: "Describe the pending task",
        displayOrder: 4,
      },
      {
        fieldName: "previousReminders",
        fieldLabel: "Previous Reminders",
        fieldLabelMarathi: "पूर्वीचे स्मरण",
        fieldType: "textarea",
        section: "main",
        width: "full",
        placeholder: "List previous reminder dates if any",
        displayOrder: 5,
      },
      {
        fieldName: "consequences",
        fieldLabel: "Consequences of Non-Compliance",
        fieldLabelMarathi: "पालन न केल्याचे परिणाम",
        fieldType: "textarea",
        section: "main",
        width: "full",
        placeholder: "Describe consequences if task is not completed",
        displayOrder: 6,
      },
      {
        fieldName: "finalDeadline",
        fieldLabel: "Final Deadline",
        fieldLabelMarathi: "अंतिम मुदत",
        fieldType: "date",
        section: "main",
        isRequired: true,
        width: "half",
        displayOrder: 7,
      },
    ],
    defaultContent: `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2>SP Office Ahilyanagar</h2>
        <p>पुलिस अधीक्षक कार्यालय अहिलयानगर</p>
      </div>
      <div style="margin-bottom: 20px; text-align: center;">
        <h3 style="color: red;">{{reminderNumber}} स्मरण पत्र / {{reminderNumber}} REMINDER</h3>
        <p style="color: red;">{{urgencyLevel}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>संदर्भ: {{originalReference}}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p>महोदय,</p>
        <p>वरील संदर्भानुसार, {{pendingTask}} हे कार्य अद्याप प्रलंबित आहे.</p>
        <p>{{previousReminders}}</p>
        <p>{{consequences}}</p>
        <p><strong>कृपया {{finalDeadline}} पर्यंत हे कार्य पूर्ण करून अहवाल सादर करावा.</strong></p>
      </div>
      <div style="text-align: right; margin-top: 40px;">
        <p>आपका विश्वासू,</p>
        <p>पुलिस अधीक्षक</p>
        <p>अहिलयानगर</p>
      </div>
    `,
  },
];

export function QuickTemplateCreator({ onTemplateCreated }: QuickTemplateCreatorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuickTemplateForm>({
    resolver: zodResolver(quickTemplateSchema),
    defaultValues: {
      name: "",
      nameMarathi: "",
      category: "",
      templateType: "",
      description: "",
      departmentCode: "SP_ANG",
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/document-templates", "POST", data);
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      toast({
        title: "सफलता / Success",
        description: "त्वरित टेम्प्लेट सफलतापूर्वक बनाया गया / Quick template created successfully",
      });
      form.reset();
      setSelectedTemplate("");
      setIsCreating(false);
      onTemplateCreated?.(template);
    },
    onError: () => {
      toast({
        title: "त्रुटि / Error",
        description: "टेम्प्लेट बनाने में त्रुटि / Error creating template",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = QUICK_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      form.setValue("name", template.title);
      form.setValue("category", template.category);
      form.setValue("templateType", template.templateType);
      form.setValue("description", template.description);
    }
  };

  const handleCreateTemplate = () => {
    const selectedConfig = QUICK_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!selectedConfig) return;

    const formData = form.getValues();
    const templateData = {
      ...formData,
      fields: JSON.stringify(selectedConfig.defaultFields),
      content: selectedConfig.defaultContent,
      structure: JSON.stringify({
        header: { enabled: true, content: "", height: "auto" },
        body: { enabled: true, content: selectedConfig.defaultContent, minHeight: "300px" },
        footer: { enabled: true, content: "", height: "auto" },
        letterhead: { enabled: true, content: "" },
      }),
      styling: JSON.stringify({
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.5",
        marginTop: "2cm",
        marginBottom: "2cm",
        marginLeft: "2cm",
        marginRight: "2cm",
      }),
      variables: JSON.stringify([]),
      conditions: JSON.stringify([]),
      validation: JSON.stringify({}),
      defaultValues: JSON.stringify({}),
      permissions: JSON.stringify({}),
      tags: JSON.stringify([selectedConfig.category]),
    };

    createTemplateMutation.mutate(templateData);
  };

  const onSubmit = (data: QuickTemplateForm) => {
    setIsCreating(true);
    handleCreateTemplate();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          त्वरित टेम्प्लेट निर्माता / Quick Template Creator
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          सामान्य सरकारी पत्रों के लिए पूर्व-कॉन्फ़िगर टेम्प्लेट का चयन करें / Choose pre-configured templates for common government letters
        </p>
      </div>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {QUICK_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {template.defaultFields.length} फ़ील्ड्स / Fields
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Configuration Form */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>टेम्प्लेट कॉन्फ़िगरेशन / Template Configuration</CardTitle>
            <CardDescription>
              चयनित टेम्प्लेट की विवरण भरें / Fill in details for the selected template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>टेम्प्लेट नाम / Template Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="टेम्प्लेट का नाम दर्ज करें" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nameMarathi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>मराठी नाम / Marathi Name</FormLabel>
                        <FormControl>
                          <Input placeholder="मराठी नाव" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>श्रेणी / Category</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="templateType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>टेम्प्लेट प्रकार / Template Type</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departmentCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>विभाग कोड / Department Code</FormLabel>
                        <FormControl>
                          <Input placeholder="SP_ANG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>विवरण / Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="टेम्प्लेट का विस्तृत विवरण / Detailed template description"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate("");
                      form.reset();
                    }}
                  >
                    रद्द करें / Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTemplateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createTemplateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        बना रहे हैं...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        टेम्प्लेट बनाएं / Create Template
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>टेम्प्लेट पूर्वावलोकन / Template Preview</CardTitle>
            <CardDescription>
              चयनित टेम्प्लेट का पूर्वावलोकन / Preview of the selected template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: QUICK_TEMPLATES.find(t => t.id === selectedTemplate)?.defaultContent || "" 
                }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}