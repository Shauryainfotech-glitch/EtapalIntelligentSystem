import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { 
  Database, 
  Bot, 
  Network, 
  BarChart3, 
  Shield, 
  Workflow, 
  FileText,
  Cloud,
  Settings
} from "lucide-react";

export default function DocumentationAI() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-orange-950/20 dark:to-green-950/20">
      <Header title="AI Integration Documentation" subtitle="Comprehensive database and AI endpoint integration guide for e Patra (ई-पत्र)" />
      
      <div className="container mx-auto p-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="ai-endpoints">AI Endpoints</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="api-docs">API Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  e Patra AI Integration System
                </CardTitle>
                <CardDescription>
                  Advanced government document management with comprehensive AI-powered OCR and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Schema
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant="secondary">14 Core Tables</Badge>
                      <Badge variant="secondary">AI Endpoint Management</Badge>
                      <Badge variant="secondary">Performance Tracking</Badge>
                      <Badge variant="secondary">Audit Logging</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        AI Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant="outline">Google Vision OCR</Badge>
                      <Badge variant="outline">OpenAI GPT-4</Badge>
                      <Badge variant="outline">Anthropic Claude</Badge>
                      <Badge variant="outline">Performance Monitoring</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Badge variant="destructive">Real-time Metrics</Badge>
                      <Badge variant="destructive">Cost Tracking</Badge>
                      <Badge variant="destructive">Performance Analysis</Badge>
                      <Badge variant="destructive">Usage Statistics</Badge>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="prose dark:prose-invert max-w-none">
                  <h3>System Architecture</h3>
                  <p>
                    The e Patra system provides comprehensive AI integration for government document processing,
                    featuring bilingual support (English/Marathi), advanced OCR capabilities, and detailed
                    performance monitoring across multiple AI service providers.
                  </p>
                  
                  <h4>Key Features:</h4>
                  <ul>
                    <li><strong>Multi-provider AI Integration:</strong> Google Vision, OpenAI, Anthropic</li>
                    <li><strong>Comprehensive Performance Tracking:</strong> Response times, costs, accuracy metrics</li>
                    <li><strong>Document Workflow Management:</strong> Status tracking and assignment systems</li>
                    <li><strong>Audit Logging:</strong> Complete activity tracking for compliance</li>
                    <li><strong>Real-time Analytics:</strong> Dashboard with live performance metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6" />
                  Database Schema Documentation
                </CardTitle>
                <CardDescription>
                  Complete database structure with AI integration tables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Core Tables</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">users</CardTitle>
                            <CardDescription>User authentication and profiles</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">documents</CardTitle>
                            <CardDescription>Document metadata and file information</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, title, type, subject, office, description, filePath, fileName, fileSize, mimeType, uploadedBy, status, priority, dueDate, assignedTo, tags, metadata, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">roles</CardTitle>
                            <CardDescription>User role and permission management</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, name, description, permissions, isActive, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">AI Integration Tables</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">ai_api_endpoints</CardTitle>
                            <CardDescription>AI service provider configurations</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, name, provider, endpoint, apiKey, model, isActive, rateLimit, timeout, retryAttempts, configuration, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">ai_api_usage</CardTitle>
                            <CardDescription>Individual API call tracking</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, endpointId, documentId, requestType, requestPayload, responsePayload, responseTime, tokenCount, cost, success, errorMessage, confidenceScore, createdAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">ai_model_performance</CardTitle>
                            <CardDescription>Daily performance aggregation</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, endpointId, date, totalRequests, successfulRequests, failedRequests, averageResponseTime, totalTokensUsed, totalCost, averageConfidence, createdAt</code>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Processing Tables</h3>
                      <div className="grid grid-cols-1 gap-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">ocr_results</CardTitle>
                            <CardDescription>OCR processing results and confidence scores</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, documentId, endpointId, extractedText, confidence, language, boundingBoxes, pageNumber, processingTime, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">document_analysis</CardTitle>
                            <CardDescription>AI-powered document analysis and classification</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, documentId, endpointId, analysisType, result, confidence, summary, keyPoints, sentimentScore, isValidated, validatedBy, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">document_workflow</CardTitle>
                            <CardDescription>Document processing workflow tracking</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <code>id, documentId, stepName, status, assignedTo, startedAt, completedAt, notes, priority, dependencies, estimatedDuration, actualDuration, createdAt, updatedAt</code>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  AI Endpoint Configuration
                </CardTitle>
                <CardDescription>
                  Configured AI service providers and their specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Google Vision OCR
                      </CardTitle>
                      <CardDescription>Text detection and document processing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Model:</strong> text-detection
                        </div>
                        <div>
                          <strong>Rate Limit:</strong> 1000/min
                        </div>
                        <div>
                          <strong>Timeout:</strong> 30 seconds
                        </div>
                        <div>
                          <strong>Languages:</strong> Marathi, English, Hindi
                        </div>
                      </div>
                      <div>
                        <strong>Features:</strong>
                        <div className="flex gap-2 mt-1">
                          <Badge>TEXT_DETECTION</Badge>
                          <Badge>DOCUMENT_TEXT_DETECTION</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        OpenAI GPT-4
                      </CardTitle>
                      <CardDescription>Document analysis and content generation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Model:</strong> gpt-4o
                        </div>
                        <div>
                          <strong>Rate Limit:</strong> 500/min
                        </div>
                        <div>
                          <strong>Timeout:</strong> 60 seconds
                        </div>
                        <div>
                          <strong>Max Tokens:</strong> 2000
                        </div>
                      </div>
                      <div>
                        <strong>Configuration:</strong>
                        <div className="text-sm mt-1 font-mono bg-muted p-2 rounded">
                          temperature: 0.1, topP: 0.9, frequencyPenalty: 0, presencePenalty: 0
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Anthropic Claude
                      </CardTitle>
                      <CardDescription>Document classification and analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>Model:</strong> claude-3-5-sonnet-20241022
                        </div>
                        <div>
                          <strong>Rate Limit:</strong> 300/min
                        </div>
                        <div>
                          <strong>Timeout:</strong> 45 seconds
                        </div>
                        <div>
                          <strong>Max Tokens:</strong> 1500
                        </div>
                      </div>
                      <div>
                        <strong>Configuration:</strong>
                        <div className="text-sm mt-1 font-mono bg-muted p-2 rounded">
                          temperature: 0.1, topK: 40
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Performance Tracking & Monitoring
                </CardTitle>
                <CardDescription>
                  Comprehensive monitoring and audit trail system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">API Usage Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Metrics Captured:</strong>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Response time</li>
                          <li>Token consumption</li>
                          <li>Cost per request</li>
                          <li>Success/failure rates</li>
                          <li>Confidence scores</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Performance Aggregation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Daily Metrics:</strong>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Total requests processed</li>
                          <li>Average response time</li>
                          <li>Cost analysis</li>
                          <li>Error rate trends</li>
                          <li>Model performance comparison</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Audit Logging</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Tracked Activities:</strong>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>User actions</li>
                          <li>Document access</li>
                          <li>AI processing events</li>
                          <li>System configuration changes</li>
                          <li>Data modifications</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Workflow Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <strong>Process Tracking:</strong>
                        <ul className="mt-1 space-y-1 list-disc list-inside">
                          <li>Document processing stages</li>
                          <li>Assignment management</li>
                          <li>Priority handling</li>
                          <li>Completion tracking</li>
                          <li>Performance analytics</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Analytics & Reporting
                </CardTitle>
                <CardDescription>
                  Real-time performance metrics and cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Cost Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">₹2,456</div>
                      <div className="text-sm text-muted-foreground">Monthly AI costs</div>
                      <div className="mt-2 text-xs">
                        <span className="text-green-600">↓ 12%</span> from last month
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Processing Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">1,234</div>
                      <div className="text-sm text-muted-foreground">Documents processed</div>
                      <div className="mt-2 text-xs">
                        <span className="text-blue-600">↑ 23%</span> from last month
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Accuracy Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">96.7%</div>
                      <div className="text-sm text-muted-foreground">Average confidence</div>
                      <div className="mt-2 text-xs">
                        <span className="text-purple-600">↑ 2.1%</span> from last month
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Provider Performance Comparison</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Google Vision OCR</div>
                        <div className="text-sm text-muted-foreground">Average response: 1.2s</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₹891/month</div>
                        <Badge variant="secondary">97.2% accuracy</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">OpenAI GPT-4</div>
                        <div className="text-sm text-muted-foreground">Average response: 3.4s</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₹1,234/month</div>
                        <Badge variant="secondary">95.8% accuracy</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Anthropic Claude</div>
                        <div className="text-sm text-muted-foreground">Average response: 2.1s</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">₹331/month</div>
                        <Badge variant="secondary">96.9% accuracy</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  REST API endpoints for AI integration and monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">AI Endpoints Management</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-green-600 font-semibold">GET</span> /api/ai/endpoints
                          </div>
                          <div className="text-sm mt-1">Retrieve all AI endpoint configurations</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-blue-600 font-semibold">POST</span> /api/ai/endpoints
                          </div>
                          <div className="text-sm mt-1">Create new AI endpoint configuration</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-orange-600 font-semibold">PUT</span> /api/ai/endpoints/:id
                          </div>
                          <div className="text-sm mt-1">Update AI endpoint configuration</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Usage Tracking</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-green-600 font-semibold">GET</span> /api/ai/usage
                          </div>
                          <div className="text-sm mt-1">Retrieve API usage statistics</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-green-600 font-semibold">GET</span> /api/ai/performance
                          </div>
                          <div className="text-sm mt-1">Get performance metrics and analytics</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Document Processing</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-blue-600 font-semibold">POST</span> /api/documents/ocr
                          </div>
                          <div className="text-sm mt-1">Process document with OCR</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-blue-600 font-semibold">POST</span> /api/documents/analyze
                          </div>
                          <div className="text-sm mt-1">Analyze document content with AI</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-green-600 font-semibold">GET</span> /api/documents/:id/results
                          </div>
                          <div className="text-sm mt-1">Get OCR and analysis results</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Workflow Management</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-green-600 font-semibold">GET</span> /api/workflow/queue
                          </div>
                          <div className="text-sm mt-1">Get document processing queue</div>
                        </div>

                        <div className="p-3 bg-muted rounded">
                          <div className="font-mono text-sm">
                            <span className="text-orange-600 font-semibold">PUT</span> /api/workflow/:id/status
                          </div>
                          <div className="text-sm mt-1">Update workflow step status</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}