import { config as dotenvConfig } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
dotenvConfig();

const execAsync = promisify(exec);

async function runAllTests() {
  console.log('🚀 Running Complete Test Suite for EtapalIntelligentSystem\n');
  console.log('=' .repeat(60));

  const tests = [
    {
      name: 'Database Linkage Test',
      command: 'npx tsx test-db-linkage.ts',
      description: 'Testing database connectivity and storage operations'
    },
    {
      name: 'API Endpoints Test',
      command: 'npx tsx test-api-endpoints.ts',
      description: 'Testing API security and endpoint functionality'
    },
    {
      name: 'Frontend Functionality Test',
      command: 'npx tsx test-frontend-functionality.ts',
      description: 'Testing UI, performance, and accessibility'
    }
  ];

  const results: Array<{
    name: string;
    status: 'PASSED' | 'FAILED';
    duration?: string;
    error?: string;
    output: string;
  }> = [];

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log('-'.repeat(50));
    
    try {
      const startTime = Date.now();
      const { stdout, stderr } = await execAsync(test.command);
      const duration = Date.now() - startTime;
      
      console.log(stdout);
      if (stderr && !stderr.includes('ExperimentalWarning')) {
        console.log('⚠️ Warnings:', stderr);
      }
      
      results.push({
        name: test.name,
        status: 'PASSED',
        duration: `${duration}ms`,
        output: stdout
      });
      
      console.log(`✅ ${test.name} completed in ${duration}ms`);
      
    } catch (error: any) {
      console.error(`❌ ${test.name} failed:`, error.message);
      results.push({
        name: test.name,
        status: 'FAILED',
        error: error.message,
        output: error.stdout || ''
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`\n📈 Results: ${passed} passed, ${failed} failed`);
  
  results.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration})` : '';
    console.log(`${icon} ${result.name}${duration}`);
  });

  if (failed === 0) {
    console.log('\n🎉 All tests passed! System is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the output above.');
  }

  console.log('\n📄 Detailed results saved in TEST_RESULTS_SUMMARY.md');
  console.log('🔧 Server is running at http://localhost:5000');
  
  return results;
}

// Run the test suite
runAllTests().catch(console.error);
