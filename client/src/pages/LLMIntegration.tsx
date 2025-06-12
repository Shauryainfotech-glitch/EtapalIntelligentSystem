import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Brain, 
  Zap, 
  Settings, 
  BarChart3, 
  Languages, 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  Activity,
  Cpu,
  Database,
  Eye
} from "lucide-react";

export default function LLMIntegration() {
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [confidenceThreshold, setConfidenceThreshold] = useState(90);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  const { data: processingStats } = useQuery({
    queryKey: ['/api/analytics/processing'],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents'],
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ documentId, analysisType }: { documentId: string; analysisType: string }) => {
      return await apiRequest("/api/ai/analyze", "POST", { documentId, analysisType });
    },
    onSuccess: (data: any) => {
      setAnalysisResult(data.result);
    },
  });

  const llmModels = [
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI",
      status: "active",
      accuracy: 96.7,
      speed: "Fast",
      cost: "$0.01/1K tokens",
      features: ["Document Analysis", "Classification", "Extraction"],
      icon: Brain,
      color: "green"
    },
    {
      id: "claude-3-sonnet",
      name: "Claude 3 Sonnet",
      provider: "Anthropic",
      status: "active",
      accuracy: 94.2,
      speed: "Medium",
      cost: "$0.015/1K tokens",
      features: ["Marathi Translation", "Context Understanding"],
      icon: Languages,
      color: "blue"
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      status: "standby",
      accuracy: 92.8,
      speed: "Very Fast",
      cost: "$0.0005/1K tokens",
      features: ["Multi-modal Analysis", "Image Processing"],
      icon: Zap,
      color: "purple"
    },
    {
      id: "embedding-ada-002",
      name: "Ada Embedding",
      provider: "OpenAI",
      status: "active",
      accuracy: 98.5,
      speed: "Very Fast",
      cost: "$0.0001/1K tokens",
      features: ["Semantic Search", "Vector Database"],
      icon: Search,
      color: "yellow"
    }
  ];

  const usageStats = [
    {
      title: "API Calls Today",
      value: "2,847",
      change: "+12%",
      icon: Activity,
      color: "blue"
    },
    {
      title: "Processing Speed",
      value: "2.3s avg",
      change: "Excellent",
      icon: Zap,
      color: "green"
    },
    {
      title: "Cost Efficiency",
      value: "₹45.20",
      change: "45% of budget",
      icon: DollarSign,
      color: "purple"
    },
    {
      title: "Success Rate",
      value: "98.7%",
      change: "+0.3%",
      icon: CheckCircle,
      color: "green"
    }
  ];

  const processingPipeline = [
    { name: "Document Upload", status: "completed", time: "0.1s" },
    { name: "Image Preprocessing", status: "completed", time: "0.3s" },
    { name: "OCR Extraction", status: "completed", time: "1.2s" },
    { name: "LLM Analysis", status: "processing", time: "2.1s" },
    { name: "Classification", status: "pending", time: "-" },
    { name: "Data Extraction", status: "pending", time: "-" },
    { name: "Validation", status: "pending", time: "-" }
  ];

  const modelConfigurations = {
    "gpt-4-turbo": {
      temperature: 0.3,
      maxTokens: 4096,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    },
    "claude-3-sonnet": {
      temperature: 0.2,
      maxTokens: 4096,
      topP: 0.9
    },
    "gemini-pro": {
      temperature: 0.4,
      maxTokens: 2048,
      topK: 40
    }
  };

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {usageStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-success mt-1">{stat.change}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="models">LLM Models</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">AI Testing</TabsTrigger>
          <TabsTrigger value="pipeline">Processing Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available LLM Models</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {llmModels.map((model) => {
                  const ModelIcon = model.icon;
                  return (
                    <Card key={model.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`bg-${model.color}-100 p-3 rounded-lg mr-4`}>
                              <ModelIcon className={`h-6 w-6 text-${model.color}-600`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{model.name}</h3>
                              <p className="text-sm text-gray-600">{model.provider}</p>
                            </div>
                          </div>
                          <Badge 
                            className={`${
                              model.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {model.status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Accuracy</span>
                            <span className="font-medium">{model.accuracy}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Speed</span>
                            <span className="font-medium">{model.speed}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Cost</span>
                            <span className="font-medium">{model.cost}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {model.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <Button 
                            size="sm" 
                            variant={model.status === 'active' ? 'secondary' : 'default'}
                            className="flex-1"
                          >
                            {model.status === 'active' ? 'Configure' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Model Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Model
                  </label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {llmModels.filter(m => m.status === 'active').map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modelConfigurations[selectedModel as keyof typeof modelConfigurations] && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900">Model Parameters</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature: {modelConfigurations[selectedModel as keyof typeof modelConfigurations].temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={modelConfigurations[selectedModel as keyof typeof modelConfigurations].temperature}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                      </label>
                      <Input
                        type="number"
                        defaultValue={modelConfigurations[selectedModel as keyof typeof modelConfigurations].maxTokens}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Top P: {modelConfigurations[selectedModel as keyof typeof modelConfigurations].topP}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={modelConfigurations[selectedModel as keyof typeof modelConfigurations].topP}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Processing Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-Processing</label>
                    <p className="text-xs text-gray-500">Process documents automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Smart Routing</label>
                    <p className="text-xs text-gray-500">Auto-select best model for task</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Threshold: {confidenceThreshold}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Batch Processing</label>
                    <p className="text-xs text-gray-500">Process multiple documents</p>
                  </div>
                  <Switch />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fallback Model
                  </label>
                  <Select defaultValue="claude-3-sonnet">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {llmModels.filter(m => m.id !== selectedModel && m.status === 'active').map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2" />
                Processing Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingPipeline.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-4 ${
                        step.status === 'completed' ? 'bg-green-100' :
                        step.status === 'processing' ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : step.status === 'processing' ? (
                          <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{step.name}</h4>
                        <p className="text-sm text-gray-600">
                          {step.status === 'completed' ? 'Completed' :
                           step.status === 'processing' ? 'Processing...' :
                           'Pending'}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {step.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Smart Optimization</h4>
                <p className="text-sm text-gray-600">
                  AI automatically switches between models based on task complexity and cost efficiency.
                  Current pipeline optimized for 96.7% accuracy with 2.3s average processing time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Real-time AI Document Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Document for Analysis
                  </label>
                  <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a document" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(documents) && documents.map((doc: any) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.originalFileName || doc.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 items-end">
                  <Button
                    onClick={() => selectedDocument && analyzeMutation.mutate({ 
                      documentId: selectedDocument, 
                      analysisType: "summary" 
                    })}
                    disabled={!selectedDocument || analyzeMutation.isPending}
                    className="flex-1"
                  >
                    {analyzeMutation.isPending ? "Analyzing..." : "Generate Summary"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => selectedDocument && analyzeMutation.mutate({ 
                      documentId: selectedDocument, 
                      analysisType: "classification" 
                    })}
                    disabled={!selectedDocument || analyzeMutation.isPending}
                    className="flex-1"
                  >
                    Classify Document
                  </Button>
                </div>
              </div>

              {analysisResult && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">AI Analysis Result</h4>
                  <div className="text-sm text-green-800 whitespace-pre-wrap">
                    {typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Bot className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">GPT-4 Turbo</span>
                  </div>
                  <p className="text-sm text-blue-800">Advanced document analysis with 96.7% accuracy</p>
                  <Badge variant="default" className="mt-2">Active</Badge>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Google Vision</span>
                  </div>
                  <p className="text-sm text-purple-800">OCR processing for document text extraction</p>
                  <Badge variant="secondary" className="mt-2">Active</Badge>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Languages className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-900">Marathi Support</span>
                  </div>
                  <p className="text-sm text-orange-800">Native support for Marathi government documents</p>
                  <Badge variant="outline" className="mt-2">Optimized</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {llmModels.filter(m => m.status === 'active').map((model) => (
                    <div key={model.id}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{model.name}</span>
                        <span className="text-sm text-gray-900">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tokens Processed Today</span>
                    <span className="font-medium">847,293</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Response Time</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cost per Document</span>
                    <span className="font-medium">₹0.15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-medium text-green-600">0.3%</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Model Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>GPT-4 Turbo</span>
                      <span>65%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Claude 3 Sonnet</span>
                      <span>25%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ada Embedding</span>
                      <span>10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
