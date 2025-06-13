import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("clerk"), // super_admin, admin, officer, clerk
  department: varchar("department"),
  designation: varchar("designation"),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path").notNull(),
  
  // Letter details
  office: varchar("office"),
  recipientName: varchar("recipient_name"),
  serialNumber: varchar("serial_number"),
  letterDate: timestamp("letter_date"),
  receivedDate: timestamp("received_date"),
  author: varchar("author"),
  letterType: varchar("letter_type"),
  subject: varchar("subject"),
  topic: text("topic"),
  mobile: varchar("mobile"),
  documentCount: integer("document_count"),
  
  // Processing details
  status: varchar("status").default("pending"), // pending, processing, processed, failed
  ocrConfidence: decimal("ocr_confidence", { precision: 5, scale: 2 }),
  ocrText: text("ocr_text"),
  extractedData: jsonb("extracted_data"),
  aiAnalysis: jsonb("ai_analysis"),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default('[]'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Field configurations for dynamic forms
export const fieldConfigurations = pgTable("field_configurations", {
  id: serial("id").primaryKey(),
  fieldName: varchar("field_name").notNull(),
  fieldLabel: varchar("field_label").notNull(),
  fieldType: varchar("field_type").notNull(), // text, select, date, textarea, etc.
  isRequired: boolean("is_required").default(false),
  validationRules: jsonb("validation_rules"),
  options: jsonb("options"), // for select fields
  defaultValue: varchar("default_value"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication logs
export const communicationLogs = pgTable("communication_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type").notNull(), // whatsapp, email, sms
  recipient: varchar("recipient").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("pending"), // pending, sent, delivered, failed
  documentId: uuid("document_id").references(() => documents.id),
  sentBy: varchar("sent_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  userId: varchar("user_id").references(() => users.id),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cloud storage metadata
export const cloudStorage = pgTable("cloud_storage", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  cloudPath: varchar("cloud_path").notNull(),
  cloudProvider: varchar("cloud_provider").default("local"),
  uploadStatus: varchar("upload_status").default("pending"),
  documentId: uuid("document_id").references(() => documents.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI API Integration Tables
export const aiApiEndpoints = pgTable("ai_api_endpoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'openai', 'google', 'anthropic'
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true),
  rateLimit: integer("rate_limit").default(100), // requests per minute
  timeout: integer("timeout").default(30000), // milliseconds
  retryAttempts: integer("retry_attempts").default(3),
  configuration: jsonb("configuration"), // model-specific configs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiApiUsage = pgTable("ai_api_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  endpointId: uuid("endpoint_id").references(() => aiApiEndpoints.id).notNull(),
  requestId: varchar("request_id", { length: 100 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  documentId: uuid("document_id").references(() => documents.id),
  requestType: varchar("request_type", { length: 50 }).notNull(), // 'ocr', 'analysis', 'classification'
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  cost: decimal("cost", { precision: 10, scale: 4 }),
  responseTime: integer("response_time"), // milliseconds
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  requestData: jsonb("request_data"),
  responseData: jsonb("response_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ocrResults = pgTable("ocr_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  apiUsageId: uuid("api_usage_id").references(() => aiApiUsage.id),
  extractedText: text("extracted_text").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  language: varchar("language", { length: 10 }).default("mr"), // 'mr' for Marathi, 'en' for English
  boundingBoxes: jsonb("bounding_boxes"), // word/line coordinates
  textBlocks: jsonb("text_blocks"), // structured text blocks
  handwritingDetected: boolean("handwriting_detected").default(false),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentAnalysis = pgTable("document_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  apiUsageId: uuid("api_usage_id").references(() => aiApiUsage.id),
  analysisType: varchar("analysis_type", { length: 50 }).notNull(), // 'classification', 'extraction', 'summarization'
  extractedFields: jsonb("extracted_fields"), // structured field data
  documentType: varchar("document_type", { length: 100 }),
  subject: varchar("subject", { length: 500 }),
  sender: varchar("sender", { length: 255 }),
  recipient: varchar("recipient", { length: 255 }),
  dateExtracted: timestamp("date_extracted"),
  priority: varchar("priority", { length: 20 }),
  keywords: text("keywords").array(),
  entities: jsonb("entities"), // named entities
  summary: text("summary"),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  validationStatus: varchar("validation_status", { length: 20 }).default("pending"),
  validatedBy: varchar("validated_by", { length: 255 }),
  validatedAt: timestamp("validated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiModelPerformance = pgTable("ai_model_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  endpointId: uuid("endpoint_id").references(() => aiApiEndpoints.id).notNull(),
  date: timestamp("date").notNull(),
  totalRequests: integer("total_requests").default(0),
  successfulRequests: integer("successful_requests").default(0),
  failedRequests: integer("failed_requests").default(0),
  averageResponseTime: decimal("average_response_time", { precision: 10, scale: 2 }),
  totalTokensUsed: integer("total_tokens_used").default(0),
  totalCost: decimal("total_cost", { precision: 10, scale: 4 }).default("0"),
  averageConfidence: decimal("average_confidence", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueEndpointDate: unique().on(table.endpointId, table.date),
}));

export const documentWorkflow = pgTable("document_workflow", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  workflowStep: varchar("workflow_step", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'processing', 'completed', 'failed'
  assignedTo: varchar("assigned_to", { length: 255 }),
  aiProcessingRequired: boolean("ai_processing_required").default(false),
  aiProcessingCompleted: boolean("ai_processing_completed").default(false),
  approvalRequired: boolean("approval_required").default(false),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  comments: text("comments"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Templates for standardized government forms
export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  nameMarathi: varchar("name_marathi", { length: 200 }),
  description: text("description"),
  descriptionMarathi: text("description_marathi"),
  category: varchar("category", { length: 100 }).notNull(), // application, complaint, notice, order
  templateType: varchar("template_type", { length: 50 }).notNull(), // government_letter, application_form, complaint_form
  fields: jsonb("fields").notNull(), // structured field definitions
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  departmentCode: varchar("department_code", { length: 50 }),
  version: varchar("version", { length: 20 }).default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications system for user alerts
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  titleMarathi: varchar("title_marathi", { length: 200 }),
  message: text("message").notNull(),
  messageMarathi: text("message_marathi"),
  type: varchar("type", { length: 50 }).notNull(), // info, warning, error, success
  category: varchar("category", { length: 50 }).notNull(), // document, workflow, system, ai_processing
  relatedEntityId: uuid("related_entity_id"), // document ID, workflow ID, etc.
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // document, workflow, user
  isRead: boolean("is_read").default(false),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  actionUrl: varchar("action_url", { length: 500 }),
  metadata: jsonb("metadata"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved searches for quick access
export const savedSearches = pgTable("saved_searches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameMarathi: varchar("name_marathi", { length: 100 }),
  searchQuery: jsonb("search_query").notNull(), // filters, sort, etc.
  isPublic: boolean("is_public").default(false),
  category: varchar("category", { length: 50 }).default("general"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document tags for better organization
export const documentTags = pgTable("document_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  tagName: varchar("tag_name", { length: 100 }).notNull(),
  tagNameMarathi: varchar("tag_name_marathi", { length: 100 }),
  tagColor: varchar("tag_color", { length: 20 }).default("#3B82F6"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bulk operations tracking
export const bulkOperations = pgTable("bulk_operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  operationType: varchar("operation_type", { length: 50 }).notNull(), // bulk_update, bulk_delete, bulk_export
  totalItems: integer("total_items").notNull(),
  processedItems: integer("processed_items").default(0),
  failedItems: integer("failed_items").default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  criteria: jsonb("criteria"), // selection criteria
  results: jsonb("results"), // operation results
  errorLog: text("error_log"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFieldConfigurationSchema = createInsertSchema(fieldConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCloudStorageSchema = createInsertSchema(cloudStorage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTagSchema = createInsertSchema(documentTags).omit({
  id: true,
  createdAt: true,
});

export const insertBulkOperationSchema = createInsertSchema(bulkOperations).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertFieldConfiguration = z.infer<typeof insertFieldConfigurationSchema>;
export type FieldConfiguration = typeof fieldConfigurations.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertCloudStorage = z.infer<typeof insertCloudStorageSchema>;
export type CloudStorage = typeof cloudStorage.$inferSelect;

// AI API Integration Types
export type AIApiEndpoint = typeof aiApiEndpoints.$inferSelect;
export type InsertAIApiEndpoint = typeof aiApiEndpoints.$inferInsert;
export type AIApiUsage = typeof aiApiUsage.$inferSelect;
export type InsertAIApiUsage = typeof aiApiUsage.$inferInsert;
export type OCRResult = typeof ocrResults.$inferSelect;
export type InsertOCRResult = typeof ocrResults.$inferInsert;
export type DocumentAnalysis = typeof documentAnalysis.$inferSelect;
export type InsertDocumentAnalysis = typeof documentAnalysis.$inferInsert;
export type AIModelPerformance = typeof aiModelPerformance.$inferSelect;
export type InsertAIModelPerformance = typeof aiModelPerformance.$inferInsert;
export type DocumentWorkflow = typeof documentWorkflow.$inferSelect;
export type InsertDocumentWorkflow = typeof documentWorkflow.$inferInsert;

// New feature types
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = z.infer<typeof insertDocumentTagSchema>;
export type BulkOperation = typeof bulkOperations.$inferSelect;
export type InsertBulkOperation = z.infer<typeof insertBulkOperationSchema>;

// Digital Signature Tables
export const digitalSignatures = pgTable("digital_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  signerId: varchar("signer_id").notNull().references(() => users.id),
  signerName: varchar("signer_name").notNull(),
  signerEmail: varchar("signer_email").notNull(),
  signerRole: varchar("signer_role").notNull(),
  signatureType: varchar("signature_type").notNull(), // "digital", "electronic", "biometric"
  signatureData: text("signature_data").notNull(), // Base64 encoded signature image or hash
  signatureMethod: varchar("signature_method").notNull(), // "canvas", "image_upload", "certificate"
  certificateInfo: jsonb("certificate_info"), // Digital certificate details
  signatureHash: varchar("signature_hash").notNull(), // SHA-256 hash for verification
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  location: jsonb("location"), // GPS coordinates if available
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  verificationStatus: varchar("verification_status").default("pending"), // "pending", "verified", "failed"
  isValid: boolean("is_valid").default(true),
  metadata: jsonb("metadata").default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const signatureWorkflows = pgTable("signature_workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  workflowName: varchar("workflow_name").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // "pending", "in_progress", "completed", "cancelled"
  signatureOrder: jsonb("signature_order").notNull(), // Array of signer IDs in order
  currentStep: integer("current_step").default(0),
  totalSteps: integer("total_steps").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  settings: jsonb("settings").default('{}'), // Workflow configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const signatureRequests = pgTable("signature_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowId: uuid("workflow_id").notNull().references(() => signatureWorkflows.id, { onDelete: "cascade" }),
  documentId: uuid("document_id").notNull().references(() => documents.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  signerId: varchar("signer_id").notNull().references(() => users.id),
  signerEmail: varchar("signer_email").notNull(),
  signerName: varchar("signer_name").notNull(),
  status: varchar("status").default("pending"), // "pending", "sent", "viewed", "signed", "declined", "expired"
  signatureType: varchar("signature_type").default("digital"),
  signaturePosition: jsonb("signature_position"), // X, Y coordinates and page number
  isRequired: boolean("is_required").default(true),
  message: text("message"),
  accessToken: varchar("access_token").unique(),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  reminderCount: integer("reminder_count").default(0),
  lastReminderAt: timestamp("last_reminder_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const signatureTemplates = pgTable("signature_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  nameMarathi: varchar("name_marathi"),
  description: text("description"),
  templateType: varchar("template_type").notNull(), // "government", "legal", "administrative"
  signerRoles: jsonb("signer_roles").notNull(), // Array of required roles
  signatureFields: jsonb("signature_fields").notNull(), // Predefined signature positions
  approvalFlow: jsonb("approval_flow").notNull(), // Sequential or parallel signing
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const signatureAuditLogs = pgTable("signature_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id),
  signatureId: uuid("signature_id").references(() => digitalSignatures.id),
  workflowId: uuid("workflow_id").references(() => signatureWorkflows.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // "created", "signed", "verified", "declined", "expired"
  details: jsonb("details").default('{}'),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas for digital signatures
export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

export const insertSignatureWorkflowSchema = createInsertSchema(signatureWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertSignatureRequestSchema = createInsertSchema(signatureRequests).omit({
  id: true,
  accessToken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignatureTemplateSchema = createInsertSchema(signatureTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignatureAuditLogSchema = createInsertSchema(signatureAuditLogs).omit({
  id: true,
  timestamp: true,
});

// Digital signature types
export type DigitalSignature = typeof digitalSignatures.$inferSelect;
export type InsertDigitalSignature = z.infer<typeof insertDigitalSignatureSchema>;
export type SignatureWorkflow = typeof signatureWorkflows.$inferSelect;
export type InsertSignatureWorkflow = z.infer<typeof insertSignatureWorkflowSchema>;
export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertSignatureRequest = z.infer<typeof insertSignatureRequestSchema>;
export type SignatureTemplate = typeof signatureTemplates.$inferSelect;
export type InsertSignatureTemplate = z.infer<typeof insertSignatureTemplateSchema>;
export type SignatureAuditLog = typeof signatureAuditLogs.$inferSelect;
export type InsertSignatureAuditLog = z.infer<typeof insertSignatureAuditLogSchema>;
