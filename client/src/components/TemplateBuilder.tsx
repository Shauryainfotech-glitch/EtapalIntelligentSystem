import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  FormDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Settings,
  Layout,
  Database,
  Code,
  FileText,
  GripVertical,
  Edit,
  Save,
} from "lucide-react";

// Form schemas for template builder
const templateBuilderSchema = z.object({
  name: z.string().min(1, "टेम्प्लेट नाम आवश्यक है / Template name is required"),
  nameMarathi: z.string().optional(),
  description: z.string().optional(),
  descriptionMarathi: z.string().optional(),
  category: z.string().min(1, "श्रेणी आवश्यक है / Category is required"),
  templateType: z.string().min(1, "टेम्प्लेट प्रकार आवश्यक है / Template type is required"),
  subcategory: z.string().optional(),
  letterSubtype: z.string().optional(),
  departmentCode: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  content: z.string().optional(),
  structure: z.object({
    header: z.object({
      enabled: z.boolean().default(true),
      content: z.string().default(""),
      height: z.string().default("auto"),
    }),
    body: z.object({
      enabled: z.boolean().default(true),
      content: z.string().default(""),
      minHeight: z.string().default("300px"),
    }),
    footer: z.object({
      enabled: z.boolean().default(true),
      content: z.string().default(""),
      height: z.string().default("auto"),
    }),
    letterhead: z.object({
      enabled: z.boolean().default(true),
      content: z.string().default(""),
    }),
  }).default({}),
  styling: z.object({
    fontFamily: z.string().default("Arial, sans-serif"),
    fontSize: z.string().default("12px"),
    lineHeight: z.string().default("1.5"),
    marginTop: z.string().default("2cm"),
    marginBottom: z.string().default("2cm"),
    marginLeft: z.string().default("2cm"),
    marginRight: z.string().default("2cm"),
  }).default({}),
});

const fieldSchema = z.object({
  fieldName: z.string().min(1, "फ़ील्ड नाम आवश्यक है / Field name is required"),
  fieldLabel: z.string().min(1, "फ़ील्ड लेबल आवश्यक है / Field label is required"),
  fieldLabelMarathi: z.string().optional(),
  fieldType: z.enum(["text", "textarea", "select", "checkbox", "radio", "date", "number", "email", "phone", "file", "signature"]),
  section: z.enum(["header", "main", "footer", "signature"]),
  width: z.enum(["full", "half", "quarter", "auto"]),
  isRequired: z.boolean().default(false),
  isReadonly: z.boolean().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  helpTextMarathi: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
    labelMarathi: z.string().optional(),
  })).default([]),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    customMessage: z.string().optional(),
  }).default({}),
  conditional: z.object({
    dependsOn: z.string().optional(),
    condition: z.enum(["equals", "not_equals", "contains", "not_contains"]).optional(),
    value: z.string().optional(),
  }).default({}),
  displayOrder: z.number().default(0),
});

type TemplateBuilderForm = z.infer<typeof templateBuilderSchema>;
type FieldForm = z.infer<typeof fieldSchema>;

interface TemplateBuilderProps {
  templateId?: string;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

// Predefined template categories and types
const TEMPLATE_CATEGORIES = [
  { value: "covering_letter", label: "कवरिंग लेटर / Covering Letter" },
  { value: "followup_letter", label: "फॉलोअप लेटर / Followup Letter" },
  { value: "reminder_letter", label: "रिमाइंडर लेटर / Reminder Letter" },
  { value: "application", label: "आवेदन / Application" },
  { value: "complaint", label: "तक्रार / Complaint" },
  { value: "notice", label: "सूचना / Notice" },
  { value: "order", label: "आदेश / Order" },
  { value: "certificate", label: "प्रमाणपत्र / Certificate" },
  { value: "circular", label: "परिपत्र / Circular" },
];

const TEMPLATE_TYPES = [
  { value: "government_letter", label: "शासकीय पत्र / Government Letter" },
  { value: "application_form", label: "आवेदन फॉर्म / Application Form" },
  { value: "complaint_form", label: "तक्रार फॉर्म / Complaint Form" },
  { value: "notice_form", label: "सूचना फॉर्म / Notice Form" },
  { value: "certificate_form", label: "प्रमाणपत्र फॉर्म / Certificate Form" },
  { value: "circular_form", label: "परिपत्र फॉर्म / Circular Form" },
];

const FIELD_TYPES = [
  { value: "text", label: "टेक्स्ट / Text", icon: "T" },
  { value: "textarea", label: "टेक्स्ट एरिया / Textarea", icon: "¶" },
  { value: "select", label: "सेलेक्ट / Select", icon: "⌄" },
  { value: "checkbox", label: "चेकबॉक्स / Checkbox", icon: "☑" },
  { value: "radio", label: "रेडियो / Radio", icon: "◉" },
  { value: "date", label: "तारीख / Date", icon: "📅" },
  { value: "number", label: "संख्या / Number", icon: "#" },
  { value: "email", label: "ईमेल / Email", icon: "@" },
  { value: "phone", label: "फोन / Phone", icon: "📞" },
  { value: "file", label: "फाइल / File", icon: "📎" },
  { value: "signature", label: "हस्ताक्षर / Signature", icon: "✍" },
];

export function TemplateBuilder({ templateId, onSave, onCancel }: TemplateBuilderProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [fields, setFields] = useState<FieldForm[]>([]);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [editingField, setEditingField] = useState<FieldForm | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load existing template if editing
  const { data: existingTemplate } = useQuery({
    queryKey: ["/api/document-templates", templateId],
    enabled: !!templateId,
  });

  // Main template form
  const form = useForm<TemplateBuilderForm>({
    resolver: zodResolver(templateBuilderSchema),
    defaultValues: {
      name: "",
      nameMarathi: "",
      description: "",
      descriptionMarathi: "",
      category: "",
      templateType: "",
      subcategory: "",
      letterSubtype: "normal",
      departmentCode: "",
      isPublic: false,
      tags: [],
      content: "",
      structure: {
        header: { enabled: true, content: "", height: "auto" },
        body: { enabled: true, content: "", minHeight: "300px" },
        footer: { enabled: true, content: "", height: "auto" },
        letterhead: { enabled: true, content: "" },
      },
      styling: {
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        lineHeight: "1.5",
        marginTop: "2cm",
        marginBottom: "2cm",
        marginLeft: "2cm",
        marginRight: "2cm",
      },
    },
  });

  // Field form for adding/editing fields
  const fieldForm = useForm<FieldForm>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      fieldName: "",
      fieldLabel: "",
      fieldLabelMarathi: "",
      fieldType: "text",
      section: "main",
      width: "full",
      isRequired: false,
      isReadonly: false,
      placeholder: "",
      helpText: "",
      helpTextMarathi: "",
      defaultValue: "",
      options: [],
      validation: {},
      conditional: {},
      displayOrder: fields.length,
    },
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (data: TemplateBuilderForm) => {
      const templateData = {
        ...data,
        fields: JSON.stringify(fields),
        structure: JSON.stringify(data.structure),
        styling: JSON.stringify(data.styling),
        variables: JSON.stringify([]),
        conditions: JSON.stringify([]),
        validation: JSON.stringify({}),
        defaultValues: JSON.stringify({}),
        permissions: JSON.stringify({}),
      };

      if (templateId) {
        return await apiRequest(`/api/document-templates/${templateId}`, "PUT", templateData);
      } else {
        return await apiRequest("/api/document-templates", "POST", templateData);
      }
    },
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: ["/api/document-templates"] });
      toast({
        title: "सफलता / Success",
        description: templateId 
          ? "टेम्प्लेट अपडेट किया गया / Template updated successfully"
          : "टेम्प्लेट बनाया गया / Template created successfully",
      });
      onSave?.(template);
    },
    onError: () => {
      toast({
        title: "त्रुटि / Error",
        description: "टेम्प्लेट सेव करने में त्रुटि / Error saving template",
        variant: "destructive",
      });
    },
  });

  // Add or update field
  const handleFieldSave = (fieldData: FieldForm) => {
    if (editingField) {
      const index = fields.findIndex(f => f.fieldName === editingField.fieldName);
      if (index !== -1) {
        const updatedFields = [...fields];
        updatedFields[index] = fieldData;
        setFields(updatedFields);
      }
    } else {
      setFields([...fields, fieldData]);
    }
    setShowFieldDialog(false);
    setEditingField(null);
    fieldForm.reset();
  };

  // Remove field
  const handleFieldRemove = (fieldName: string) => {
    setFields(fields.filter(f => f.fieldName !== fieldName));
  };

  // Edit field
  const handleFieldEdit = (field: FieldForm) => {
    setEditingField(field);
    fieldForm.reset(field);
    setShowFieldDialog(true);
  };

  // Generate template preview
  const generatePreview = () => {
    const formData = form.getValues();
    const structure = formData.structure;
    const styling = formData.styling;
    
    let preview = `
      <div style="
        font-family: ${styling.fontFamily}; 
        font-size: ${styling.fontSize}; 
        line-height: ${styling.lineHeight};
        margin: ${styling.marginTop} ${styling.marginRight} ${styling.marginBottom} ${styling.marginLeft};
        min-height: 100vh;
      ">
    `;

    // Header section
    if (structure.header.enabled) {
      preview += `
        <div style="height: ${structure.header.height}; border-bottom: 1px solid #ccc; margin-bottom: 20px;">
          <h3 style="text-align: center; margin: 10px 0;">शासकीय पत्र / Government Letter</h3>
          ${structure.header.content || "<!-- हेडर कंटेंट / Header content -->"}
        </div>
      `;
    }

    // Letterhead
    if (structure.letterhead.enabled) {
      preview += `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="border: 2px solid #000; padding: 20px; background: #f9f9f9;">
            <h2 style="margin: 0; color: #1e40af;">SP Office Ahilyanagar</h2>
            <p style="margin: 5px 0; font-size: 14px;">पुलिस अधीक्षक कार्यालय अहिलयानगर</p>
            ${structure.letterhead.content || ""}
          </div>
        </div>
      `;
    }

    // Body section with fields
    preview += `
      <div style="min-height: ${structure.body.minHeight}; margin-bottom: 30px;">
        ${structure.body.content || ""}
        <div style="margin: 20px 0;">
    `;

    // Add form fields
    fields.filter(f => f.section === "main").forEach(field => {
      preview += `
        <div style="margin-bottom: 15px; width: ${field.width === 'full' ? '100%' : field.width === 'half' ? '50%' : '25%'}; display: inline-block; vertical-align: top; padding-right: 10px;">
          <label style="font-weight: bold; display: block; margin-bottom: 5px;">
            ${field.fieldLabel} ${field.fieldLabelMarathi ? `/ ${field.fieldLabelMarathi}` : ''}
            ${field.isRequired ? '<span style="color: red;">*</span>' : ''}
          </label>
      `;

      switch (field.fieldType) {
        case "textarea":
          preview += `<textarea placeholder="${field.placeholder || ''}" style="width: 95%; height: 80px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"></textarea>`;
          break;
        case "select":
          preview += `
            <select style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
              <option>${field.placeholder || 'चुनें / Select'}</option>
              ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          `;
          break;
        case "checkbox":
          preview += `<div style="margin-top: 5px;">`;
          field.options.forEach(opt => {
            preview += `<label style="font-weight: normal; margin-right: 15px;"><input type="checkbox" value="${opt.value}" style="margin-right: 5px;"> ${opt.label}</label>`;
          });
          preview += `</div>`;
          break;
        case "radio":
          preview += `<div style="margin-top: 5px;">`;
          field.options.forEach(opt => {
            preview += `<label style="font-weight: normal; margin-right: 15px;"><input type="radio" name="${field.fieldName}" value="${opt.value}" style="margin-right: 5px;"> ${opt.label}</label>`;
          });
          preview += `</div>`;
          break;
        case "date":
          preview += `<input type="date" placeholder="${field.placeholder || ''}" style="width: 95%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">`;
          break;
        case "signature":
          preview += `<div style="width: 95%; height: 100px; border: 2px dashed #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">हस्ताक्षर पैड / Signature Pad</div>`;
          break;
        default:
          preview += `<input type="${field.fieldType}" placeholder="${field.placeholder || ''}" style="width: 95%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">`;
      }

      if (field.helpText) {
        preview += `<small style="color: #666; display: block; margin-top: 3px;">${field.helpText}</small>`;
      }

      preview += `</div>`;
    });

    preview += `</div></div>`;

    // Footer section
    if (structure.footer.enabled) {
      preview += `
        <div style="height: ${structure.footer.height}; border-top: 1px solid #ccc; margin-top: 30px; padding-top: 20px;">
          ${structure.footer.content || `
            <div style="text-align: right;">
              <p style="margin: 10px 0;">हस्ताक्षर / Signature</p>
              <p style="margin: 10px 0;">पदनाम / Designation</p>
              <p style="margin: 10px 0;">दिनांक / Date: _______</p>
            </div>
          `}
        </div>
      `;
    }

    preview += `</div>`;
    return preview;
  };

  const onSubmit = (data: TemplateBuilderForm) => {
    saveTemplateMutation.mutate(data);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          टेम्प्लेट बिल्डर / Template Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          उन्नत फॉर्म फ़ील्ड और डेटाबेस एकीकरण के साथ कस्टम टेम्प्लेट बनाएं / Create custom templates with advanced form fields and database integration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Builder */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>टेम्प्लेट कॉन्फ़िगरेशन / Template Configuration</CardTitle>
                  <CardDescription>
                    टेम्प्लेट की मूलभूत जानकारी और संरचना सेट करें / Set up basic template information and structure
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {previewMode ? "संपादन / Edit" : "पूर्वावलोकन / Preview"}
                  </Button>
                  <Button
                    onClick={() => onCancel?.()}
                    variant="outline"
                    size="sm"
                  >
                    रद्द करें / Cancel
                  </Button>
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={saveTemplateMutation.isPending}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveTemplateMutation.isPending ? "सेव कर रहे हैं..." : "सेव करें / Save"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {previewMode ? (
                <div className="border rounded-lg p-4 bg-white min-h-96">
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatePreview() }}
                    className="template-preview"
                  />
                </div>
              ) : (
                <Form {...form}>
                  <form className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">मूल जानकारी / Basic</TabsTrigger>
                        <TabsTrigger value="structure">संरचना / Structure</TabsTrigger>
                        <TabsTrigger value="styling">स्टाइलिंग / Styling</TabsTrigger>
                        <TabsTrigger value="fields">फ़ील्ड्स / Fields</TabsTrigger>
                      </TabsList>

                      {/* Basic Information Tab */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>टेम्प्लेट नाम / Template Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="कवरिंग लेटर टेम्प्लेट / Covering Letter Template" {...field} />
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
                                  <Input placeholder="कव्हरिंग लेटर टेम्प्लेट" {...field} />
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
                                <FormLabel>श्रेणी / Category *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="श्रेणी चुनें / Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TEMPLATE_CATEGORIES.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
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
                            name="templateType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>टेम्प्लेट प्रकार / Template Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="प्रकार चुनें / Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {TEMPLATE_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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

                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>सार्वजनिक टेम्प्लेट / Public Template</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Structure Tab */}
                      <TabsContent value="structure" className="space-y-4">
                        <div className="space-y-6">
                          {/* Header Section */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">हेडर सेक्शन / Header Section</CardTitle>
                                <FormField
                                  control={form.control}
                                  name="structure.header.enabled"
                                  render={({ field }) => (
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <FormField
                                control={form.control}
                                name="structure.header.content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>हेडर कंटेंट / Header Content</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="हेडर के लिए HTML कंटेंट / HTML content for header"
                                        rows={3}
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>

                          {/* Body Section */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">मुख्य सेक्शन / Body Section</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <FormField
                                control={form.control}
                                name="structure.body.content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>मुख्य कंटेंट / Body Content</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="मुख्य कंटेंट के लिए HTML / HTML content for body"
                                        rows={4}
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>

                          {/* Footer Section */}
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">फूटर सेक्शन / Footer Section</CardTitle>
                                <FormField
                                  control={form.control}
                                  name="structure.footer.enabled"
                                  render={({ field }) => (
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  )}
                                />
                              </div>
                            </CardHeader>
                            <CardContent>
                              <FormField
                                control={form.control}
                                name="structure.footer.content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>फूटर कंटेंट / Footer Content</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="फूटर के लिए HTML कंटेंट / HTML content for footer"
                                        rows={3}
                                        {...field} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Styling Tab */}
                      <TabsContent value="styling" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="styling.fontFamily"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>फॉन्ट फैमिली / Font Family</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                                    <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                                    <SelectItem value="Calibri, sans-serif">Calibri</SelectItem>
                                    <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="styling.fontSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>फॉन्ट साइज़ / Font Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="10px">10px</SelectItem>
                                    <SelectItem value="12px">12px</SelectItem>
                                    <SelectItem value="14px">14px</SelectItem>
                                    <SelectItem value="16px">16px</SelectItem>
                                    <SelectItem value="18px">18px</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="styling.marginTop"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>टॉप मार्जिन / Top Margin</FormLabel>
                                <FormControl>
                                  <Input placeholder="2cm" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="styling.marginLeft"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>लेफ्ट मार्जिन / Left Margin</FormLabel>
                                <FormControl>
                                  <Input placeholder="2cm" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Fields Tab */}
                      <TabsContent value="fields" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">फॉर्म फ़ील्ड्स / Form Fields</h3>
                          <Dialog open={showFieldDialog} onOpenChange={setShowFieldDialog}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                फ़ील्ड जोड़ें / Add Field
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  {editingField ? "फ़ील्ड संपादित करें / Edit Field" : "नई फ़ील्ड जोड़ें / Add New Field"}
                                </DialogTitle>
                                <DialogDescription>
                                  फॉर्म फ़ील्ड की जानकारी और सेटिंग्स कॉन्फ़िगर करें / Configure form field information and settings
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...fieldForm}>
                                <form onSubmit={fieldForm.handleSubmit(handleFieldSave)} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={fieldForm.control}
                                      name="fieldName"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>फ़ील्ड नाम / Field Name *</FormLabel>
                                          <FormControl>
                                            <Input placeholder="applicantName" {...field} />
                                          </FormControl>
                                          <FormDescription>
                                            यूनीक फ़ील्ड आईडेंटिफायर / Unique field identifier
                                          </FormDescription>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="fieldType"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>फ़ील्ड प्रकार / Field Type *</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {FIELD_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                  <span className="mr-2">{type.icon}</span>
                                                  {type.label}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="fieldLabel"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>फ़ील्ड लेबल / Field Label *</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Applicant Name" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="fieldLabelMarathi"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>मराठी लेबल / Marathi Label</FormLabel>
                                          <FormControl>
                                            <Input placeholder="अर्जदाराचे नाव" {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="section"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>सेक्शन / Section</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="header">हेडर / Header</SelectItem>
                                              <SelectItem value="main">मुख्य / Main</SelectItem>
                                              <SelectItem value="footer">फूटर / Footer</SelectItem>
                                              <SelectItem value="signature">हस्ताक्षर / Signature</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="width"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>चौड़ाई / Width</FormLabel>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="full">पूरी चौड़ाई / Full Width</SelectItem>
                                              <SelectItem value="half">आधी चौड़ाई / Half Width</SelectItem>
                                              <SelectItem value="quarter">चौथाई चौड़ाई / Quarter Width</SelectItem>
                                              <SelectItem value="auto">ऑटो / Auto</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <FormField
                                    control={fieldForm.control}
                                    name="placeholder"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>प्लेसहोल्डर / Placeholder</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Enter your name / अपना नाम दर्ज करें" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={fieldForm.control}
                                    name="helpText"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>सहायता टेक्स्ट / Help Text</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Field help text / फ़ील्ड सहायता टेक्स्ट" {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <div className="flex items-center space-x-4">
                                    <FormField
                                      control={fieldForm.control}
                                      name="isRequired"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel>आवश्यक / Required</FormLabel>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={fieldForm.control}
                                      name="isReadonly"
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                          <FormLabel>केवल पढ़ने योग्य / Read Only</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="flex justify-end space-x-2">
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      onClick={() => {
                                        setShowFieldDialog(false);
                                        setEditingField(null);
                                        fieldForm.reset();
                                      }}
                                    >
                                      रद्द करें / Cancel
                                    </Button>
                                    <Button type="submit">
                                      {editingField ? "अपडेट करें / Update" : "जोड़ें / Add"}
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Fields List */}
                        <div className="space-y-2">
                          {fields.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              कोई फ़ील्ड नहीं जोड़ी गई / No fields added yet
                            </div>
                          ) : (
                            fields.map((field, index) => (
                              <Card key={field.fieldName} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <span className="text-blue-600 font-mono text-sm">
                                        {FIELD_TYPES.find(t => t.value === field.fieldType)?.icon}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">
                                        {field.fieldLabel}
                                        {field.fieldLabelMarathi && ` / ${field.fieldLabelMarathi}`}
                                      </h4>
                                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <span>{field.fieldName}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {FIELD_TYPES.find(t => t.value === field.fieldType)?.label}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          {field.section}
                                        </Badge>
                                        {field.isRequired && (
                                          <Badge variant="destructive" className="text-xs">
                                            आवश्यक / Required
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFieldEdit(field)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleFieldRemove(field.fieldName)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Template Information Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>टेम्प्लेट जानकारी / Template Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">फ़ील्ड्स / Fields:</span>
                  <span className="font-medium">{fields.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">आवश्यक / Required:</span>
                  <span className="font-medium">{fields.filter(f => f.isRequired).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">सेक्शन्स / Sections:</span>
                  <span className="font-medium">
                    {new Set(fields.map(f => f.section)).size || 1}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>उपलब्ध वेरिएबल्स / Available Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <code>{'{{user.name}}'}</code> - उपयोगकर्ता नाम / User Name
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <code>{'{{user.designation}}'}</code> - पदनाम / Designation
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <code>{'{{today}}'}</code> - आज की तारीख / Today's Date
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <code>{'{{department}}'}</code> - विभाग / Department
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}