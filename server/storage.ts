import {
  users,
  documents,
  roles,
  fieldConfigurations,
  communicationLogs,
  auditLogs,
  cloudStorage,
  aiApiEndpoints,
  aiApiUsage,
  ocrResults,
  documentAnalysis,
  aiModelPerformance,
  documentWorkflow,
  documentTemplates,
  notifications,
  savedSearches,
  documentTags,
  bulkOperations,
  type User,
  type UpsertUser,
  type Document,
  type InsertDocument,
  type Role,
  type InsertRole,
  type FieldConfiguration,
  type InsertFieldConfiguration,
  type CommunicationLog,
  type InsertCommunicationLog,
  type AuditLog,
  type InsertAuditLog,
  type CloudStorage,
  type InsertCloudStorage,
  type AIApiEndpoint,
  type InsertAIApiEndpoint,
  type AIApiUsage,
  type InsertAIApiUsage,
  type OCRResult,
  type InsertOCRResult,
  type DocumentAnalysis,
  type InsertDocumentAnalysis,
  type AIModelPerformance,
  type InsertAIModelPerformance,
  type DocumentWorkflow,
  type InsertDocumentWorkflow,
  type DocumentTemplate,
  type InsertDocumentTemplate,
  type Notification,
  type InsertNotification,
  type SavedSearch,
  type InsertSavedSearch,
  type DocumentTag,
  type InsertDocumentTag,
  type BulkOperation,
  type InsertBulkOperation,
  type DigitalSignature,
  type InsertDigitalSignature,
  type SignatureWorkflow,
  type InsertSignatureWorkflow,
  type SignatureRequest,
  type InsertSignatureRequest,
  type SignatureTemplate,
  type InsertSignatureTemplate,
  type SignatureAuditLog,
  type InsertSignatureAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocuments(filters?: any): Promise<Document[]>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Role operations
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, updates: Partial<Role>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  // Field configuration operations
  getFieldConfigurations(): Promise<FieldConfiguration[]>;
  createFieldConfiguration(config: InsertFieldConfiguration): Promise<FieldConfiguration>;
  updateFieldConfiguration(id: number, updates: Partial<FieldConfiguration>): Promise<FieldConfiguration>;
  deleteFieldConfiguration(id: number): Promise<void>;
  
  // Communication operations
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  getCommunicationLogs(filters?: any): Promise<CommunicationLog[]>;
  updateCommunicationLog(id: string, updates: Partial<CommunicationLog>): Promise<CommunicationLog>;
  
  // Audit operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: any): Promise<AuditLog[]>;
  
  // Cloud storage operations
  createCloudStorage(storage: InsertCloudStorage): Promise<CloudStorage>;
  getCloudStorageFiles(): Promise<CloudStorage[]>;
  updateCloudStorage(id: string, updates: Partial<CloudStorage>): Promise<CloudStorage>;
  
  // Analytics operations
  getDocumentStats(): Promise<any>;
  getProcessingStats(): Promise<any>;
  getUserStats(): Promise<any>;

  // AI API Endpoint operations
  getAiApiEndpoints(): Promise<AIApiEndpoint[]>;
  createAiApiEndpoint(endpoint: InsertAIApiEndpoint): Promise<AIApiEndpoint>;
  updateAiApiEndpoint(id: string, updates: Partial<AIApiEndpoint>): Promise<AIApiEndpoint>;
  deleteAiApiEndpoint(id: string): Promise<void>;
  getActiveAiApiEndpoint(provider: string, model?: string): Promise<AIApiEndpoint | undefined>;

  // AI API Usage tracking
  createAiApiUsage(usage: InsertAIApiUsage): Promise<AIApiUsage>;
  getAiApiUsage(filters?: any): Promise<AIApiUsage[]>;
  getAiApiUsageStats(endpointId?: string, dateRange?: { start: Date; end: Date }): Promise<any>;

  // OCR Results
  createOcrResult(result: InsertOCRResult): Promise<OCRResult>;
  getOcrResults(documentId: string): Promise<OCRResult[]>;
  updateOcrResult(id: string, updates: Partial<OCRResult>): Promise<OCRResult>;

  // Document Analysis
  createDocumentAnalysis(analysis: InsertDocumentAnalysis): Promise<DocumentAnalysis>;
  getDocumentAnalysis(documentId: string): Promise<DocumentAnalysis[]>;
  updateDocumentAnalysis(id: string, updates: Partial<DocumentAnalysis>): Promise<DocumentAnalysis>;
  validateDocumentAnalysis(id: string, validatedBy: string): Promise<DocumentAnalysis>;

  // AI Model Performance
  createAiModelPerformance(performance: InsertAIModelPerformance): Promise<AIModelPerformance>;
  getAiModelPerformance(endpointId?: string, dateRange?: { start: Date; end: Date }): Promise<AIModelPerformance[]>;
  updateDailyPerformanceMetrics(endpointId: string, metrics: any): Promise<void>;

  // Document Workflow
  createDocumentWorkflow(workflow: InsertDocumentWorkflow): Promise<DocumentWorkflow>;
  getDocumentWorkflow(documentId: string): Promise<DocumentWorkflow[]>;
  updateDocumentWorkflowStatus(id: string, status: string, updates?: Partial<DocumentWorkflow>): Promise<DocumentWorkflow>;
  getWorkflowQueue(assignedTo?: string): Promise<DocumentWorkflow[]>;

  // Document Templates
  createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate>;
  getDocumentTemplates(filters?: any): Promise<DocumentTemplate[]>;
  getDocumentTemplate(id: string): Promise<DocumentTemplate | undefined>;
  updateDocumentTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate>;
  deleteDocumentTemplate(id: string): Promise<void>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, filters?: any): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Saved Searches
  createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch>;
  getSavedSearches(userId: string): Promise<SavedSearch[]>;
  updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch>;
  deleteSavedSearch(id: string): Promise<void>;

  // Document Tags
  createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag>;
  getDocumentTags(documentId: string): Promise<DocumentTag[]>;
  deleteDocumentTag(id: string): Promise<void>;
  getPopularTags(limit?: number): Promise<{ tagName: string; count: number }[]>;

  // Bulk Operations
  createBulkOperation(operation: InsertBulkOperation): Promise<BulkOperation>;
  getBulkOperations(userId: string): Promise<BulkOperation[]>;
  updateBulkOperation(id: string, updates: Partial<BulkOperation>): Promise<BulkOperation>;
  processBulkOperation(id: string): Promise<void>;

  // Digital Signature Operations
  createDigitalSignature(signature: InsertDigitalSignature): Promise<DigitalSignature>;
  getDigitalSignatures(documentId: string): Promise<DigitalSignature[]>;
  getDigitalSignature(id: string): Promise<DigitalSignature | undefined>;
  verifyDigitalSignature(id: string): Promise<DigitalSignature>;
  invalidateDigitalSignature(id: string): Promise<DigitalSignature>;

  // Signature Workflow Operations
  createSignatureWorkflow(workflow: InsertSignatureWorkflow): Promise<SignatureWorkflow>;
  getSignatureWorkflows(filters?: any): Promise<SignatureWorkflow[]>;
  getSignatureWorkflow(id: string): Promise<SignatureWorkflow | undefined>;
  updateSignatureWorkflow(id: string, updates: Partial<SignatureWorkflow>): Promise<SignatureWorkflow>;
  completeSignatureWorkflow(id: string): Promise<SignatureWorkflow>;
  cancelSignatureWorkflow(id: string): Promise<SignatureWorkflow>;

  // Signature Request Operations
  createSignatureRequest(request: InsertSignatureRequest): Promise<SignatureRequest>;
  getSignatureRequests(filters?: any): Promise<SignatureRequest[]>;
  getSignatureRequest(id: string): Promise<SignatureRequest | undefined>;
  getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined>;
  updateSignatureRequest(id: string, updates: Partial<SignatureRequest>): Promise<SignatureRequest>;
  signDocument(requestId: string, signatureData: any): Promise<SignatureRequest>;
  declineSignature(requestId: string, reason: string): Promise<SignatureRequest>;

  // Signature Template Operations
  createSignatureTemplate(template: InsertSignatureTemplate): Promise<SignatureTemplate>;
  getSignatureTemplates(filters?: any): Promise<SignatureTemplate[]>;
  getSignatureTemplate(id: string): Promise<SignatureTemplate | undefined>;
  updateSignatureTemplate(id: string, updates: Partial<SignatureTemplate>): Promise<SignatureTemplate>;
  deleteSignatureTemplate(id: string): Promise<void>;

  // Signature Audit Operations
  createSignatureAuditLog(log: InsertSignatureAuditLog): Promise<SignatureAuditLog>;
  getSignatureAuditLogs(filters?: any): Promise<SignatureAuditLog[]>;
  getDocumentSignatureHistory(documentId: string): Promise<SignatureAuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async getDocuments(filters: any = {}): Promise<Document[]> {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(documents.status, filters.status));
    }
    
    if (filters.letterType) {
      conditions.push(eq(documents.letterType, filters.letterType));
    }
    
    if (filters.search) {
      conditions.push(
        sql`${documents.subject} ILIKE ${`%${filters.search}%`} OR ${documents.topic} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.createdAt));
    }
    
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.createdAt));
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return db.select().from(roles).orderBy(roles.name);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db
      .insert(roles)
      .values(role)
      .returning();
    return newRole;
  }

  async updateRole(id: number, updates: Partial<Role>): Promise<Role> {
    const [updatedRole] = await db
      .update(roles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Field configuration operations
  async getFieldConfigurations(): Promise<FieldConfiguration[]> {
    return db.select().from(fieldConfigurations).orderBy(fieldConfigurations.order);
  }

  async createFieldConfiguration(config: InsertFieldConfiguration): Promise<FieldConfiguration> {
    const [newConfig] = await db
      .insert(fieldConfigurations)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateFieldConfiguration(id: number, updates: Partial<FieldConfiguration>): Promise<FieldConfiguration> {
    const [updatedConfig] = await db
      .update(fieldConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(fieldConfigurations.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteFieldConfiguration(id: number): Promise<void> {
    await db.delete(fieldConfigurations).where(eq(fieldConfigurations.id, id));
  }

  // Communication operations
  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [newLog] = await db
      .insert(communicationLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getCommunicationLogs(filters: any = {}): Promise<CommunicationLog[]> {
    if (filters.type) {
      return await db
        .select()
        .from(communicationLogs)
        .where(eq(communicationLogs.type, filters.type))
        .orderBy(desc(communicationLogs.createdAt));
    }
    
    return await db
      .select()
      .from(communicationLogs)
      .orderBy(desc(communicationLogs.createdAt));
  }

  async updateCommunicationLog(id: string, updates: Partial<CommunicationLog>): Promise<CommunicationLog> {
    const [updatedLog] = await db
      .update(communicationLogs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communicationLogs.id, id))
      .returning();
    return updatedLog;
  }

  // Audit operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAuditLogs(filters: any = {}): Promise<AuditLog[]> {
    if (filters.userId && filters.action) {
      return await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.userId, filters.userId), eq(auditLogs.action, filters.action)))
        .orderBy(desc(auditLogs.createdAt));
    }
    
    if (filters.userId) {
      return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.userId, filters.userId))
        .orderBy(desc(auditLogs.createdAt));
    }
    
    if (filters.action) {
      return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.action, filters.action))
        .orderBy(desc(auditLogs.createdAt));
    }
    
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
  }

  // Cloud storage operations
  async createCloudStorage(storage: InsertCloudStorage): Promise<CloudStorage> {
    const [newStorage] = await db
      .insert(cloudStorage)
      .values(storage)
      .returning();
    return newStorage;
  }

  async getCloudStorageFiles(): Promise<CloudStorage[]> {
    return db.select().from(cloudStorage).orderBy(desc(cloudStorage.createdAt));
  }

  async updateCloudStorage(id: string, updates: Partial<CloudStorage>): Promise<CloudStorage> {
    const [updatedStorage] = await db
      .update(cloudStorage)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cloudStorage.id, id))
      .returning();
    return updatedStorage;
  }

  // Analytics operations
  async getDocumentStats(): Promise<any> {
    const totalDocs = await db.select({ count: count() }).from(documents);
    const processedDocs = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.status, "processed"));
    const pendingDocs = await db
      .select({ count: count() })
      .from(documents)
      .where(eq(documents.status, "pending"));
    
    return {
      total: totalDocs[0].count,
      processed: processedDocs[0].count,
      pending: pendingDocs[0].count,
    };
  }

  async getProcessingStats(): Promise<any> {
    const avgConfidence = await db
      .select({ 
        avg: sql<number>`AVG(${documents.ocrConfidence})`.mapWith(Number)
      })
      .from(documents)
      .where(sql`${documents.ocrConfidence} IS NOT NULL`);
    
    return {
      averageConfidence: avgConfidence[0]?.avg || 0,
    };
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await db.select({ count: count() }).from(users);
    const activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));
    
    return {
      total: totalUsers[0].count,
      active: activeUsers[0].count,
    };
  }

  // AI API Endpoint operations
  async getAiApiEndpoints(): Promise<AIApiEndpoint[]> {
    return await db.select().from(aiApiEndpoints).orderBy(desc(aiApiEndpoints.createdAt));
  }

  async createAiApiEndpoint(endpoint: InsertAIApiEndpoint): Promise<AIApiEndpoint> {
    const [created] = await db.insert(aiApiEndpoints).values(endpoint).returning();
    return created;
  }

  async updateAiApiEndpoint(id: string, updates: Partial<AIApiEndpoint>): Promise<AIApiEndpoint> {
    const [updated] = await db
      .update(aiApiEndpoints)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiApiEndpoints.id, id))
      .returning();
    return updated;
  }

  async deleteAiApiEndpoint(id: string): Promise<void> {
    await db.delete(aiApiEndpoints).where(eq(aiApiEndpoints.id, id));
  }

  async getActiveAiApiEndpoint(provider: string, model?: string): Promise<AIApiEndpoint | undefined> {
    if (model) {
      const [endpoint] = await db
        .select()
        .from(aiApiEndpoints)
        .where(and(
          eq(aiApiEndpoints.provider, provider),
          eq(aiApiEndpoints.model, model),
          eq(aiApiEndpoints.isActive, true)
        ))
        .limit(1);
      return endpoint;
    }
    
    const [endpoint] = await db
      .select()
      .from(aiApiEndpoints)
      .where(and(
        eq(aiApiEndpoints.provider, provider),
        eq(aiApiEndpoints.isActive, true)
      ))
      .limit(1);
    return endpoint;
  }

  // AI API Usage tracking
  async createAiApiUsage(usage: InsertAIApiUsage): Promise<AIApiUsage> {
    const [created] = await db.insert(aiApiUsage).values(usage).returning();
    return created;
  }

  async getAiApiUsage(filters: any = {}): Promise<AIApiUsage[]> {
    const conditions = [];
    
    if (filters.endpointId) {
      conditions.push(eq(aiApiUsage.endpointId, filters.endpointId));
    }
    if (filters.userId) {
      conditions.push(eq(aiApiUsage.userId, filters.userId));
    }
    if (filters.documentId) {
      conditions.push(eq(aiApiUsage.documentId, filters.documentId));
    }
    if (filters.requestType) {
      conditions.push(eq(aiApiUsage.requestType, filters.requestType));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(aiApiUsage)
        .where(and(...conditions))
        .orderBy(desc(aiApiUsage.createdAt));
    }
    
    return await db
      .select()
      .from(aiApiUsage)
      .orderBy(desc(aiApiUsage.createdAt));
  }

  async getAiApiUsageStats(endpointId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    const conditions = [];
    
    if (endpointId) {
      conditions.push(eq(aiApiUsage.endpointId, endpointId));
    }
    
    if (dateRange) {
      conditions.push(sql`${aiApiUsage.createdAt} >= ${dateRange.start}`);
      conditions.push(sql`${aiApiUsage.createdAt} <= ${dateRange.end}`);
    }

    if (conditions.length > 0) {
      const [stats] = await db
        .select({
          totalRequests: count(),
          successfulRequests: count(sql`CASE WHEN ${aiApiUsage.success} = true THEN 1 END`),
          totalCost: sql<number>`SUM(${aiApiUsage.cost})`.mapWith(Number),
          avgResponseTime: sql<number>`AVG(${aiApiUsage.responseTime})`.mapWith(Number),
          totalTokens: sql<number>`SUM(${aiApiUsage.totalTokens})`.mapWith(Number),
        })
        .from(aiApiUsage)
        .where(and(...conditions));
      return stats;
    }

    const [stats] = await db
      .select({
        totalRequests: count(),
        successfulRequests: count(sql`CASE WHEN ${aiApiUsage.success} = true THEN 1 END`),
        totalCost: sql<number>`SUM(${aiApiUsage.cost})`.mapWith(Number),
        avgResponseTime: sql<number>`AVG(${aiApiUsage.responseTime})`.mapWith(Number),
        totalTokens: sql<number>`SUM(${aiApiUsage.totalTokens})`.mapWith(Number),
      })
      .from(aiApiUsage);
    return stats;
  }

  // OCR Results
  async createOcrResult(result: InsertOCRResult): Promise<OCRResult> {
    const [created] = await db.insert(ocrResults).values(result).returning();
    return created;
  }

  async getOcrResults(documentId: string): Promise<OCRResult[]> {
    return await db
      .select()
      .from(ocrResults)
      .where(eq(ocrResults.documentId, documentId))
      .orderBy(desc(ocrResults.createdAt));
  }

  async updateOcrResult(id: string, updates: Partial<OCRResult>): Promise<OCRResult> {
    const [updated] = await db
      .update(ocrResults)
      .set(updates)
      .where(eq(ocrResults.id, id))
      .returning();
    return updated;
  }

  // Document Analysis
  async createDocumentAnalysis(analysis: InsertDocumentAnalysis): Promise<DocumentAnalysis> {
    const [created] = await db.insert(documentAnalysis).values(analysis).returning();
    return created;
  }

  async getDocumentAnalysis(documentId: string): Promise<DocumentAnalysis[]> {
    return await db
      .select()
      .from(documentAnalysis)
      .where(eq(documentAnalysis.documentId, documentId))
      .orderBy(desc(documentAnalysis.createdAt));
  }

  async updateDocumentAnalysis(id: string, updates: Partial<DocumentAnalysis>): Promise<DocumentAnalysis> {
    const [updated] = await db
      .update(documentAnalysis)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentAnalysis.id, id))
      .returning();
    return updated;
  }

  async validateDocumentAnalysis(id: string, validatedBy: string): Promise<DocumentAnalysis> {
    const [validated] = await db
      .update(documentAnalysis)
      .set({
        validationStatus: "validated",
        validatedBy,
        validatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(documentAnalysis.id, id))
      .returning();
    return validated;
  }

  // AI Model Performance
  async createAiModelPerformance(performance: InsertAIModelPerformance): Promise<AIModelPerformance> {
    const [created] = await db.insert(aiModelPerformance).values(performance).returning();
    return created;
  }

  async getAiModelPerformance(endpointId?: string, dateRange?: { start: Date; end: Date }): Promise<AIModelPerformance[]> {
    const conditions = [];
    
    if (endpointId) {
      conditions.push(eq(aiModelPerformance.endpointId, endpointId));
    }
    
    if (dateRange) {
      conditions.push(sql`${aiModelPerformance.date} >= ${dateRange.start}`);
      conditions.push(sql`${aiModelPerformance.date} <= ${dateRange.end}`);
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(aiModelPerformance)
        .where(and(...conditions))
        .orderBy(desc(aiModelPerformance.date));
    }
    
    return await db
      .select()
      .from(aiModelPerformance)
      .orderBy(desc(aiModelPerformance.date));
  }

  async updateDailyPerformanceMetrics(endpointId: string, metrics: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    await db
      .insert(aiModelPerformance)
      .values({
        endpointId,
        date: new Date(today),
        ...metrics
      })
      .onConflictDoUpdate({
        target: [aiModelPerformance.endpointId, aiModelPerformance.date],
        set: metrics
      });
  }

  // Document Workflow
  async createDocumentWorkflow(workflow: InsertDocumentWorkflow): Promise<DocumentWorkflow> {
    const [created] = await db.insert(documentWorkflow).values(workflow).returning();
    return created;
  }

  async getDocumentWorkflow(documentId: string): Promise<DocumentWorkflow[]> {
    return await db
      .select()
      .from(documentWorkflow)
      .where(eq(documentWorkflow.documentId, documentId))
      .orderBy(desc(documentWorkflow.createdAt));
  }

  async updateDocumentWorkflowStatus(id: string, status: string, updates?: Partial<DocumentWorkflow>): Promise<DocumentWorkflow> {
    const updateData = {
      status,
      updatedAt: new Date(),
      ...(status === 'completed' && { completedAt: new Date() }),
      ...updates
    };

    const [updated] = await db
      .update(documentWorkflow)
      .set(updateData)
      .where(eq(documentWorkflow.id, id))
      .returning();
    return updated;
  }

  async getWorkflowQueue(assignedTo?: string): Promise<DocumentWorkflow[]> {
    if (assignedTo) {
      return await db
        .select()
        .from(documentWorkflow)
        .where(
          and(
            sql`${documentWorkflow.status} IN ('pending', 'processing')`,
            eq(documentWorkflow.assignedTo, assignedTo)
          )
        )
        .orderBy(documentWorkflow.dueDate, documentWorkflow.createdAt);
    }
    
    return await db
      .select()
      .from(documentWorkflow)
      .where(sql`${documentWorkflow.status} IN ('pending', 'processing')`)
      .orderBy(documentWorkflow.dueDate, documentWorkflow.createdAt);
  }

  // Document Templates
  async createDocumentTemplate(template: InsertDocumentTemplate): Promise<DocumentTemplate> {
    const [created] = await db.insert(documentTemplates).values(template).returning();
    return created;
  }

  async getDocumentTemplates(filters: any = {}): Promise<DocumentTemplate[]> {
    const conditions = [];
    
    if (filters.category) {
      conditions.push(eq(documentTemplates.category, filters.category));
    }
    
    if (filters.templateType) {
      conditions.push(eq(documentTemplates.templateType, filters.templateType));
    }
    
    if (filters.isActive !== undefined) {
      conditions.push(eq(documentTemplates.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(documentTemplates)
        .where(and(...conditions))
        .orderBy(desc(documentTemplates.createdAt));
    }
    
    return await db
      .select()
      .from(documentTemplates)
      .orderBy(desc(documentTemplates.createdAt));
  }

  async getDocumentTemplate(id: string): Promise<DocumentTemplate | undefined> {
    const [template] = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, id));
    return template;
  }

  async updateDocumentTemplate(id: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const [updated] = await db
      .update(documentTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteDocumentTemplate(id: string): Promise<void> {
    await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async getNotifications(userId: string, filters: any = {}): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    
    if (filters.isRead !== undefined) {
      conditions.push(eq(notifications.isRead, filters.isRead));
    }
    
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }
    
    if (filters.category) {
      conditions.push(eq(notifications.category, filters.category));
    }
    
    return await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }

  // Saved Searches
  async createSavedSearch(search: InsertSavedSearch): Promise<SavedSearch> {
    const [created] = await db.insert(savedSearches).values(search).returning();
    return created;
  }

  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
  }

  async updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch> {
    const [updated] = await db
      .update(savedSearches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(savedSearches.id, id))
      .returning();
    return updated;
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await db.delete(savedSearches).where(eq(savedSearches.id, id));
  }

  // Document Tags
  async createDocumentTag(tag: InsertDocumentTag): Promise<DocumentTag> {
    const [created] = await db.insert(documentTags).values(tag).returning();
    return created;
  }

  async getDocumentTags(documentId: string): Promise<DocumentTag[]> {
    return await db
      .select()
      .from(documentTags)
      .where(eq(documentTags.documentId, documentId))
      .orderBy(documentTags.tagName);
  }

  async deleteDocumentTag(id: string): Promise<void> {
    await db.delete(documentTags).where(eq(documentTags.id, id));
  }

  async getPopularTags(limit: number = 10): Promise<{ tagName: string; count: number }[]> {
    return await db
      .select({
        tagName: documentTags.tagName,
        count: count()
      })
      .from(documentTags)
      .groupBy(documentTags.tagName)
      .orderBy(desc(count()))
      .limit(limit);
  }

  // Bulk Operations
  async createBulkOperation(operation: InsertBulkOperation): Promise<BulkOperation> {
    const [created] = await db.insert(bulkOperations).values(operation).returning();
    return created;
  }

  async getBulkOperations(userId: string): Promise<BulkOperation[]> {
    return await db
      .select()
      .from(bulkOperations)
      .where(eq(bulkOperations.userId, userId))
      .orderBy(desc(bulkOperations.createdAt));
  }

  async updateBulkOperation(id: string, updates: Partial<BulkOperation>): Promise<BulkOperation> {
    const [updated] = await db
      .update(bulkOperations)
      .set(updates)
      .where(eq(bulkOperations.id, id))
      .returning();
    return updated;
  }

  async processBulkOperation(id: string): Promise<void> {
    const [operation] = await db
      .select()
      .from(bulkOperations)
      .where(eq(bulkOperations.id, id));
    
    if (!operation) return;
    
    await db
      .update(bulkOperations)
      .set({ 
        status: "processing",
        processedItems: 0,
        failedItems: 0 
      })
      .where(eq(bulkOperations.id, id));
  }

  // Digital Signature Operations
  async createDigitalSignature(signature: InsertDigitalSignature): Promise<DigitalSignature> {
    const [created] = await db.insert(digitalSignatures).values(signature).returning();
    return created;
  }

  async getDigitalSignatures(documentId: string): Promise<DigitalSignature[]> {
    return await db
      .select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.documentId, documentId))
      .orderBy(desc(digitalSignatures.timestamp));
  }

  async getDigitalSignature(id: string): Promise<DigitalSignature | undefined> {
    const [signature] = await db
      .select()
      .from(digitalSignatures)
      .where(eq(digitalSignatures.id, id));
    return signature;
  }

  async verifyDigitalSignature(id: string): Promise<DigitalSignature> {
    const [updated] = await db
      .update(digitalSignatures)
      .set({ verificationStatus: "verified" })
      .where(eq(digitalSignatures.id, id))
      .returning();
    return updated;
  }

  async invalidateDigitalSignature(id: string): Promise<DigitalSignature> {
    const [updated] = await db
      .update(digitalSignatures)
      .set({ isValid: false, verificationStatus: "failed" })
      .where(eq(digitalSignatures.id, id))
      .returning();
    return updated;
  }

  // Signature Workflow Operations
  async createSignatureWorkflow(workflow: InsertSignatureWorkflow): Promise<SignatureWorkflow> {
    const [created] = await db.insert(signatureWorkflows).values(workflow).returning();
    return created;
  }

  async getSignatureWorkflows(filters: any = {}): Promise<SignatureWorkflow[]> {
    const conditions = [];
    
    if (filters.status) {
      conditions.push(eq(signatureWorkflows.status, filters.status));
    }
    
    if (filters.createdBy) {
      conditions.push(eq(signatureWorkflows.createdBy, filters.createdBy));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(signatureWorkflows)
        .where(and(...conditions))
        .orderBy(desc(signatureWorkflows.createdAt));
    }
    
    return await db
      .select()
      .from(signatureWorkflows)
      .orderBy(desc(signatureWorkflows.createdAt));
  }

  async getSignatureWorkflow(id: string): Promise<SignatureWorkflow | undefined> {
    const [workflow] = await db
      .select()
      .from(signatureWorkflows)
      .where(eq(signatureWorkflows.id, id));
    return workflow;
  }

  async updateSignatureWorkflow(id: string, updates: Partial<SignatureWorkflow>): Promise<SignatureWorkflow> {
    const [updated] = await db
      .update(signatureWorkflows)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(signatureWorkflows.id, id))
      .returning();
    return updated;
  }

  async completeSignatureWorkflow(id: string): Promise<SignatureWorkflow> {
    const [updated] = await db
      .update(signatureWorkflows)
      .set({ 
        status: "completed", 
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(signatureWorkflows.id, id))
      .returning();
    return updated;
  }

  async cancelSignatureWorkflow(id: string): Promise<SignatureWorkflow> {
    const [updated] = await db
      .update(signatureWorkflows)
      .set({ 
        status: "cancelled",
        updatedAt: new Date()
      })
      .where(eq(signatureWorkflows.id, id))
      .returning();
    return updated;  
  }

  // Signature Request Operations
  async createSignatureRequest(request: InsertSignatureRequest): Promise<SignatureRequest> {
    const requestWithToken = {
      ...request,
      accessToken: `sig_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
    };
    const [created] = await db.insert(signatureRequests).values(requestWithToken).returning();
    return created;
  }

  async getSignatureRequests(filters: any = {}): Promise<SignatureRequest[]> {
    const conditions = [];
    
    if (filters.workflowId) {
      conditions.push(eq(signatureRequests.workflowId, filters.workflowId));
    }
    
    if (filters.signerId) {
      conditions.push(eq(signatureRequests.signerId, filters.signerId));
    }
    
    if (filters.status) {
      conditions.push(eq(signatureRequests.status, filters.status));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(signatureRequests)
        .where(and(...conditions))
        .orderBy(desc(signatureRequests.createdAt));
    }
    
    return await db
      .select()
      .from(signatureRequests)
      .orderBy(desc(signatureRequests.createdAt));
  }

  async getSignatureRequest(id: string): Promise<SignatureRequest | undefined> {
    const [request] = await db
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.id, id));
    return request;
  }

  async getSignatureRequestByToken(token: string): Promise<SignatureRequest | undefined> {
    const [request] = await db
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.accessToken, token));
    return request;
  }

  async updateSignatureRequest(id: string, updates: Partial<SignatureRequest>): Promise<SignatureRequest> {
    const [updated] = await db
      .update(signatureRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(signatureRequests.id, id))
      .returning();
    return updated;
  }

  async signDocument(requestId: string, signatureData: any): Promise<SignatureRequest> {
    const [updated] = await db
      .update(signatureRequests)
      .set({ 
        status: "signed",
        signedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(signatureRequests.id, requestId))
      .returning();
    return updated;
  }

  async declineSignature(requestId: string, reason: string): Promise<SignatureRequest> {
    const [updated] = await db
      .update(signatureRequests)
      .set({ 
        status: "declined",
        declinedAt: new Date(),
        declineReason: reason,
        updatedAt: new Date()
      })
      .where(eq(signatureRequests.id, requestId))
      .returning();
    return updated;
  }

  // Signature Template Operations
  async createSignatureTemplate(template: InsertSignatureTemplate): Promise<SignatureTemplate> {
    const [created] = await db.insert(signatureTemplates).values(template).returning();
    return created;
  }

  async getSignatureTemplates(filters: any = {}): Promise<SignatureTemplate[]> {
    const conditions = [];
    
    if (filters.templateType) {
      conditions.push(eq(signatureTemplates.templateType, filters.templateType));
    }
    
    if (filters.isActive !== undefined) {
      conditions.push(eq(signatureTemplates.isActive, filters.isActive));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(signatureTemplates)
        .where(and(...conditions))
        .orderBy(desc(signatureTemplates.createdAt));
    }
    
    return await db
      .select()
      .from(signatureTemplates)
      .where(eq(signatureTemplates.isActive, true))
      .orderBy(desc(signatureTemplates.createdAt));
  }

  async getSignatureTemplate(id: string): Promise<SignatureTemplate | undefined> {
    const [template] = await db
      .select()
      .from(signatureTemplates)
      .where(eq(signatureTemplates.id, id));
    return template;
  }

  async updateSignatureTemplate(id: string, updates: Partial<SignatureTemplate>): Promise<SignatureTemplate> {
    const [updated] = await db
      .update(signatureTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(signatureTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteSignatureTemplate(id: string): Promise<void> {
    await db.delete(signatureTemplates).where(eq(signatureTemplates.id, id));
  }

  // Signature Audit Operations
  async createSignatureAuditLog(log: InsertSignatureAuditLog): Promise<SignatureAuditLog> {
    const [created] = await db.insert(signatureAuditLogs).values(log).returning();
    return created;
  }

  async getSignatureAuditLogs(filters: any = {}): Promise<SignatureAuditLog[]> {
    const conditions = [];
    
    if (filters.documentId) {
      conditions.push(eq(signatureAuditLogs.documentId, filters.documentId));
    }
    
    if (filters.workflowId) {
      conditions.push(eq(signatureAuditLogs.workflowId, filters.workflowId));
    }
    
    if (filters.userId) {
      conditions.push(eq(signatureAuditLogs.userId, filters.userId));
    }
    
    if (conditions.length > 0) {
      return await db
        .select()
        .from(signatureAuditLogs)
        .where(and(...conditions))
        .orderBy(desc(signatureAuditLogs.timestamp));
    }
    
    return await db
      .select()
      .from(signatureAuditLogs)
      .orderBy(desc(signatureAuditLogs.timestamp));
  }

  async getDocumentSignatureHistory(documentId: string): Promise<SignatureAuditLog[]> {
    return await db
      .select()
      .from(signatureAuditLogs)
      .where(eq(signatureAuditLogs.documentId, documentId))
      .orderBy(desc(signatureAuditLogs.timestamp));
  }
}

export const storage = new DatabaseStorage();
