import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { FileText, Eye, Download, Search, Filter, Calendar } from "lucide-react";
import { DOCUMENT_STATUSES } from "@/lib/constants";

interface DocumentRegisterProps {
  type: 'inward-register' | 'outward-register' | 'ai-ocr';
}

export default function DocumentRegister({ type }: DocumentRegisterProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents', { search, status: statusFilter, letterType: typeFilter }],
  });

  const getTitle = () => {
    switch (type) {
      case 'inward-register':
        return 'आवक पत्र रजिस्टर (Inward Letter Register)';
      case 'outward-register':
        return 'जावक पत्र रजिस्टर (Outward Letter Register)';
      case 'ai-ocr':
        return 'AI OCR Processing Dashboard';
      default:
        return 'Document Register';
    }
  };

  const filteredDocuments = documents?.filter((doc: any) => {
    const matchesSearch = !search || 
      doc.originalFileName.toLowerCase().includes(search.toLowerCase()) ||
      doc.subject?.toLowerCase().includes(search.toLowerCase()) ||
      doc.topic?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesType = !typeFilter || doc.letterType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-devanagari">{getTitle()}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {Object.entries(DOCUMENT_STATUSES).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="गोपनीय">गोपनीय</SelectItem>
                <SelectItem value="शासन पत्र">शासन पत्र</SelectItem>
                <SelectItem value="तक्रार">तक्रार</SelectItem>
                <SelectItem value="अर्ज">अर्ज</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {type === 'ai-ocr' && <TableHead>AI Confidence</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No documents found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocuments?.map((doc: any) => (
                    <TableRow key={doc.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{doc.originalFileName}</div>
                            <div className="text-sm text-gray-500">
                              {doc.serialNumber} • {doc.author}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-devanagari">{doc.letterType || doc.subject || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        {doc.letterDate ? new Date(doc.letterDate).toLocaleDateString() : 
                         new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      {type === 'ai-ocr' && (
                        <TableCell>
                          {doc.ocrConfidence ? (
                            <span className="text-sm font-medium">
                              {parseFloat(doc.ocrConfidence).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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
