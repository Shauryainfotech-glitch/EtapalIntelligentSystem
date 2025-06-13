import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/Header";
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle, 
  MailOpen,
  Trash2,
  Settings,
  Filter,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  userId: string;
  title: string;
  titleMarathi: string;
  message: string;
  messageMarathi: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: string;
  relatedEntityId: string;
  relatedEntityType: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl: string;
  metadata: any;
  expiresAt: string;
  createdAt: string;
}

const NOTIFICATION_TYPES = [
  { value: "info", label: "माहिती (Info)", icon: Info, color: "blue" },
  { value: "success", label: "यशस्वी (Success)", icon: CheckCircle, color: "green" },
  { value: "warning", label: "चेतावणी (Warning)", icon: AlertTriangle, color: "yellow" },
  { value: "error", label: "त्रुटी (Error)", icon: XCircle, color: "red" }
];

const NOTIFICATION_CATEGORIES = [
  { value: "document", label: "दस्तावेज (Document)" },
  { value: "workflow", label: "कार्यप्रवाह (Workflow)" },
  { value: "ai_processing", label: "AI प्रक्रिया (AI Processing)" },
  { value: "system", label: "सिस्टम (System)" },
  { value: "user", label: "वापरकर्ता (User)" }
];

const PRIORITY_LEVELS = [
  { value: "urgent", label: "तातडीचे (Urgent)", color: "red" },
  { value: "high", label: "उच्च (High)", color: "orange" },
  { value: "medium", label: "मध्यम (Medium)", color: "blue" },
  { value: "low", label: "कमी (Low)", color: "gray" }
];

export default function Notifications() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/notifications', { 
      type: selectedType, 
      category: selectedCategory,
      priority: selectedPriority,
      isRead: showUnreadOnly ? false : undefined
    }],
    queryFn: ({ queryKey }) => {
      const [url, params] = queryKey;
      const searchParams = new URLSearchParams();
      if (params.type) searchParams.append('type', params.type);
      if (params.category) searchParams.append('category', params.category);
      if (params.priority) searchParams.append('priority', params.priority);
      if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
      return apiRequest(`${url}?${searchParams}`);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('/api/notifications/mark-all-read', { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "यशस्वी (Success)",
        description: "सर्व सूचना वाचल्या म्हणून चिन्हांकित केल्या (All notifications marked as read)",
      });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => 
      apiRequest(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  const getTypeIcon = (type: string) => {
    const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Info;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = NOTIFICATION_TYPES.find(t => t.value === type);
    return typeConfig ? typeConfig.color : "blue";
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITY_LEVELS.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : "gray";
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: mr 
      });
    } catch {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    }
  };

  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
  const readNotifications = notifications.filter((n: Notification) => n.isRead);

  return (
    <div className="space-y-6">
      <Header 
        title="सूचना (Notifications)" 
        subtitle="सिस्टम अलर्ट आणि अपडेट्स (System Alerts & Updates)"
      />

      {/* Stats and Controls */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BellRing className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-gray-600">न वाचलेल्या (Unread)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-gray-600">एकूण (Total)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter((n: Notification) => n.priority === 'urgent' || n.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-600">उच्च प्राधान्य (High Priority)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col gap-2">
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              रिफ्रेश (Refresh)
            </Button>
            {unreadCount > 0 && (
              <Button 
                onClick={() => markAllAsReadMutation.mutate()}
                size="sm"
                className="w-full"
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                सर्व वाचले (Mark All Read)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium mb-2">प्रकार (Type)</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="सर्व प्रकार (All Types)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व प्रकार (All Types)</SelectItem>
                  {NOTIFICATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium mb-2">श्रेणी (Category)</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="सर्व श्रेणी (All Categories)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व श्रेणी (All Categories)</SelectItem>
                  {NOTIFICATION_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium mb-2">प्राधान्य (Priority)</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="सर्व प्राधान्य (All Priorities)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">सर्व प्राधान्य (All Priorities)</SelectItem>
                  {PRIORITY_LEVELS.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showUnreadOnly ? "सर्व दाखवा (Show All)" : "न वाचलेले (Unread Only)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">सूचना लोड करत आहे... (Loading notifications...)</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">सूचना सापडल्या नाहीत (No Notifications Found)</h3>
              <p className="mt-1 text-gray-500">तुमच्यासाठी कोणत्याही सूचना नाहीत (No notifications available for you)</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  न वाचलेल्या सूचना (Unread Notifications) ({unreadNotifications.length})
                </h3>
                {unreadNotifications.map((notification: Notification) => {
                  const TypeIcon = getTypeIcon(notification.type);
                  return (
                    <Card 
                      key={notification.id} 
                      className={`border-l-4 border-l-${getTypeColor(notification.type)}-500 hover:shadow-md transition-shadow cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <TypeIcon className={`h-5 w-5 text-${getTypeColor(notification.type)}-500 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {notification.titleMarathi || notification.title}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs bg-${getPriorityColor(notification.priority)}-100 text-${getPriorityColor(notification.priority)}-800`}
                                >
                                  {PRIORITY_LEVELS.find(p => p.value === notification.priority)?.label || notification.priority}
                                </Badge>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.messageMarathi || notification.message}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {NOTIFICATION_CATEGORIES.find(c => c.value === notification.category)?.label || notification.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  वाचलेल्या सूचना (Read Notifications) ({readNotifications.length})
                </h3>
                {readNotifications.map((notification: Notification) => {
                  const TypeIcon = getTypeIcon(notification.type);
                  return (
                    <Card 
                      key={notification.id} 
                      className="opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <TypeIcon className={`h-5 w-5 text-${getTypeColor(notification.type)}-500 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {notification.titleMarathi || notification.title}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs bg-${getPriorityColor(notification.priority)}-100 text-${getPriorityColor(notification.priority)}-800`}
                                >
                                  {PRIORITY_LEVELS.find(p => p.value === notification.priority)?.label || notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.messageMarathi || notification.message}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {NOTIFICATION_CATEGORIES.find(c => c.value === notification.category)?.label || notification.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}