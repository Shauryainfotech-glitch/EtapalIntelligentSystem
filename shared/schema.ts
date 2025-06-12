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
