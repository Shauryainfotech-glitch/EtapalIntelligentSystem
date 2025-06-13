import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileSignature,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Settings,
  History,
  Workflow,
  Download,
  Send,
  Edit,
  Trash2,
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Form schemas
const signatureWorkflowSchema = z.object({
  workflowName: z.string().min(1, "वर्कफ़्लो नाम आवश्यक है / Workflow name is required"),
  documentId: z.string().min(1, "दस्तावेज़ चुनना आवश्यक है / Document selection is required"),
  signatureOrder: z.array(z.string()).min(1, "कम से कम एक हस्ताक्षरकर्ता आवश्यक है / At least one signer is required"),
  totalSteps: z.number().min(1),
  dueDate: z.string().optional(),
  settings: z.object({
    sequential: z.boolean().default(true),
    reminderEnabled: z.boolean().default(true),
    reminderInterval: z.number().default(24),
  }).default({}),
});

const signatureTemplateSchema = z.object({
  name: z.string().min(1, "टेम्प्लेट नाम आवश्यक है / Template name is required"),
  nameMarathi: z.string().optional(),
  description: z.string().optional(),
  templateType: z.enum(["government", "legal", "administrative"]),
  signerRoles: z.array(z.string()).min(1, "कम से कम एक भूमिका आवश्यक है / At least one role is required"),
  signatureFields: z.array(z.object({
    x: z.number(),
    y: z.number(),
    page: z.number(),
    width: z.number().default(200),
    height: z.number().default(50),
    role: z.string(),
  })).min(1),
  approvalFlow: z.object({
    type: z.enum(["sequential", "parallel"]),
    steps: z.array(z.object({
      role: z.string(),
      required: z.boolean(),
      order: z.number(),
    })),
  }),
});

type SignatureWorkflowForm = z.infer<typeof signatureWorkflowSchema>;
type SignatureTemplateForm = z.infer<typeof signatureTemplateSchema>;

export default function DigitalSignatures() {
  const [activeTab, setActiveTab] = useState("workflows");
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch signature workflows
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["/api/signature-workflows"],
  });

  // Fetch signature requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/signature-requests"],
  });

  // Fetch signature templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/signature-templates"],
  });

  // Fetch documents for workflow creation
  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
  });

  // Fetch users for signer selection
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Form for creating workflows
  const workflowForm = useForm<SignatureWorkflowForm>({
    resolver: zodResolver(signatureWorkflowSchema),
    defaultValues: {
      workflowName: "",
      documentId: "",
      signatureOrder: [],
      totalSteps: 1,
      settings: {
        sequential: true,
        reminderEnabled: true,
        reminderInterval: 24,
      },
    },
  });

  // Form for creating templates
  const templateForm = useForm<SignatureTemplateForm>({
    resolver: zodResolver(signatureTemplateSchema),
    defaultValues: {
      name: "",
      nameMarathi: "",
      description: "",
      templateType: "government",
      signerRoles: [],
      signatureFields: [],
      approvalFlow: {
        type: "sequential",
        steps: [],
      },
    },
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (data: SignatureWorkflowForm) => {
      return await apiRequest("/api/signature-workflows", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signature-workflows"] });
      setIsWorkflowDialogOpen(false);
      workflowForm.reset();
      toast({
        title: "सफलता / Success",
        description: "हस्ताक्षर वर्कफ़्लो सफलतापूर्वक बनाया गया / Signature workflow created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "त्रुटि / Error",
        description: "वर्कफ़्लो बनाने में त्रुटि / Error creating workflow",
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: SignatureTemplateForm) => {
      return await apiRequest("/api/signature-templates", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signature-templates"] });
      setIsTemplateDialogOpen(false);
      templateForm.reset();
      toast({
        title: "सफलता / Success",
        description: "हस्ताक्षर टेम्प्लेट सफलतापूर्वक बनाया गया / Signature template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "त्रुटि / Error",
        description: "टेम्प्लेट बनाने में त्रुटि / Error creating template",
        variant: "destructive",
      });
    },
  });

  // Start workflow mutation
  const startWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      return await apiRequest(`/api/signature-workflows/${workflowId}/start`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signature-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["/api/signature-requests"] });
      toast({
        title: "सफलता / Success",
        description: "हस्ताक्षर वर्कफ़्लो शुरू किया गया / Signature workflow started",
      });
    },
  });

  const onSubmitWorkflow = (data: SignatureWorkflowForm) => {
    createWorkflowMutation.mutate(data);
  };

  const onSubmitTemplate = (data: SignatureTemplateForm) => {
    createTemplateMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "लंबित / Pending" },
      in_progress: { color: "bg-blue-100 text-blue-800", label: "प्रगति में / In Progress" },
      completed: { color: "bg-green-100 text-green-800", label: "पूर्ण / Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "रद्द / Cancelled" },
      signed: { color: "bg-green-100 text-green-800", label: "हस्ताक्षरित / Signed" },
      declined: { color: "bg-red-100 text-red-800", label: "अस्वीकृत / Declined" },
      expired: { color: "bg-gray-100 text-gray-800", label: "समाप्त / Expired" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <FileSignature className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                डिजिटल हस्ताक्षर / Digital Signatures
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                दस्तावेज़ हस्ताक्षर वर्कफ़्लो प्रबंधन / Document Signature Workflow Management
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Workflow className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-sm text-gray-600">सक्रिय वर्कफ़्लो / Active Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {requests.filter((r: any) => r.status === 'signed').length}
                  </p>
                  <p className="text-sm text-gray-600">हस्ताक्षरित / Signed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {requests.filter((r: any) => r.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">लंबित / Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{templates.length}</p>
                  <p className="text-sm text-gray-600">टेम्प्लेट / Templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows">वर्कफ़्लो / Workflows</TabsTrigger>
            <TabsTrigger value="requests">अनुरोध / Requests</TabsTrigger>
            <TabsTrigger value="templates">टेम्प्लेट / Templates</TabsTrigger>
            <TabsTrigger value="audit">ऑडिट / Audit</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>हस्ताक्षर वर्कफ़्लो / Signature Workflows</CardTitle>
                    <CardDescription>
                      दस्तावेज़ हस्ताक्षर प्रक्रिया प्रबंधित करें / Manage document signature processes
                    </CardDescription>
                  </div>
                  <Dialog open={isWorkflowDialogOpen} onOpenChange={setIsWorkflowDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        नया वर्कफ़्लो / New Workflow
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>नया हस्ताक्षर वर्कफ़्लो / New Signature Workflow</DialogTitle>
                        <DialogDescription>
                          दस्तावेज़ हस्ताक्षर के लिए नया वर्कफ़्लो बनाएं / Create a new workflow for document signatures
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...workflowForm}>
                        <form onSubmit={workflowForm.handleSubmit(onSubmitWorkflow)} className="space-y-4">
                          <FormField
                            control={workflowForm.control}
                            name="workflowName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>वर्कफ़्लो नाम / Workflow Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="वर्कफ़्लो का नाम दर्ज करें / Enter workflow name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={workflowForm.control}
                            name="documentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>दस्तावेज़ / Document</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="दस्तावेज़ चुनें / Select document" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {documents.map((doc: any) => (
                                      <SelectItem key={doc.id} value={doc.id}>
                                        {doc.fileName} - {doc.subject}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsWorkflowDialogOpen(false)}>
                              रद्द करें / Cancel
                            </Button>
                            <Button type="submit" disabled={createWorkflowMutation.isPending}>
                              {createWorkflowMutation.isPending ? "बनाया जा रहा है..." : "वर्कफ़्लो बनाएं / Create Workflow"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {workflowsLoading ? (
                  <div className="text-center py-8">लोड हो रहा है... / Loading...</div>
                ) : workflows.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    कोई वर्कफ़्लो नहीं मिला / No workflows found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>नाम / Name</TableHead>
                        <TableHead>दस्तावेज़ / Document</TableHead>
                        <TableHead>स्थिति / Status</TableHead>
                        <TableHead>चरण / Steps</TableHead>
                        <TableHead>बनाया गया / Created</TableHead>
                        <TableHead>कार्य / Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflows.map((workflow: any) => (
                        <TableRow key={workflow.id}>
                          <TableCell className="font-medium">{workflow.workflowName}</TableCell>
                          <TableCell>{workflow.documentId}</TableCell>
                          <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                          <TableCell>{workflow.currentStep}/{workflow.totalSteps}</TableCell>
                          <TableCell>{new Date(workflow.createdAt).toLocaleDateString('hi-IN')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {workflow.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => startWorkflowMutation.mutate(workflow.id)}
                                  disabled={startWorkflowMutation.isPending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>हस्ताक्षर अनुरोध / Signature Requests</CardTitle>
                <CardDescription>
                  व्यक्तिगत हस्ताक्षर अनुरोध प्रबंधित करें / Manage individual signature requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">लोड हो रहा है... / Loading...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    कोई अनुरोध नहीं मिला / No requests found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>हस्ताक्षरकर्ता / Signer</TableHead>
                        <TableHead>दस्तावेज़ / Document</TableHead>
                        <TableHead>स्थिति / Status</TableHead>
                        <TableHead>भेजा गया / Sent</TableHead>
                        <TableHead>समाप्ति / Expires</TableHead>
                        <TableHead>कार्य / Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.signerName}</div>
                              <div className="text-sm text-gray-500">{request.signerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.documentId}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {request.sentAt ? new Date(request.sentAt).toLocaleDateString('hi-IN') : '-'}
                          </TableCell>
                          <TableCell>
                            {request.expiresAt ? new Date(request.expiresAt).toLocaleDateString('hi-IN') : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>हस्ताक्षर टेम्प्लेट / Signature Templates</CardTitle>
                    <CardDescription>
                      पुन: उपयोग योग्य हस्ताक्षर टेम्प्लेट प्रबंधित करें / Manage reusable signature templates
                    </CardDescription>
                  </div>
                  <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        नया टेम्प्लेट / New Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>नया हस्ताक्षर टेम्प्लेट / New Signature Template</DialogTitle>
                        <DialogDescription>
                          पुन: उपयोग के लिए हस्ताक्षर टेम्प्लेट बनाएं / Create a signature template for reuse
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...templateForm}>
                        <form onSubmit={templateForm.handleSubmit(onSubmitTemplate)} className="space-y-4">
                          <FormField
                            control={templateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>टेम्प्लेट नाम / Template Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="टेम्प्लेट का नाम दर्ज करें / Enter template name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="nameMarathi"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>मराठी नाम / Marathi Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="मराठी नाव / Marathi name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={templateForm.control}
                            name="templateType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>टेम्प्लेट प्रकार / Template Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="प्रकार चुनें / Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="government">सरकारी / Government</SelectItem>
                                    <SelectItem value="legal">कानूनी / Legal</SelectItem>
                                    <SelectItem value="administrative">प्रशासनिक / Administrative</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                              रद्द करें / Cancel
                            </Button>
                            <Button type="submit" disabled={createTemplateMutation.isPending}>
                              {createTemplateMutation.isPending ? "बनाया जा रहा है..." : "टेम्प्लेट बनाएं / Create Template"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="text-center py-8">लोड हो रहा है... / Loading...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    कोई टेम्प्लेट नहीं मिला / No templates found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template: any) => (
                      <Card key={template.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {template.nameMarathi && (
                                <p className="text-sm text-gray-600">{template.nameMarathi}</p>
                              )}
                            </div>
                            <Badge variant="outline">{template.templateType}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                              {template.signerRoles?.length || 0} भूमिकाएं / Roles
                            </span>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>हस्ताक्षर ऑडिट लॉग / Signature Audit Log</CardTitle>
                <CardDescription>
                  सभी हस्ताक्षर गतिविधियों का पूरा रिकॉर्ड / Complete record of all signature activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  ऑडिट लॉग लोड हो रहे हैं... / Loading audit logs...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}