import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { FileText, Plus, Edit, Trash2, Copy, Filter, Search, Download } from "lucide-react";

interface DocumentTemplate {
  id: string;
  name: string;
  nameMarathi: string;
  description: string;
  descriptionMarathi: string;
  category: string;
  templateType: string;
  fields: any;
  isActive: boolean;
  createdBy: string;
  departmentCode: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_CATEGORIES = [
  { value: "application", label: "आवेदन (Application)", labelEn: "Application" },
  { value: "complaint", label: "तक्रार (Complaint)", labelEn: "Complaint" },
  { value: "notice", label: "सूचना (Notice)", labelEn: "Notice" },
  { value: "order", label: "आदेश (Order)", labelEn: "Order" },
  { value: "letter", label: "पत्र (Letter)", labelEn: "Letter" },
  { value: "certificate", label: "प्रमाणपत्र (Certificate)", labelEn: "Certificate" }
];

const TEMPLATE_TYPES = [
  { value: "government_letter", label: "शासकीय पत्र (Government Letter)" },
  { value: "application_form", label: "आवेदन फॉर्म (Application Form)" },
  { value: "complaint_form", label: "तक्रार फॉर्म (Complaint Form)" },
  { value: "notice_form", label: "सूचना फॉर्म (Notice Form)" },
  { value: "certificate_form", label: "प्रमाणपत्र फॉर्म (Certificate Form)" }
];

export default function DocumentTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    nameMarathi: "",
    description: "",
    descriptionMarathi: "",
    category: "",
    templateType: "",
    departmentCode: "",
    fields: "[]"
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['/api/document-templates', selectedCategory, selectedType],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (selectedCategory) searchParams.append('category', selectedCategory);
      if (selectedType) searchParams.append('templateType', selectedType);
      return apiRequest(`/api/document-templates?${searchParams.toString()}`);
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/document-templates', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/document-templates'] });
      setShowCreateDialog(false);
      setEditingTemplate(null);
      setFormData({
        name: "",
        nameMarathi: "",
        description: "",
        descriptionMarathi: "",
        category: "",
        templateType: "",
        departmentCode: "",
        fields: "[]"
      });
      toast({
        title: "यशस्वी (Success)",
        description: "टेम्प्लेट तयार केले गेले (Template created successfully)",
      });
    },
    onError: () => {
      toast({
        title: "त्रुटी (Error)",
        description: "टेम्प्लेट तयार करताना त्रुटी (Error creating template)",
        variant: "destructive",
      });
    }
  });

  const filteredTemplates = Array.isArray(templates) ? templates.filter((template: DocumentTemplate) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.nameMarathi && template.nameMarathi.includes(searchTerm)) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSubmit = () => {
    try {
      const templateData = {
        ...formData,
        fields: JSON.parse(formData.fields || "[]"),
        isActive: true
      };
      createTemplateMutation.mutate(templateData);
    } catch (error) {
      toast({
        title: "त्रुटी (Error)",
        description: "अवैध JSON फॉर्मेट (Invalid JSON format in fields)",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      nameMarathi: template.nameMarathi || "",
      description: template.description || "",
      descriptionMarathi: template.descriptionMarathi || "",
      category: template.category,
      templateType: template.templateType,
      departmentCode: template.departmentCode || "",
      fields: JSON.stringify(template.fields, null, 2)
    });
    setShowCreateDialog(true);
  };

  const getCategoryLabel = (value: string) => {
    const category = TEMPLATE_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : value;
  };

  const getTypeLabel = (value: string) => {
    const type = TEMPLATE_TYPES.find(t => t.value === value);
    return type ? type.label : value;
  };

  return (
    <div className="space-y-6">
      <Header 
        title="दस्तावेज टेम्प्लेट्स (Document Templates)" 
        subtitle="मानकीकृत सरकारी फॉर्म आणि दस्तावेज व्यवस्थापन (Standardized Government Forms & Document Management)"
      />

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">शोध (Search)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="टेम्प्लेट नाव किंवा वर्णन शोधा (Search template name or description)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label>प्रकार (Category)</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="सर्व प्रकार (All Categories)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व प्रकार (All Categories)</SelectItem>
                  {TEMPLATE_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Label>टेम्प्लेट प्रकार (Template Type)</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="सर्व प्रकार (All Types)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व प्रकार (All Types)</SelectItem>
                  {TEMPLATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  नवीन टेम्प्लेट (New Template)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "टेम्प्लेट संपादित करा (Edit Template)" : "नवीन टेम्प्लेट तयार करा (Create New Template)"}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">नाव (Name) *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Template name in English"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nameMarathi">मराठी नाव (Marathi Name)</Label>
                      <Input
                        id="nameMarathi"
                        value={formData.nameMarathi}
                        onChange={(e) => setFormData({...formData, nameMarathi: e.target.value})}
                        placeholder="टेम्प्लेट नाव मराठीत"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">प्रकार (Category) *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="प्रकार निवडा (Select Category)" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="templateType">टेम्प्लेट प्रकार (Template Type) *</Label>
                      <Select value={formData.templateType} onValueChange={(value) => setFormData({...formData, templateType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="टेम्प्लेट प्रकार निवडा (Select Type)" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="departmentCode">विभाग कोड (Department Code)</Label>
                    <Input
                      id="departmentCode"
                      value={formData.departmentCode}
                      onChange={(e) => setFormData({...formData, departmentCode: e.target.value})}
                      placeholder="e.g., MH001, PUNE001"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">वर्णन (Description)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Template description in English"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptionMarathi">मराठी वर्णन (Marathi Description)</Label>
                    <Textarea
                      id="descriptionMarathi"
                      value={formData.descriptionMarathi}
                      onChange={(e) => setFormData({...formData, descriptionMarathi: e.target.value})}
                      placeholder="टेम्प्लेट वर्णन मराठीत"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fields">फील्ड कॉन्फिगरेशन (Field Configuration - JSON)</Label>
                    <Textarea
                      id="fields"
                      value={formData.fields}
                      onChange={(e) => setFormData({...formData, fields: e.target.value})}
                      placeholder='[{"name": "applicantName", "type": "text", "required": true, "label": "अर्जदाराचे नाव"}]'
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      रद्द करा (Cancel)
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!formData.name || !formData.category || !formData.templateType || createTemplateMutation.isPending}
                    >
                      {createTemplateMutation.isPending ? "सेव्ह करत आहे..." : editingTemplate ? "अपडेट करा (Update)" : "तयार करा (Create)"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">टेम्प्लेट्स लोड करत आहे... (Loading templates...)</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">टेम्प्लेट्स सापडले नाहीत (No Templates Found)</h3>
            <p className="mt-1 text-gray-500">नवीन टेम्प्लेट तयार करण्यासाठी वरील बटण वापरा (Use the button above to create a new template)</p>
          </div>
        ) : (
          filteredTemplates.map((template: DocumentTemplate) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.nameMarathi && (
                      <p className="text-sm text-gray-600 mt-1">{template.nameMarathi}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{getCategoryLabel(template.category)}</Badge>
                  <Badge variant="outline">{template.version}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {template.descriptionMarathi || template.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">प्रकार (Type):</span>
                    <span className="text-right">{getTypeLabel(template.templateType)}</span>
                  </div>
                  {template.departmentCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">विभाग (Dept):</span>
                      <span>{template.departmentCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">स्थिती (Status):</span>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "सक्रिय (Active)" : "निष्क्रिय (Inactive)"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Copy className="mr-2 h-4 w-4" />
                    वापरा (Use)
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    डाउनलोड (Download)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}