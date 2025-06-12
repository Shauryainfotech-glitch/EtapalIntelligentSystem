import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Cloud, 
  HardDrive, 
  Download, 
  Upload, 
  Shield, 
  Settings, 
  FileText, 
  Database, 
  FolderSync, 
  Lock,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Archive,
  Search,
  Filter
} from "lucide-react";

export default function CloudStorage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cloudFiles, isLoading } = useQuery({
    queryKey: ['/api/cloud-storage'],
  });

  const { data: documentStats } = useQuery({
    queryKey: ['/api/analytics/documents'],
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cloud-storage/sync', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "FolderSync initiated",
        description: "Cloud storage sync has been started.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cloud-storage'] });
    },
    onError: (error) => {
      toast({
        title: "FolderSync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cloud-storage/backup', {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Backup started",
        description: "Manual backup has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Backup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const storageStats = [
    {
      title: "Total Storage",
      value: "2.4 TB",
      subtitle: "Available capacity",
      icon: HardDrive,
      color: "blue"
    },
    {
      title: "Used Storage",
      value: "1.8 TB",
      subtitle: "75% utilized",
      icon: Database,
      color: "green"
    },
    {
      title: "Total Files",
      value: documentStats?.total || 0,
      subtitle: "Documents stored",
      icon: FileText,
      color: "purple"
    },
    {
      title: "FolderSync Status",
      value: "Active",
      subtitle: "Real-time sync",
      icon: FolderSync,
      color: "green"
    }
  ];

  const storageDistribution = [
    { type: "PDF Documents", size: "1.17 TB", percentage: 65, color: "red" },
    { type: "Images", size: "0.45 TB", percentage: 25, color: "blue" },
    { type: "Database Backups", size: "0.18 TB", percentage: 10, color: "green" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'syncing':
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFiles = cloudFiles?.filter((file: any) => {
    const matchesSearch = !searchTerm || 
      file.originalFileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || file.uploadStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {storageStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Storage Overview</TabsTrigger>
          <TabsTrigger value="files">File Management</TabsTrigger>
          <TabsTrigger value="backup">Backup & FolderSync</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {storageDistribution.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 bg-${item.color}-500 rounded-full mr-3`}></div>
                          <span className="text-sm font-medium text-gray-700">{item.type}</span>
                        </div>
                        <span className="text-sm text-gray-900">{item.size}</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Storage Optimization</h4>
                  <p className="text-sm text-blue-700">
                    Consider archiving old documents to free up space. 
                    Documents older than 2 years can be moved to cold storage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cloudFiles?.slice(0, 6).map((file: any) => (
                    <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center flex-1">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                            {file.originalFileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleDateString()} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(file.uploadStatus)}
                        <Badge className={`ml-2 ${getStatusColor(file.uploadStatus)}`}>
                          {file.uploadStatus}
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>File Management</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="synced">Synced</SelectItem>
                    <SelectItem value="syncing">Syncing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Files Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading files...
                        </TableCell>
                      </TableRow>
                    ) : filteredFiles?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No files found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFiles?.map((file: any) => (
                        <TableRow key={file.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900 max-w-xs truncate">
                                  {file.originalFileName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {file.cloudPath}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{file.mimeType.split('/')[1].toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(file.uploadStatus)}
                              <Badge className={`ml-2 ${getStatusColor(file.uploadStatus)}`}>
                                {file.uploadStatus}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderSync className="h-5 w-5 mr-2" />
                  Backup & FolderSync Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-Backup</p>
                    <p className="text-sm text-gray-600">Daily backups at 2:00 AM</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Real-time FolderSync</p>
                    <p className="text-sm text-gray-600">Continuous synchronization</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Last Backup</p>
                    <p className="text-sm text-gray-600">Today at 2:00 AM</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Success</Badge>
                </div>

                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => syncMutation.mutate()}
                    disabled={syncMutation.isPending}
                  >
                    <FolderSync className="h-4 w-4 mr-2" />
                    {syncMutation.isPending ? "Syncing..." : "Force FolderSync All"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => backupMutation.mutate()}
                    disabled={backupMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {backupMutation.isPending ? "Creating Backup..." : "Backup Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Backup Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Backups</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">99.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Size</span>
                  <span className="font-medium">1.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="font-medium">78%</span>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Backup Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Full Backup</span>
                      <span>Weekly (Sunday 3:00 AM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incremental</span>
                      <span>Daily (2:00 AM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retention</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Storage Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-Backup</label>
                    <p className="text-xs text-gray-500">Automatic daily backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Real-time FolderSync</label>
                    <p className="text-xs text-gray-500">FolderSync files immediately on upload</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retention Policy
                  </label>
                  <Select defaultValue="7years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">Keep for 1 year</SelectItem>
                      <SelectItem value="5years">Keep for 5 years</SelectItem>
                      <SelectItem value="7years">Keep for 7 years</SelectItem>
                      <SelectItem value="forever">Keep forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compression Level
                  </label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (faster upload)</SelectItem>
                      <SelectItem value="medium">Medium (balanced)</SelectItem>
                      <SelectItem value="high">High (slower upload)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Encryption</span>
                  <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Access Control</span>
                  <Badge className="bg-green-100 text-green-800">RBAC Enabled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Audit Logging</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Location</span>
                  <Badge variant="outline">Mumbai, India</Badge>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Cloud Provider</h4>
                  <Select defaultValue="aws">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon Web Services</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                      <SelectItem value="local">Local Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Lock className="h-4 w-4 mr-2" />
                  Configure Encryption Keys
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
