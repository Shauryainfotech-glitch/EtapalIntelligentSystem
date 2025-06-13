import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { 
  Package, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus, 
  Download, 
  Upload, 
  Trash2,
  Edit,
  Copy,
  FileX,
  Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BulkOperation {
  id: string;
  userId: string;
  operationType: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  criteria: any;
  results: any;
  errorLog: string;
  createdAt: string;
  completedAt: string;
}

interface Document {
  id: string;
  subject: string;
  letterType: string;
  status: string;
  createdAt: string;
}

const OPERATION_TYPES = [
  { 
    value: "bulk_update", 
    label: "बल्क अपडेट (Bulk Update)", 
    icon: Edit,
    description: "एकाधिक दस्तावेजांची माहिती एकाच वेळी अपडेट करा"
  },
  { 
    value: "bulk_delete", 
    label: "बल्क डिलीट (Bulk Delete)", 
    icon: Trash2,
    description: "निवडलेले दस्तावेज एकाच वेळी हटवा"
  },
  { 
    value: "bulk_export", 
    label: "बल्क एक्स्पोर्ट (Bulk Export)", 
    icon: Download,
    description: "निवडलेले दस्तावेज डाउनलोड करा"
  },
  { 
    value: "bulk_archive", 
    label: "बल्क आर्काइव्ह (Bulk Archive)", 
    icon: Archive,
    description: "दस्तावेज आर्काइव्हमध्ये हलवा"
  },
  { 
    value: "bulk_tag", 
    label: "बल्क टॅगिंग (Bulk Tagging)", 
    icon: Copy,
    description: "एकाधिक दस्तावेजांना टॅग जोडा"
  }
];

const STATUS_COLORS = {
  pending: "yellow",
  processing: "blue", 
  completed: "green",
  failed: "red"
};

const STATUS_ICONS = {
  pending: Clock,
  processing: Play,
  completed: CheckCircle,
  failed: XCircle
};

export default function BulkOperations() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [operationType, setOperationType] = useState("");
  const [operationParams, setOperationParams] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: operations = [], isLoading } = useQuery({
    queryKey: ['/api/bulk-operations'],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents'],
  });

  const createOperationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/bulk-operations', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-operations'] });
      setShowCreateDialog(false);
      setSelectedDocuments([]);
      setOperationType("");
      setOperationParams({});
      toast({
        title: "यशस्वी (Success)",
        description: "बल्क ऑपरेशन तयार केले गेले (Bulk operation created successfully)",
      });
    },
    onError: () => {
      toast({
        title: "त्रुटी (Error)",
        description: "बल्क ऑपरेशन तयार करताना त्रुटी (Error creating bulk operation)",
        variant: "destructive",
      });
    }
  });

  const processOperationMutation = useMutation({
    mutationFn: (operationId: string) => 
      apiRequest(`/api/bulk-operations/${operationId}/process`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bulk-operations'] });
      toast({
        title: "यशस्वी (Success)",
        description: "बल्क ऑपरेशन सुरू केले गेले (Bulk operation started)",
      });
    }
  });

  const handleDocumentSelection = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments([...selectedDocuments, documentId]);
    } else {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && Array.isArray(documents)) {
      setSelectedDocuments(documents.map((doc: Document) => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleCreateOperation = () => {
    if (!operationType || selectedDocuments.length === 0) {
      toast({
        title: "त्रुटी (Error)",
        description: "कृपया ऑपरेशन प्रकार आणि दस्तावेज निवडा (Please select operation type and documents)",
        variant: "destructive",
      });
      return;
    }

    const operationData = {
      operationType,
      totalItems: selectedDocuments.length,
      criteria: {
        documentIds: selectedDocuments,
        ...operationParams
      }
    };

    createOperationMutation.mutate(operationData);
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
    return IconComponent;
  };

  const getOperationIcon = (type: string) => {
    const operation = OPERATION_TYPES.find(op => op.value === type);
    return operation ? operation.icon : Package;
  };

  const getProgressPercentage = (operation: BulkOperation) => {
    if (operation.totalItems === 0) return 0;
    return Math.round((operation.processedItems / operation.totalItems) * 100);
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      <Header 
        title="बल्क ऑपरेशन्स (Bulk Operations)" 
        subtitle="एकाधिक दस्तावेजांवर एकाच वेळी कार्य करा (Perform actions on multiple documents simultaneously)"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{Array.isArray(operations) ? operations.length : 0}</p>
                <p className="text-sm text-gray-600">एकूण ऑपरेशन्स (Total Operations)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(operations) ? operations.filter((op: BulkOperation) => op.status === 'processing').length : 0}
                </p>
                <p className="text-sm text-gray-600">प्रक्रियेत (Processing)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(operations) ? operations.filter((op: BulkOperation) => op.status === 'completed').length : 0}
                </p>
                <p className="text-sm text-gray-600">पूर्ण (Completed)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Array.isArray(operations) ? operations.filter((op: BulkOperation) => op.status === 'failed').length : 0}
                </p>
                <p className="text-sm text-gray-600">अयशस्वी (Failed)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Operation Dialog */}
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              नवीन बल्क ऑपरेशन (New Bulk Operation)
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>नवीन बल्क ऑपरेशन तयार करा (Create New Bulk Operation)</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Operation Type Selection */}
              <div>
                <Label className="text-base font-medium">ऑपरेशन प्रकार निवडा (Select Operation Type)</Label>
                <div className="grid gap-3 mt-3">
                  {OPERATION_TYPES.map((operation) => {
                    const IconComponent = operation.icon;
                    return (
                      <Card 
                        key={operation.value}
                        className={`cursor-pointer transition-colors ${
                          operationType === operation.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setOperationType(operation.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                            <div className="flex-1">
                              <h4 className="font-medium">{operation.label}</h4>
                              <p className="text-sm text-gray-600">{operation.description}</p>
                            </div>
                            <Checkbox 
                              checked={operationType === operation.value}
                              disabled
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Document Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-medium">
                    दस्तावेज निवडा (Select Documents) ({selectedDocuments.length} निवडले)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={Array.isArray(documents) && selectedDocuments.length === documents.length && documents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm">सर्व निवडा (Select All)</span>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {!Array.isArray(documents) || documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <FileX className="mx-auto h-8 w-8 mb-2" />
                      <p>दस्तावेज उपलब्ध नाहीत (No documents available)</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {documents.map((document: Document) => (
                        <div 
                          key={document.id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => handleDocumentSelection(
                            document.id, 
                            !selectedDocuments.includes(document.id)
                          )}
                        >
                          <Checkbox 
                            checked={selectedDocuments.includes(document.id)}
                            disabled
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{document.subject}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{document.letterType}</span>
                              <Badge variant="outline" className="text-xs">
                                {document.status}
                              </Badge>
                              <span>{formatTimeAgo(document.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Operation-specific Parameters */}
              {operationType === 'bulk_update' && (
                <div>
                  <Label className="text-base font-medium">अपडेट पॅरामीटर्स (Update Parameters)</Label>
                  <div className="grid gap-3 mt-3">
                    <div>
                      <Label htmlFor="newStatus">नवीन स्थिती (New Status)</Label>
                      <Select onValueChange={(value) => setOperationParams({...operationParams, newStatus: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="स्थिती निवडा (Select Status)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">प्रलंबित (Pending)</SelectItem>
                          <SelectItem value="processing">प्रक्रियेत (Processing)</SelectItem>
                          <SelectItem value="completed">पूर्ण (Completed)</SelectItem>
                          <SelectItem value="archived">आर्काइव्ह (Archived)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {operationType === 'bulk_tag' && (
                <div>
                  <Label className="text-base font-medium">टॅग पॅरामीटर्स (Tag Parameters)</Label>
                  <div className="grid gap-3 mt-3">
                    <div>
                      <Label htmlFor="tagName">टॅग नाव (Tag Name)</Label>
                      <Input
                        id="tagName"
                        value={operationParams.tagName || ""}
                        onChange={(e) => setOperationParams({...operationParams, tagName: e.target.value})}
                        placeholder="टॅग नाव एंटर करा"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagColor">टॅग रंग (Tag Color)</Label>
                      <Input
                        id="tagColor"
                        type="color"
                        value={operationParams.tagColor || "#3B82F6"}
                        onChange={(e) => setOperationParams({...operationParams, tagColor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  रद्द करा (Cancel)
                </Button>
                <Button 
                  onClick={handleCreateOperation}
                  disabled={!operationType || selectedDocuments.length === 0 || createOperationMutation.isPending}
                >
                  {createOperationMutation.isPending ? "तयार करत आहे..." : "ऑपरेशन तयार करा (Create Operation)"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">ऑपरेशन्स लोड करत आहे... (Loading operations...)</p>
          </div>
        ) : !Array.isArray(operations) || operations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">बल्क ऑपरेशन्स सापडले नाहीत (No Bulk Operations Found)</h3>
              <p className="mt-1 text-gray-500">नवीन बल्क ऑपरेशन तयार करण्यासाठी वरील बटण वापरा (Use the button above to create a new bulk operation)</p>
            </CardContent>
          </Card>
        ) : (
          Array.isArray(operations) && operations.map((operation: BulkOperation) => {
            const StatusIcon = getStatusIcon(operation.status);
            const OperationIcon = getOperationIcon(operation.operationType);
            const progressPercentage = getProgressPercentage(operation);
            
            return (
              <Card key={operation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <OperationIcon className="h-6 w-6 text-blue-600" />
                        <StatusIcon className={`h-5 w-5 text-${STATUS_COLORS[operation.status]}-500`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium">
                            {OPERATION_TYPES.find(op => op.value === operation.operationType)?.label || operation.operationType}
                          </h3>
                          <Badge 
                            variant="secondary"
                            className={`bg-${STATUS_COLORS[operation.status]}-100 text-${STATUS_COLORS[operation.status]}-800`}
                          >
                            {operation.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">एकूण आयटम:</span>
                            <span className="ml-1 font-medium">{operation.totalItems}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">प्रक्रिया केलेले:</span>
                            <span className="ml-1 font-medium">{operation.processedItems}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">अयशस्वी:</span>
                            <span className="ml-1 font-medium text-red-600">{operation.failedItems}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">प्रगती:</span>
                            <span className="ml-1 font-medium">{progressPercentage}%</span>
                          </div>
                        </div>
                        
                        {operation.status === 'processing' && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>तयार केले: {formatTimeAgo(operation.createdAt)}</span>
                          {operation.completedAt && (
                            <span>पूर्ण केले: {formatTimeAgo(operation.completedAt)}</span>
                          )}
                        </div>
                        
                        {operation.errorLog && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            त्रुटी: {operation.errorLog}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {operation.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => processOperationMutation.mutate(operation.id)}
                          disabled={processOperationMutation.isPending}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          सुरू करा (Start)
                        </Button>
                      )}
                      
                      {operation.status === 'completed' && operation.operationType === 'bulk_export' && (
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          डाउनलोड (Download)
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}