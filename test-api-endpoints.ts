import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testApiEndpoints() {
  try {
    console.log('🧪 Testing API Endpoints...\n');

    // Test 1: Document Upload
    console.log('1. Testing Document Upload...');
    const testFilePath = path.join(__dirname, 'test-document.pdf');
    fs.writeFileSync(testFilePath, 'Test PDF content');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('letterType', 'general');
    formData.append('subject', 'Test Document');
    
    try {
      const uploadResponse = await axios.post(`${BASE_URL}/documents`, formData, {
        headers: {
          ...formData.getHeaders(),
        }
      });
      console.log('   ✅ Document upload endpoint responded:', uploadResponse.status);
      console.log('   Document ID:', uploadResponse.data.id);
      
      // Test document retrieval
      const docResponse = await axios.get(`${BASE_URL}/documents/${uploadResponse.data.id}`);
      console.log('   ✅ Document retrieval successful');
      
      // Test OCR status
      console.log('   Waiting for OCR processing...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const ocrResponse = await axios.get(`${BASE_URL}/documents/${uploadResponse.data.id}/ocr`);
      console.log('   ✅ OCR results retrieved');
      
    } catch (error) {
      console.log('   ⚠️ Document upload test failed:', error.response?.status, error.response?.data);
    }
    
    // Test 2: AI Analysis
    console.log('\n2. Testing AI Analysis...');
    try {
      const analysisResponse = await axios.post(`${BASE_URL}/ai/analyze`, {
        documentId: 'test-doc',
        analysisType: 'summary'
      });
      console.log('   ✅ AI analysis endpoint responded:', analysisResponse.status);
    } catch (error) {
      console.log('   ⚠️ AI analysis test failed:', error.response?.status, error.response?.data);
    }
    
    // Test 3: Digital Signature
    console.log('\n3. Testing Digital Signature Flow...');
    try {
      // Create signature workflow
      const workflowResponse = await axios.post(`${BASE_URL}/signature-workflows`, {
        documentId: 'test-doc',
        signers: ['test-user-123'],
        workflowType: 'sequential'
      });
      console.log('   ✅ Signature workflow created');
      
      // Create signature request
      const requestResponse = await axios.post(`${BASE_URL}/signature-requests`, {
        workflowId: workflowResponse.data.id,
        signerId: 'test-user-123'
      });
      console.log('   ✅ Signature request created');
      
      // Sign document
      const signResponse = await axios.post(`${BASE_URL}/signature-requests/${requestResponse.data.id}/sign`, {
        documentId: 'test-doc',
        signatureData: 'test-signature'
      });
      console.log('   ✅ Document signed successfully');
      
    } catch (error) {
      console.log('   ⚠️ Digital signature test failed:', error.response?.status, error.response?.data);
    }
    
    // Test 4: Error Handling
    console.log('\n4. Testing Error Handling...');
    try {
      await axios.get(`${BASE_URL}/documents/nonexistent-id`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✅ 404 error handled correctly');
      } else {
        console.log('   ⚠️ Unexpected error:', error.response?.status);
      }
    }
    
    // Clean up
    try {
      fs.unlinkSync(testFilePath);
    } catch (error) {
      console.log('   ⚠️ Error cleaning up test file:', error.message);
    }
    
    console.log('\n🎉 API endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

testApiEndpoints();
