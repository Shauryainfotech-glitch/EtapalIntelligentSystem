import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { COMMUNICATION_TYPES } from "@/lib/constants";
import { 
  MessageSquare,
  Send,
  Users,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  MessageCircle,
  FileText,
  Eye
} from "lucide-react";

const messageSchema = z.object({
  type: z.string().min(1, "Communication type is required"),
  recipient: z.string().min(1, "Recipient is required"),
  message: z.string().min(1, "Message is required"),
  documentId: z.string().optional(),
});

type MessageFormData = z.infer<typeof messageSchema>;

export default function Communications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("whatsapp");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communicationLogs, isLoading } = useQuery({
    queryKey: ['/api/communications'],
  });

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      type: "whatsapp",
      recipient: "",
      message: "",
      documentId: "",
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const response = await apiRequest('POST', '/api/communications/send', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent successfully",
        description: "Your message has been delivered.",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const communicationStats = [
    {
      title: "WhatsApp Messages",
      value: communicationLogs?.filter((log: any) => log.type === 'whatsapp').length || 0,
      change: "+12% today",
      icon: MessageCircle,
      color: "green"
    },
    {
      title: "Emails Sent",
      value: communicationLogs?.filter((log: any) => log.type === 'email').length || 0,
      change: "+8% today",
      icon: Mail,
      color: "blue"
    },
    {
      title: "SMS Messages",
      value: communicationLogs?.filter((log: any) => log.type === 'sms').length || 0,
      change: "+5% today",
      icon: Phone,
      color: "purple"
    },
    {
      title: "Delivery Rate",
      value: "98.5%",
      change: "Excellent",
      icon: CheckCircle,
      color: "green"
    }
  ];

  const messageTemplates = [
    {
      id: "document_received",
      title: "Document Received",
      message: "तुमचे कागदपत्र प्राप्त झाले आहे. प्रक्रिया सुरू आहे.",
      category: "Status Update"
    },
    {
      id: "processing_complete",
      title: "Processing Complete",
      message: "तुमच्या कागदपत्राची प्रक्रिया पूर्ण झाली आहे.",
      category: "Status Update"
    },
    {
      id: "additional_info_required",
      title: "Additional Info Required",
      message: "अधिक माहिती आवश्यक आहे. कृपया संपर्क साधा.",
      category: "Action Required"
    },
    {
      id: "appointment_reminder",
      title: "Appointment Reminder",
      message: "तुमची नियुक्ती उद्या आहे. कृपया वेळेवर उपस्थित रहा.",
      category: "Reminder"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Communication Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communicationStats.map((stat, index) => (
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

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Send New Message
                    </CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Bulk Send
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Message Send</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-600">
                            Send messages to multiple recipients at once
                          </p>
                          <Button className="w-full">Upload Recipients</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Communication Type</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedType(value);
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select communication type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(COMMUNICATION_TYPES).map(([key, type]) => (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center">
                                      <i className={`${type.icon} text-${type.color}-600 mr-2`}></i>
                                      {type.label}
                                    </div>
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
                        name="recipient"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {selectedType === 'whatsapp' ? 'Phone Number' :
                               selectedType === 'email' ? 'Email Address' :
                               'Phone Number'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={
                                  selectedType === 'whatsapp' ? '+91 98765 43210' :
                                  selectedType === 'email' ? 'user@example.com' :
                                  '+91 98765 43210'
                                }
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={6}
                                placeholder="Type your message here... / येथे आपला संदेश टाइप करा..."
                                className="font-devanagari"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                          Preview
                        </Button>
                        <Button type="submit" disabled={sendMessageMutation.isPending}>
                          <Send className="h-4 w-4 mr-2" />
                          {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Integration Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">WhatsApp Business</p>
                        <p className="text-sm text-gray-600">Connected</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Email SMTP</p>
                        <p className="text-sm text-gray-600">Gmail Business</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">SMS Gateway</p>
                        <p className="text-sm text-gray-600">Twilio</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {messageTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{template.title}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 font-devanagari">
                        {template.message}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            form.setValue('message', template.message);
                            toast({
                              title: "Template applied",
                              description: "Message field has been updated with the template.",
                            });
                          }}
                        >
                          Use Template
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading messages...
                        </TableCell>
                      </TableRow>
                    ) : communicationLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No messages found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      communicationLogs?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center">
                              {log.type === 'whatsapp' && <MessageCircle className="h-4 w-4 text-green-600 mr-2" />}
                              {log.type === 'email' && <Mail className="h-4 w-4 text-blue-600 mr-2" />}
                              {log.type === 'sms' && <Phone className="h-4 w-4 text-purple-600 mr-2" />}
                              <span className="capitalize">{log.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{log.recipient}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate font-devanagari">
                              {log.message}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(log.status)}
                              <Badge className={`ml-2 ${getStatusColor(log.status)}`}>
                                {log.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(log.createdAt).toLocaleString()}
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

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-Notifications</label>
                    <p className="text-xs text-gray-500">Send automatic status updates</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Delivery Reports</label>
                    <p className="text-xs text-gray-500">Track message delivery status</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Batch Processing</label>
                    <p className="text-xs text-gray-500">Process multiple messages together</p>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Business API Key
                  </label>
                  <Input type="password" placeholder="••••••••••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS Gateway Provider
                  </label>
                  <Select defaultValue="twilio">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="aws">AWS SNS</SelectItem>
                      <SelectItem value="msg91">MSG91</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email SMTP Server
                  </label>
                  <Input defaultValue="smtp.gmail.com" />
                </div>
                <Button className="w-full">
                  Test Connections
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
