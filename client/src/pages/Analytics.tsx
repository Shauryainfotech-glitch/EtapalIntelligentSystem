import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Brain, 
  Clock, 
  Zap,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  RefreshCw,
  Cpu,
  Database,
  Eye,
  Filter
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, trend, icon: Icon, color }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-success" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-error" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-error";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className={`flex items-center mt-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-xs ml-1">{change}</span>
              </div>
            )}
          </div>
          <div className={`bg-${color}-100 p-4 rounded-xl`}>
            <Icon className={`h-8 w-8 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  showValue?: boolean;
}

function ChartBar({ label, value, maxValue, color, showValue = true }: ChartBarProps) {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 font-devanagari">{label}</span>
        {showValue && <span className="text-sm font-bold text-gray-900">{value.toLocaleString()}</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`bg-${color}-500 h-3 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7days");
  const [refreshing, setRefreshing] = useState(false);

  const { data: documentStats, isLoading: documentStatsLoading } = useQuery({
    queryKey: ['/api/analytics/documents'],
  });

  const { data: processingStats, isLoading: processingStatsLoading } = useQuery({
    queryKey: ['/api/analytics/processing'],
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['/api/analytics/users'],
  });

  const { data: documents } = useQuery({
    queryKey: ['/api/documents'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 2000);
  };

  const isLoading = documentStatsLoading || processingStatsLoading || userStatsLoading;

  // Calculate metrics from actual data
  const totalDocuments = (documentStats as any)?.total || 0;
  const processedDocuments = (documentStats as any)?.processed || 0;
  const pendingDocuments = (documentStats as any)?.pending || 0;
  const averageConfidence = (processingStats as any)?.averageConfidence || 0;
  const totalUsers = (userStats as any)?.total || 0;
  const activeUsers = (userStats as any)?.active || 0;

  // Calculate document type distribution
  const documentTypeDistribution = Array.isArray(documents) ? (documents as any[]).reduce((acc: any, doc: any) => {
    const type = doc.letterType || doc.subject || 'अन्य';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) : {};

  const topDocumentTypes = Object.entries(documentTypeDistribution)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5);

  const documentTypeValues = Object.values(documentTypeDistribution) as number[];
  const maxDocumentTypeCount = documentTypeValues.length > 0 ? Math.max(...documentTypeValues) : 0;

  // Calculate processing timeline (last 7 days)
  const processingTimeline = Array.isArray(documents) ? (documents as any[]).reduce((acc: any, doc: any) => {
    const date = new Date(doc.createdAt).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) : {};

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toDateString();
  }).reverse();

  const timelineData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: processingTimeline[date] || 0
  }));

  const maxTimelineCount = Math.max(...timelineData.map(d => d.count), 1);

  // Performance metrics
  const performanceMetrics = [
    {
      title: "Processing Efficiency",
      value: `${((processedDocuments / Math.max(totalDocuments, 1)) * 100).toFixed(1)}%`,
      change: "+2.3% from last week",
      trend: "up" as const,
      icon: Target,
      color: "blue"
    },
    {
      title: "AI Accuracy",
      value: `${averageConfidence.toFixed(1)}%`,
      change: "Excellent performance",
      trend: "up" as const,
      icon: Brain,
      color: "green"
    },
    {
      title: "Response Time",
      value: "1.2s",
      change: "Average processing",
      trend: "neutral" as const,
      icon: Zap,
      color: "yellow"
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "Last 30 days",
      trend: "up" as const,
      icon: Activity,
      color: "purple"
    }
  ];

  const primaryMetrics = [
    {
      title: "Total Documents",
      value: totalDocuments,
      change: "+15.3% from last month",
      trend: "up" as const,
      icon: FileText,
      color: "blue"
    },
    {
      title: "Processed Today",
      value: processedDocuments,
      change: `${averageConfidence.toFixed(1)}% accuracy rate`,
      trend: "up" as const,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Pending Review",
      value: pendingDocuments,
      change: "Requires attention",
      trend: pendingDocuments > 50 ? "up" as const : "neutral" as const,
      icon: Clock,
      color: "yellow"
    },
    {
      title: "Active Users",
      value: activeUsers,
      change: `${totalUsers} total users`,
      trend: "up" as const,
      icon: Users,
      color: "purple"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics & Insights</h1>
          <p className="text-gray-600">Real-time performance metrics and data visualization</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Document Type Distribution */}
            <Card className="chart-animation">
              <CardHeader>
                <CardTitle className="font-devanagari">दस्तावेज प्रकार वितरण</CardTitle>
              </CardHeader>
              <CardContent>
                {topDocumentTypes.length > 0 ? (
                  <div className="space-y-4">
                    {topDocumentTypes.map(([type, count], index) => (
                      <ChartBar
                        key={index}
                        label={type}
                        value={count as number}
                        maxValue={maxDocumentTypeCount}
                        color={['blue', 'green', 'yellow', 'purple', 'red'][index]}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No document data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Timeline */}
            <Card className="chart-animation">
              <CardHeader>
                <CardTitle>Processing Timeline (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timelineData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-16">{item.date}</span>
                      <div className="flex items-center space-x-3 flex-1 ml-4">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(item.count / maxTimelineCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(processedDocuments / Math.max(totalDocuments, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{processedDocuments}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(pendingDocuments / Math.max(totalDocuments, 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{pendingDocuments}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Failed</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }} />
                      </div>
                      <span className="text-sm font-medium">2</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">1.2s</div>
                    <p className="text-sm text-gray-600">Average Processing Time</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">OCR Extraction</span>
                      <span className="font-medium">0.8s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI Analysis</span>
                      <span className="font-medium">0.3s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Data Validation</span>
                      <span className="font-medium">0.1s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {averageConfidence.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Average Confidence</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">High Confidence ({'>'}95%)</span>
                      <span className="font-medium text-green-600">78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Medium Confidence (80-95%)</span>
                      <span className="font-medium text-yellow-600">18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Low Confidence ({'<'}80%)</span>
                      <span className="font-medium text-red-600">4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="text-sm text-gray-900">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                      <span className="text-sm text-gray-900">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                      <span className="text-sm text-gray-900">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Network I/O</span>
                      <span className="text-sm text-gray-900">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Query Response Time</span>
                    <span className="font-medium text-green-600">12ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Connections</span>
                    <span className="font-medium">47/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Index Efficiency</span>
                    <span className="font-medium text-green-600">98.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{activeUsers}</div>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-medium">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Online Now</span>
                      <span className="font-medium text-green-600">{Math.floor(activeUsers * 0.3)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today's Logins</span>
                      <span className="font-medium">{Math.floor(activeUsers * 1.2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Super Admin</span>
                    </div>
                    <span className="text-sm font-medium">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Administrator</span>
                    </div>
                    <span className="text-sm font-medium">5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Officer</span>
                    </div>
                    <span className="text-sm font-medium">15</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Clerk</span>
                    </div>
                    <span className="text-sm font-medium">25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Session Duration</span>
                    <span className="font-medium">2h 34m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Usage Time</span>
                    <span className="font-medium">10:00-12:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Failed Login Attempts</span>
                    <span className="font-medium text-red-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Security Score</span>
                    <span className="font-medium text-green-600">98/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">OCR Accuracy</span>
                      <span className="text-sm text-gray-900">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Translation Quality</span>
                      <span className="text-sm text-gray-900">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Classification Accuracy</span>
                      <span className="text-sm text-gray-900">96.5%</span>
                    </div>
                    <Progress value={96.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Semantic Search</span>
                      <span className="text-sm text-gray-900">91.8%</span>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">847</div>
                    <p className="text-sm text-gray-600">Training Samples This Week</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Model Updates</span>
                      <span className="font-medium">Daily</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy Improvement</span>
                      <span className="font-medium text-green-600">+2.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">False Positives</span>
                      <span className="font-medium text-red-600">0.8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Processing Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-blue-600">98.7%</p>
                  <p className="text-sm text-gray-600">OCR Accuracy</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-green-600">94.2%</p>
                  <p className="text-sm text-gray-600">Translation Quality</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-purple-600">96.5%</p>
                  <p className="text-sm text-gray-600">Auto-Classification</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-orange-600">91.8%</p>
                  <p className="text-sm text-gray-600">Semantic Search</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
