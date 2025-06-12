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

  const httpServer = createServer(app);
  return httpServer;
}
