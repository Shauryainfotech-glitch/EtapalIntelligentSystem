import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDocumentSchema, insertRoleSchema, insertFieldConfigurationSchema } from "@shared/schema";
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

      // Simulate AI OCR processing
      setTimeout(async () => {
        try {
          const mockOCRResults = {
            status: "processed",
            ocrConfidence: 96.7,
            ocrText: "शासकीय पत्र\nमहाराष्ट्र राज्य\nजिल्हा पोलिस कार्यालय अहमदनगर\n\nपत्र क्रमांक: २३४५/२०२४\nदिनांक: १३/०६/२०२४\n\nविषय: नवीन योजना संदर्भात",
            extractedData: {
              office: "जिल्हा पोलिस कार्यालय अहमदनगर",
              serialNumber: "२३४५/२०२४",
              letterDate: new Date("2024-06-13"),
              subject: "शासन पत्र",
            },
            processedBy: userId,
          };
          
          await storage.updateDocument(document.id, mockOCRResults);
        } catch (error) {
          console.error("Error updating document with OCR results:", error);
        }
      }, 3000);

      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
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
