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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FIELD_TYPES } from "@/lib/constants";
import { Plus, Edit, Trash2, Settings, Database, CheckCircle, AlertCircle } from "lucide-react";

const fieldSchema = z.object({
  fieldName: z.string().min(1, "Field name is required"),
  fieldLabel: z.string().min(1, "Field label is required"),
  fieldType: z.string().min(1, "Field type is required"),
  isRequired: z.boolean().default(false),
  validationRules: z.object({}).optional(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  order: z.number().default(0),
});

type FieldFormData = z.infer<typeof fieldSchema>;

export default function FieldMaster() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fieldConfigurations, isLoading } = useQuery({
    queryKey: ['/api/field-configurations'],
  });

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      fieldName: "",
      fieldLabel: "",
      fieldType: "",
      isRequired: false,
      validationRules: {},
      options: [],
      defaultValue: "",
      order: 0,
    },
  });

  const createFieldMutation = useMutation({
    mutationFn: async (data: FieldFormData) => {
      const response = await apiRequest('POST', '/api/field-configurations', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Field created successfully",
        description: "The new field configuration has been added.",
      });
      form.reset();
      setIsDialogOpen(false);
      setEditingField(null);
      queryClient.invalidateQueries({ queryKey: ['/api/field-configurations'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create field",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FieldFormData) => {
    createFieldMutation.mutate(data);
  };

  const handleEdit = (field: any) => {
    setEditingField(field);
    form.reset({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      defaultValue: field.defaultValue || "",
      order: field.order,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
    form.reset();
  };

  const stats = [
    { title: "Form Fields", value: fieldConfigurations?.length || 0, icon: Settings, color: "blue" },
    { title: "Required Fields", value: fieldConfigurations?.filter((f: any) => f.isRequired).length || 0, icon: AlertCircle, color: "red" },
    { title: "Active Fields", value: fieldConfigurations?.filter((f: any) => f.isActive).length || 0, icon: CheckCircle, color: "green" },
    { title: "Field Types", value: new Set(fieldConfigurations?.map((f: any) => f.fieldType)).size || 0, icon: Database, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Field Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Field Configuration Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Field
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? "Edit Field Configuration" : "Create New Field Configuration"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fieldName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., recipientName" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fieldLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Label</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Recipient Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fieldType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FIELD_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
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
                        name="defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional default value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createFieldMutation.isPending}>
                        {createFieldMutation.isPending ? "Saving..." : "Save Field"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading field configurations...
                    </TableCell>
                  </TableRow>
                ) : fieldConfigurations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No field configurations found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  fieldConfigurations?.map((field: any) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{field.fieldName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-devanagari">{field.fieldLabel}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {FIELD_TYPES.find(t => t.value === field.fieldType)?.label || field.fieldType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.isRequired ? (
                          <Badge className="bg-red-100 text-red-800">Required</Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {field.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
