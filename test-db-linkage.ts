import { config as dotenvConfig } from 'dotenv';
import { storage } from './server/storage';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import * as schema from './shared/schema';

// Load environment variables
dotenvConfig();

neonConfig.webSocketConstructor = ws;

async function testDatabaseLinkage() {
  try {
    console.log('🧪 Testing Database Linkage...\n');

    // Test direct database connection
    console.log('1. Testing Direct Database Connection...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('   ✅ Direct database connection successful');

    // Test storage layer operations
    console.log('\n2. Testing Storage Layer Operations...');

    // Test user operations
    console.log('\n   a. Testing User Operations...');
    const testUser = await storage.upsertUser({
      id: 'test-user-456',
      email: 'test2@example.com',
      firstName: 'Test2',
      lastName: 'User2',
      profileImageUrl: null
    });
    console.log('      ✅ User created:', testUser.email);

    const retrievedUser = await storage.getUser('test-user-456');
    console.log('      ✅ User retrieved:', retrievedUser?.email);

    // Test document operations
    console.log('\n   b. Testing Document Operations...');
    const testDoc = await storage.createDocument({
      fileName: 'test.pdf',
      originalFileName: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      filePath: '/tmp/test.pdf',
      uploadedBy: testUser.id,
      status: 'pending',
      letterType: 'general',
      subject: 'Test Document'
    });
    console.log('      ✅ Document created:', testDoc.id);

    const retrievedDoc = await storage.getDocument(testDoc.id);
    console.log('      ✅ Document retrieved:', retrievedDoc?.fileName);

    // Test AI endpoint operations
    console.log('\n   c. Testing AI Endpoint Operations...');
    const endpoints = await storage.getAiApiEndpoints();
    console.log('      ✅ Retrieved', endpoints.length, 'AI endpoints');
    endpoints.forEach(endpoint => {
      console.log(`      - ${endpoint.provider}: ${endpoint.model}`);
    });

    // Test digital signature operations
    console.log('\n   d. Testing Digital Signature Operations...');
    const signature = await storage.createDigitalSignature({
      documentId: testDoc.id,
      signerId: testUser.id,
      signerName: `${testUser.firstName} ${testUser.lastName}`,
      signerEmail: testUser.email,
      signerRole: 'user',
      signatureType: 'digital',
      signatureData: 'test-signature',
      signatureMethod: 'test',
      signatureHash: 'test-hash',
      ipAddress: '127.0.0.1',
      userAgent: 'test-agent'
    });
    console.log('      ✅ Digital signature created:', signature.id);

    const signatures = await storage.getDigitalSignatures(testDoc.id);
    console.log('      ✅ Retrieved', signatures.length, 'signatures for document');

    // Test workflow operations
    console.log('\n   e. Testing Workflow Operations...');
    const workflow = await storage.createDocumentWorkflow({
      documentId: testDoc.id,
      status: 'pending',
      workflowType: 'approval',
      workflowStep: 'initial',
      assignedTo: testUser.id,
      priority: 'normal'
    });
    console.log('      ✅ Workflow created:', workflow.id);

    const workflows = await storage.getDocumentWorkflow(testDoc.id);
    console.log('      ✅ Retrieved', workflows.length, 'workflows for document');

    // Test analytics
    console.log('\n   f. Testing Analytics Operations...');
    const docStats = await storage.getDocumentStats();
    console.log('      ✅ Document stats:', JSON.stringify(docStats));

    const userStats = await storage.getUserStats();
    console.log('      ✅ User stats:', JSON.stringify(userStats));

    // Clean up test data
    console.log('\n3. Cleaning up test data...');
    // Delete in correct order to handle foreign key constraints
    await db.execute(sql`DELETE FROM digital_signatures WHERE document_id = ${testDoc.id} OR signer_id = ${testUser.id}`);
    await db.execute(sql`DELETE FROM document_workflow WHERE document_id = ${testDoc.id} OR assigned_to = ${testUser.id}`);
    await db.execute(sql`DELETE FROM documents WHERE id = ${testDoc.id} OR uploaded_by = ${testUser.id}`);
    await db.execute(sql`DELETE FROM users WHERE id = ${testUser.id}`);
    console.log('   ✅ Test data cleaned up');

    await pool.end();
    console.log('\n🎉 Database linkage testing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database linkage test failed:', error);
    process.exit(1);
  }
}

testDatabaseLinkage();
