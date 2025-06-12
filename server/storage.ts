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
    let query = db.select().from(documents);
    
    if (filters.status) {
      query = query.where(eq(documents.status, filters.status));
    }
    
    if (filters.letterType) {
      query = query.where(eq(documents.letterType, filters.letterType));
    }
    
    if (filters.search) {
      query = query.where(
        sql`${documents.subject} ILIKE ${`%${filters.search}%`} OR ${documents.topic} ILIKE ${`%${filters.search}%`}`
      );
    }
    
    return query.orderBy(desc(documents.createdAt));
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
    let query = db.select().from(communicationLogs);
    
    if (filters.type) {
      query = query.where(eq(communicationLogs.type, filters.type));
    }
    
    return query.orderBy(desc(communicationLogs.createdAt));
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
    let query = db.select().from(auditLogs);
    
    if (filters.userId) {
      query = query.where(eq(auditLogs.userId, filters.userId));
    }
    
    if (filters.action) {
      query = query.where(eq(auditLogs.action, filters.action));
    }
    
    return query.orderBy(desc(auditLogs.createdAt));
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
    let query = db
      .select()
      .from(aiApiEndpoints)
      .where(and(eq(aiApiEndpoints.provider, provider), eq(aiApiEndpoints.isActive, true)));
    
    if (model) {
      query = query.where(eq(aiApiEndpoints.model, model));
    }
    
    const [endpoint] = await query.limit(1);
    return endpoint;
  }

  // AI API Usage tracking
  async createAiApiUsage(usage: InsertAIApiUsage): Promise<AIApiUsage> {
    const [created] = await db.insert(aiApiUsage).values(usage).returning();
    return created;
  }

  async getAiApiUsage(filters: any = {}): Promise<AIApiUsage[]> {
    let query = db.select().from(aiApiUsage);
    
    if (filters.endpointId) {
      query = query.where(eq(aiApiUsage.endpointId, filters.endpointId));
    }
    if (filters.userId) {
      query = query.where(eq(aiApiUsage.userId, filters.userId));
    }
    if (filters.documentId) {
      query = query.where(eq(aiApiUsage.documentId, filters.documentId));
    }
    if (filters.requestType) {
      query = query.where(eq(aiApiUsage.requestType, filters.requestType));
    }
    
    return await query.orderBy(desc(aiApiUsage.createdAt));
  }

  async getAiApiUsageStats(endpointId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    let query = db
      .select({
        totalRequests: count(),
        successfulRequests: count(sql`CASE WHEN ${aiApiUsage.success} = true THEN 1 END`),
        totalCost: sql<number>`SUM(${aiApiUsage.cost})`.mapWith(Number),
        avgResponseTime: sql<number>`AVG(${aiApiUsage.responseTime})`.mapWith(Number),
        totalTokens: sql<number>`SUM(${aiApiUsage.totalTokens})`.mapWith(Number),
      })
      .from(aiApiUsage);

    if (endpointId) {
      query = query.where(eq(aiApiUsage.endpointId, endpointId));
    }
    
    if (dateRange) {
      query = query.where(
        and(
          sql`${aiApiUsage.createdAt} >= ${dateRange.start}`,
          sql`${aiApiUsage.createdAt} <= ${dateRange.end}`
        )
      );
    }

    const [stats] = await query;
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
    let query = db.select().from(aiModelPerformance);
    
    if (endpointId) {
      query = query.where(eq(aiModelPerformance.endpointId, endpointId));
    }
    
    if (dateRange) {
      query = query.where(
        and(
          sql`${aiModelPerformance.date} >= ${dateRange.start}`,
          sql`${aiModelPerformance.date} <= ${dateRange.end}`
        )
      );
    }
    
    return await query.orderBy(desc(aiModelPerformance.date));
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
    let query = db
      .select()
      .from(documentWorkflow)
      .where(sql`${documentWorkflow.status} IN ('pending', 'processing')`);
    
    if (assignedTo) {
      query = query.where(eq(documentWorkflow.assignedTo, assignedTo));
    }
    
    return await query.orderBy(documentWorkflow.dueDate, documentWorkflow.createdAt);
  }
}

export const storage = new DatabaseStorage();
