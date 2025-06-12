import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { USER_ROLES } from "@/lib/constants";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Crown, 
  ShieldX, 
  UserCheck, 
  User, 
  Settings,
  Lock,
  Key,
  Eye,
  FileText,
  Clock,
  AlertTriangle
} from "lucide-react";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  displayName: z.string().min(1, "Display name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type RoleFormData = z.infer<typeof roleSchema>;

const AVAILABLE_PERMISSIONS = [
  { id: "create_documents", label: "Create Documents", category: "Documents" },
  { id: "read_documents", label: "Read Documents", category: "Documents" },
  { id: "update_documents", label: "Update Documents", category: "Documents" },
  { id: "delete_documents", label: "Delete Documents", category: "Documents" },
  { id: "manage_users", label: "Manage Users", category: "User Management" },
  { id: "manage_roles", label: "Manage Roles", category: "User Management" },
  { id: "view_analytics", label: "View Analytics", category: "Reports" },
  { id: "export_data", label: "Export Data", category: "Reports" },
  { id: "manage_communications", label: "Manage Communications", category: "Communications" },
  { id: "manage_cloud_storage", label: "Manage Cloud Storage", category: "Storage" },
  { id: "manage_field_master", label: "Manage Field Master", category: "Configuration" },
  { id: "view_audit_logs", label: "View Audit Logs", category: "Security" },
];

export default function SecurityRBAC() {
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/roles'],
  });

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['/api/audit-logs'],
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/analytics/users'],
  });

  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      permissions: [],
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await apiRequest('POST', '/api/roles', {
        ...data,
        permissions: selectedPermissions,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role created successfully",
        description: "The new role has been added to the system.",
      });
      roleForm.reset();
      setSelectedPermissions([]);
      setIsRoleDialogOpen(false);
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitRole = (data: RoleFormData) => {
    createRoleMutation.mutate(data);
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    roleForm.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
    roleForm.reset();
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return Crown;
      case 'admin':
        return ShieldX;
      case 'officer':
        return UserCheck;
      default:
        return User;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'red';
      case 'admin':
        return 'blue';
      case 'officer':
        return 'green';
      default:
        return 'yellow';
    }
  };

  const securityMetrics = [
    {
      title: "Total Users",
      value: userStats?.total || 0,
      icon: Users,
      color: "blue"
    },
    {
      title: "Active Sessions",
      value: userStats?.active || 0,
      icon: UserCheck,
      color: "green"
    },
    {
      title: "Failed Logins Today",
      value: 3,
      icon: AlertTriangle,
      color: "red"
    },
    {
      title: "Security Score",
      value: "98/100",
      icon: Shield,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`bg-${metric.color}-100 p-3 rounded-xl`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Role-Based Access Control</CardTitle>
                <Dialog open={isRoleDialogOpen} onOpenChange={handleCloseRoleDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsRoleDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRole ? "Edit Role" : "Create New Role"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...roleForm}>
                      <form onSubmit={roleForm.handleSubmit(onSubmitRole)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={roleForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., senior_officer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={roleForm.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Senior Officer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={roleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Brief description of the role..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div>
                          <FormLabel>Permissions</FormLabel>
                          <div className="mt-2 space-y-4">
                            {Object.entries(
                              AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                                if (!acc[perm.category]) acc[perm.category] = [];
                                acc[perm.category].push(perm);
                                return acc;
                              }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                            ).map(([category, perms]) => (
                              <div key={category} className="border rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {perms.map((perm) => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={perm.id}
                                        checked={selectedPermissions.includes(perm.id)}
                                        onChange={() => togglePermission(perm.id)}
                                        className="rounded border-gray-300"
                                      />
                                      <label htmlFor={perm.id} className="text-sm text-gray-700">
                                        {perm.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <Button type="button" variant="outline" onClick={handleCloseRoleDialog}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createRoleMutation.isPending}>
                            {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rolesLoading ? (
                  <div className="text-center py-8">Loading roles...</div>
                ) : roles?.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No roles found</p>
                  </div>
                ) : (
                  roles?.map((role: any) => {
                    const RoleIcon = getRoleIcon(role.name);
                    const color = getRoleColor(role.name);
                    
                    return (
                      <div key={role.id} className={`flex items-center justify-between p-4 bg-${color}-50 rounded-xl border border-${color}-100`}>
                        <div className="flex items-center">
                          <div className={`bg-${color}-600 p-3 rounded-lg mr-4`}>
                            <RoleIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{role.displayName}</h4>
                            <p className="text-sm text-gray-600">{role.description}</p>
                            <div className="flex space-x-2 mt-2">
                              {role.permissions?.slice(0, 3).map((perm: string) => (
                                <Badge key={perm} className={`bg-${color}-100 text-${color}-800 text-xs`}>
                                  {AVAILABLE_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                                </Badge>
                              ))}
                              {role.permissions?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Roles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.label}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{permission.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          System permission for {permission.label.toLowerCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {roles?.filter((role: any) => 
                              role.permissions?.includes(permission.id)
                            ).map((role: any) => (
                              <Badge key={role.id} variant="outline" className="text-xs">
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                    <p className="text-xs text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password Complexity</label>
                    <p className="text-xs text-gray-500">Enforce strong passwords</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                    <p className="text-xs text-gray-500">Auto-logout inactive users</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">IP Whitelist</label>
                    <p className="text-xs text-gray-500">Restrict access by IP</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Document Encryption</label>
                    <p className="text-xs text-gray-500">AES-256 encryption</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Audit Logging</label>
                    <p className="text-xs text-gray-500">Track all user actions</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Retention</label>
                    <p className="text-xs text-gray-500">Auto-delete old logs</p>
                  </div>
                  <Select defaultValue="365">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading audit logs...
                        </TableCell>
                      </TableRow>
                    ) : auditLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No audit logs found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogs?.slice(0, 10).map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              {log.userId || 'System'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.entityType}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.ipAddress || 'N/A'}
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
      </Tabs>
    </div>
  );
}
