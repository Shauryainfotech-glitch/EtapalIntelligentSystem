import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDocumentSchema, insertRoleSchema, insertFieldConfigurationSchema } from "@shared/schema";
import { processDocumentWithAI, performOCR, generateDocumentSummary } from "./aiServices";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images, PDFs, and documents are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Document routes
  app.post('/api/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate document data
      const documentData = {
        fileName: file.filename,
        originalFileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        uploadedBy: userId,
        ...req.body,
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument(validatedData);

      // Process document with real AI OCR and analysis
      setTimeout(async () => {
        try {
          await storage.updateDocument(document.id, { status: "processing" });
          
          // Read the uploaded file for OCR processing
          const filePath = path.join(uploadDir, document.fileName);
          const fileBuffer = fs.readFileSync(filePath);
          
          // Perform OCR using Google Vision API
          const ocrResult = await performOCR(fileBuffer);
          
          if (ocrResult.text) {
            // Process the OCR text with OpenAI for data extraction
            const aiResults = await processDocumentWithAI(ocrResult.text, document.fileName);
            
            const processedResults = {
              status: "processed",
              ocrConfidence: (ocrResult.confidence * 100).toFixed(2),
              ocrText: ocrResult.text,
              extractedData: aiResults.extractedData,
              aiAnalysis: aiResults.aiAnalysis,
              processedBy: userId,
            };
            
            await storage.updateDocument(document.id, processedResults);
          } else {
            await storage.updateDocument(document.id, { 
              status: "failed",
              ocrText: "OCR processing failed - unable to extract text",
              processedBy: userId,
            });
          }
        } catch (error) {
          console.error("Error processing document with AI:", error);
          await storage.updateDocument(document.id, { 
            status: "failed",
            ocrText: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            processedBy: userId,
          });
        }
      }, 2000);

      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // AI API Endpoint Management Routes
  app.get("/api/ai/endpoints", isAuthenticated, async (req, res) => {
    try {
      const endpoints = await storage.getAiApiEndpoints();
      res.json(endpoints);
    } catch (error) {
      console.error("Error fetching AI endpoints:", error);
      res.status(500).json({ message: "Failed to fetch AI endpoints" });
    }
  });

  app.post("/api/ai/endpoints", isAuthenticated, async (req, res) => {
    try {
      const endpoint = await storage.createAiApiEndpoint(req.body);
      res.json(endpoint);
    } catch (error) {
      console.error("Error creating AI endpoint:", error);
      res.status(500).json({ message: "Failed to create AI endpoint" });
    }
  });

  app.put("/api/ai/endpoints/:id", isAuthenticated, async (req, res) => {
    try {
      const endpoint = await storage.updateAiApiEndpoint(req.params.id, req.body);
      res.json(endpoint);
    } catch (error) {
      console.error("Error updating AI endpoint:", error);
      res.status(500).json({ message: "Failed to update AI endpoint" });
    }
  });

  app.delete("/api/ai/endpoints/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAiApiEndpoint(req.params.id);
      res.json({ message: "AI endpoint deleted successfully" });
    } catch (error) {
      console.error("Error deleting AI endpoint:", error);
      res.status(500).json({ message: "Failed to delete AI endpoint" });
    }
  });

  // AI API Usage and Analytics Routes
  app.get("/api/ai/usage", isAuthenticated, async (req, res) => {
    try {
      const usage = await storage.getAiApiUsage(req.query);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching AI usage:", error);
      res.status(500).json({ message: "Failed to fetch AI usage" });
    }
  });

  app.get("/api/ai/usage/stats", isAuthenticated, async (req, res) => {
    try {
      const { endpointId, startDate, endDate } = req.query;
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;
      
      const stats = await storage.getAiApiUsageStats(endpointId as string, dateRange);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching AI usage stats:", error);
      res.status(500).json({ message: "Failed to fetch AI usage stats" });
    }
  });

  // OCR Results Routes
  app.get("/api/documents/:id/ocr", isAuthenticated, async (req, res) => {
    try {
      const results = await storage.getOcrResults(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching OCR results:", error);
      res.status(500).json({ message: "Failed to fetch OCR results" });
    }
  });

  app.post("/api/documents/:id/ocr", isAuthenticated, async (req, res) => {
    try {
      const result = await storage.createOcrResult({
        documentId: req.params.id,
        ...req.body
      });
      res.json(result);
    } catch (error) {
      console.error("Error creating OCR result:", error);
      res.status(500).json({ message: "Failed to create OCR result" });
    }
  });

  // Document Analysis Routes
  app.get("/api/documents/:id/analysis", isAuthenticated, async (req, res) => {
    try {
      const analyses = await storage.getDocumentAnalysis(req.params.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching document analysis:", error);
      res.status(500).json({ message: "Failed to fetch document analysis" });
    }
  });

  app.post("/api/documents/:id/analysis", isAuthenticated, async (req, res) => {
    try {
      const analysis = await storage.createDocumentAnalysis({
        documentId: req.params.id,
        ...req.body
      });
      res.json(analysis);
    } catch (error) {
      console.error("Error creating document analysis:", error);
      res.status(500).json({ message: "Failed to create document analysis" });
    }
  });

  app.post("/api/analysis/:id/validate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analysis = await storage.validateDocumentAnalysis(req.params.id, userId);
      res.json(analysis);
    } catch (error) {
      console.error("Error validating analysis:", error);
      res.status(500).json({ message: "Failed to validate analysis" });
    }
  });

  // AI Model Performance Routes
  app.get("/api/ai/performance", isAuthenticated, async (req, res) => {
    try {
      const { endpointId, startDate, endDate } = req.query;
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;
      
      const performance = await storage.getAiModelPerformance(endpointId as string, dateRange);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching AI performance:", error);
      res.status(500).json({ message: "Failed to fetch AI performance" });
    }
  });

  // Document Workflow Routes
  app.get("/api/documents/:id/workflow", isAuthenticated, async (req, res) => {
    try {
      const workflow = await storage.getDocumentWorkflow(req.params.id);
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching document workflow:", error);
      res.status(500).json({ message: "Failed to fetch document workflow" });
    }
  });

  app.post("/api/documents/:id/workflow", isAuthenticated, async (req, res) => {
    try {
      const workflow = await storage.createDocumentWorkflow({
        documentId: req.params.id,
        ...req.body
      });
      res.json(workflow);
    } catch (error) {
      console.error("Error creating document workflow:", error);
      res.status(500).json({ message: "Failed to create document workflow" });
    }
  });

  app.put("/api/workflow/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status, ...updates } = req.body;
      const workflow = await storage.updateDocumentWorkflowStatus(req.params.id, status, updates);
      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow status:", error);
      res.status(500).json({ message: "Failed to update workflow status" });
    }
  });

  app.get("/api/workflow/queue", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignedTo = req.query.assignedTo || userId;
      const queue = await storage.getWorkflowQueue(assignedTo as string);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching workflow queue:", error);
      res.status(500).json({ message: "Failed to fetch workflow queue" });
    }
  });

  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const { status, letterType, search } = req.query;
      const filters = { status, letterType, search };
      const documents = await storage.getDocuments(filters);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.put('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = req.body;
      const document = await storage.updateDocument(req.params.id, updates);
      
      // Log audit trail
      await storage.createAuditLog({
        action: "UPDATE_DOCUMENT",
        entityType: "document",
        entityId: req.params.id,
        newValues: updates,
        userId: req.user.claims.sub,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Role management routes
  app.get('/api/roles', isAuthenticated, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post('/api/roles', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      
      await storage.createAuditLog({
        action: "CREATE_ROLE",
        entityType: "role",
        entityId: role.id.toString(),
        newValues: validatedData,
        userId: req.user.claims.sub,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      });
      
      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  // Field configuration routes
  app.get('/api/field-configurations', isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getFieldConfigurations();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching field configurations:", error);
      res.status(500).json({ message: "Failed to fetch field configurations" });
    }
  });

  app.post('/api/field-configurations', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertFieldConfigurationSchema.parse(req.body);
      const config = await storage.createFieldConfiguration(validatedData);
      res.json(config);
    } catch (error) {
      console.error("Error creating field configuration:", error);
      res.status(500).json({ message: "Failed to create field configuration" });
    }
  });

  // Communication routes
  app.get('/api/communications', isAuthenticated, async (req, res) => {
    try {
      const { type } = req.query;
      const logs = await storage.getCommunicationLogs({ type });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching communication logs:", error);
      res.status(500).json({ message: "Failed to fetch communication logs" });
    }
  });

  app.post('/api/communications/send', isAuthenticated, async (req: any, res) => {
    try {
      const { type, recipient, message, documentId } = req.body;
      
      // Create communication log
      const log = await storage.createCommunicationLog({
        type,
        recipient,
        message,
        documentId,
        sentBy: req.user.claims.sub,
        status: "sent", // In real implementation, this would be "pending" until actually sent
      });
      
      // Here you would integrate with actual WhatsApp/Email APIs
      // For now, we'll simulate successful sending
      
      res.json(log);
    } catch (error) {
      console.error("Error sending communication:", error);
      res.status(500).json({ message: "Failed to send communication" });
    }
  });

  // AI Analysis endpoint
  app.post("/api/ai/analyze", isAuthenticated, async (req: any, res) => {
    try {
      const { documentId, analysisType } = req.body;
      
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      let result;
      switch (analysisType) {
        case "summary":
          result = await generateDocumentSummary(document.ocrText || "");
          break;
        case "classification":
          const classification = await processDocumentWithAI(document.ocrText || "", document.fileName);
          result = classification.aiAnalysis;
          break;
        default:
          return res.status(400).json({ message: "Invalid analysis type" });
      }

      res.json({ result, documentId, analysisType });
    } catch (error) {
      console.error("Error in AI analysis:", error);
      res.status(500).json({ message: "AI analysis failed" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/documents', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDocumentStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching document analytics:", error);
      res.status(500).json({ message: "Failed to fetch document analytics" });
    }
  });

  app.get('/api/analytics/processing', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getProcessingStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching processing analytics:", error);
      res.status(500).json({ message: "Failed to fetch processing analytics" });
    }
  });

  app.get('/api/analytics/users', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  // Audit logs
  app.get('/api/audit-logs', isAuthenticated, async (req, res) => {
    try {
      const { userId, action } = req.query;
      const logs = await storage.getAuditLogs({ userId, action });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Cloud storage routes
  app.get('/api/cloud-storage', isAuthenticated, async (req, res) => {
    try {
      const files = await storage.getCloudStorageFiles();
      res.json(files);
    } catch (error) {
      console.error("Error fetching cloud storage files:", error);
      res.status(500).json({ message: "Failed to fetch cloud storage files" });
    }
  });

  // Document Templates routes
  app.get('/api/document-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getDocumentTemplates(req.query);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching document templates:", error);
      res.status(500).json({ message: "Failed to fetch document templates" });
    }
  });

  app.post('/api/document-templates', isAuthenticated, async (req: any, res) => {
    try {
      const templateData = { ...req.body, createdBy: req.user.claims.sub };
      const template = await storage.createDocumentTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating document template:", error);
      res.status(500).json({ message: "Failed to create document template" });
    }
  });

  app.put('/api/document-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.updateDocumentTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating document template:", error);
      res.status(500).json({ message: "Failed to update document template" });
    }
  });

  app.delete('/api/document-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocumentTemplate(id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting document template:", error);
      res.status(500).json({ message: "Failed to delete document template" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId, req.query);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.post('/api/notifications/:id/mark-read', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotification(id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Bulk Operations routes
  app.get('/api/bulk-operations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const operations = await storage.getBulkOperations(userId);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching bulk operations:", error);
      res.status(500).json({ message: "Failed to fetch bulk operations" });
    }
  });

  app.post('/api/bulk-operations', isAuthenticated, async (req: any, res) => {
    try {
      const operationData = { ...req.body, userId: req.user.claims.sub };
      const operation = await storage.createBulkOperation(operationData);
      res.json(operation);
    } catch (error) {
      console.error("Error creating bulk operation:", error);
      res.status(500).json({ message: "Failed to create bulk operation" });
    }
  });

  app.post('/api/bulk-operations/:id/process', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.processBulkOperation(id);
      res.json({ message: "Bulk operation started" });
    } catch (error) {
      console.error("Error processing bulk operation:", error);
      res.status(500).json({ message: "Failed to process bulk operation" });
    }
  });

  // Digital Signature API Routes
  
  // Signature Workflows
  app.get('/api/signature-workflows', isAuthenticated, async (req, res) => {
    try {
      const workflows = await storage.getSignatureWorkflows(req.query);
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching signature workflows:", error);
      res.status(500).json({ message: "Failed to fetch signature workflows" });
    }
  });

  app.post('/api/signature-workflows', isAuthenticated, async (req: any, res) => {
    try {
      const workflowData = { ...req.body, createdBy: req.user.claims.sub };
      const workflow = await storage.createSignatureWorkflow(workflowData);
      res.json(workflow);
    } catch (error) {
      console.error("Error creating signature workflow:", error);
      res.status(500).json({ message: "Failed to create signature workflow" });
    }
  });

  app.get('/api/signature-workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.getSignatureWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Error fetching signature workflow:", error);
      res.status(500).json({ message: "Failed to fetch signature workflow" });
    }
  });

  app.post('/api/signature-workflows/:id/start', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.updateSignatureWorkflow(id, { 
        status: "in_progress",
        updatedAt: new Date()
      });
      
      // Create audit log
      await storage.createSignatureAuditLog({
        workflowId: id,
        userId: req.user.claims.sub,
        action: "started",
        details: { message: "Workflow started" }
      });
      
      res.json(workflow);
    } catch (error) {
      console.error("Error starting signature workflow:", error);
      res.status(500).json({ message: "Failed to start signature workflow" });
    }
  });

  app.post('/api/signature-workflows/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.completeSignatureWorkflow(id);
      
      // Create audit log
      await storage.createSignatureAuditLog({
        workflowId: id,
        userId: req.user.claims.sub,
        action: "completed",
        details: { message: "Workflow completed" }
      });
      
      res.json(workflow);
    } catch (error) {
      console.error("Error completing signature workflow:", error);
      res.status(500).json({ message: "Failed to complete signature workflow" });
    }
  });

  // Signature Requests
  app.get('/api/signature-requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getSignatureRequests(req.query);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching signature requests:", error);
      res.status(500).json({ message: "Failed to fetch signature requests" });
    }
  });

  app.post('/api/signature-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requestData = { ...req.body, requesterId: req.user.claims.sub };
      const request = await storage.createSignatureRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating signature request:", error);
      res.status(500).json({ message: "Failed to create signature request" });
    }
  });

  app.get('/api/signature-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getSignatureRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching signature request:", error);
      res.status(500).json({ message: "Failed to fetch signature request" });
    }
  });

  app.post('/api/signature-requests/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { signatureData } = req.body;
      
      // Create digital signature record
      const signature = await storage.createDigitalSignature({
        documentId: req.body.documentId,
        signerId: req.user.claims.sub,
        signerName: req.user.claims.first_name + " " + req.user.claims.last_name,
        signerEmail: req.user.claims.email,
        signerRole: req.body.signerRole || "user",
        signatureType: "digital",
        signatureData: signatureData,
        signatureMethod: "canvas",
        signatureHash: `sha256_${Date.now()}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Update signature request
      const request = await storage.signDocument(id, signatureData);
      
      // Create audit log
      await storage.createSignatureAuditLog({
        documentId: req.body.documentId,
        signatureId: signature.id,
        userId: req.user.claims.sub,
        action: "signed",
        details: { signatureMethod: "canvas" }
      });
      
      res.json({ request, signature });
    } catch (error) {
      console.error("Error signing document:", error);
      res.status(500).json({ message: "Failed to sign document" });
    }
  });

  app.post('/api/signature-requests/:id/decline', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const request = await storage.declineSignature(id, reason);
      
      // Create audit log
      await storage.createSignatureAuditLog({
        userId: req.user.claims.sub,
        action: "declined",
        details: { reason }
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error declining signature:", error);
      res.status(500).json({ message: "Failed to decline signature" });
    }
  });

  // Signature Templates
  app.get('/api/signature-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.getSignatureTemplates(req.query);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching signature templates:", error);
      res.status(500).json({ message: "Failed to fetch signature templates" });
    }
  });

  app.post('/api/signature-templates', isAuthenticated, async (req: any, res) => {
    try {
      const templateData = { ...req.body, createdBy: req.user.claims.sub };
      const template = await storage.createSignatureTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating signature template:", error);
      res.status(500).json({ message: "Failed to create signature template" });
    }
  });

  app.get('/api/signature-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.getSignatureTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching signature template:", error);
      res.status(500).json({ message: "Failed to fetch signature template" });
    }
  });

  app.put('/api/signature-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const template = await storage.updateSignatureTemplate(id, req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating signature template:", error);
      res.status(500).json({ message: "Failed to update signature template" });
    }
  });

  app.delete('/api/signature-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSignatureTemplate(id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting signature template:", error);
      res.status(500).json({ message: "Failed to delete signature template" });
    }
  });

  // Digital Signatures
  app.get('/api/documents/:documentId/signatures', isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      const signatures = await storage.getDigitalSignatures(documentId);
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching document signatures:", error);
      res.status(500).json({ message: "Failed to fetch document signatures" });
    }
  });

  app.post('/api/signatures/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const signature = await storage.verifyDigitalSignature(id);
      
      // Create audit log
      await storage.createSignatureAuditLog({
        signatureId: id,
        userId: req.user.claims.sub,
        action: "verified",
        details: { verifiedBy: req.user.claims.email }
      });
      
      res.json(signature);
    } catch (error) {
      console.error("Error verifying signature:", error);
      res.status(500).json({ message: "Failed to verify signature" });
    }
  });

  // Signature Audit Logs
  app.get('/api/signature-audit-logs', isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getSignatureAuditLogs(req.query);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching signature audit logs:", error);
      res.status(500).json({ message: "Failed to fetch signature audit logs" });
    }
  });

  app.get('/api/documents/:documentId/signature-history', isAuthenticated, async (req, res) => {
    try {
      const { documentId } = req.params;
      const history = await storage.getDocumentSignatureHistory(documentId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching document signature history:", error);
      res.status(500).json({ message: "Failed to fetch document signature history" });
    }
  });

  // Get users endpoint for signer selection
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      // This would need to be implemented in storage to get all users
      // For now, returning empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
