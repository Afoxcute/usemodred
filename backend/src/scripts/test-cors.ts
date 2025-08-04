import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testCors() {
  console.log('🧪 Testing CORS configuration...');
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test health check endpoint
    console.log('\n📋 Testing health check endpoint...');
    const healthResponse = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Health check successful:', healthResponse.data);
    
    // Test CORS endpoint
    console.log('\n📋 Testing CORS endpoint...');
    const corsResponse = await axios.get(`${BACKEND_URL}/api/cors-test`);
    console.log('✅ CORS test successful:', corsResponse.data);
    
    // Test with specific headers
    console.log('\n📋 Testing with CORS headers...');
    const headersResponse = await axios.get(`${BACKEND_URL}/api/cors-test`, {
      headers: {
        'Origin': 'https://usemodred.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('✅ CORS headers test successful:', headersResponse.data);
    
    console.log('\n🎉 All CORS tests passed!');
    
  } catch (error: any) {
    console.error('❌ CORS test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 0) {
      console.log('💡 This might be a CORS issue. Check that:');
      console.log('   1. Backend is running');
      console.log('   2. CORS is properly configured');
      console.log('   3. Frontend origin is allowed');
    }
  }
}

// Run the test
testCors().then(() => {
  console.log('🏁 CORS test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 CORS test failed:', error);
  process.exit(1);
}); 