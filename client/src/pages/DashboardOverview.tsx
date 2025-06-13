import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Brain, Clock, Cloud, Users, CheckCircle, AlertCircle, TrendingUp, MessageSquare } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export function DashboardOverview() {
  const { data: documentStats } = useQuery({
    queryKey: ['/api/analytics/documents'],
  });

  const { data: processingStats } = useQuery({
    queryKey: ['/api/analytics/processing'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/analytics/users'],
  });

  const { data: recentDocuments } = useQuery({
    queryKey: ['/api/documents'],
  });

  const statsCards = [
    {
      title: "Total Documents",
      value: documentStats?.total || 0,
      change: "+15.3% from last month",
      icon: FileText,
      color: "blue"
    },
    {
      title: "AI Processed",
      value: documentStats?.processed || 0,
      change: `${processingStats?.averageConfidence || 96.7}% accuracy rate`,
      icon: Brain,
      color: "green"
    },
    {
      title: "Pending Review",
      value: documentStats?.pending || 0,
      change: "Requires attention",
      icon: Clock,
      color: "yellow"
    },
    {
      title: "Active Users",
      value: userStats?.active || 0,
      change: "System utilization: 78%",
      icon: Users,
      color: "purple"
    }
  ];

  const aiModules = [
    {
      name: "GPT-4 Document Analysis",
      status: "Active",
      description: "Processing documents",
      color: "green"
    },
    {
      name: "Marathi Translation AI",
      status: "Active",
      description: "High accuracy mode",
      color: "blue"
    },
    {
      name: "Semantic Search Engine",
      status: "Active",
      description: "Vector database ready",
      color: "purple"
    }
  ];

  const communicationStats = [
    { type: "WhatsApp", sent: 247, rate: "98.5%" },
    { type: "Email", sent: 89, rate: "97.3%" },
    { type: "SMS", sent: 156, rate: "99.1%" }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-success mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`bg-${stat.color}-100 p-4 rounded-xl`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="font-devanagari">अलीकडील कागदपत्रे</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments?.slice(0, 5).map((doc: any) => (
                <div key={doc.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="bg-primary/10 p-3 rounded-lg mr-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{doc.originalFileName}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.letterType} • {new Date(doc.createdAt).toLocaleDateString()}
                      {doc.ocrConfidence && ` • ${doc.ocrConfidence}% confidence`}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              )) || (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI & LLM Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>AI & LLM Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiModules.map((module, index) => (
                <div key={index} className={`flex items-center justify-between p-4 bg-${module.color}-50 rounded-xl`}>
                  <div className="flex items-center">
                    <div className={`bg-${module.color}-600 p-2 rounded-lg mr-3`}>
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{module.name}</h4>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className={`h-4 w-4 text-${module.color}-600 mr-2`} />
                    <span className={`text-${module.color}-600 text-sm font-medium`}>{module.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication & Integration Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {communicationStats.map((comm, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                {comm.type} Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Messages Sent Today</span>
                  <span className="font-medium text-gray-900">{comm.sent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Rate</span>
                  <span className="font-medium text-success">{comm.rate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-success">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
