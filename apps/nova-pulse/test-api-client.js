const { apiClient } = require('./apps/nova-pulse/src/lib/api');

async function testApiClient() {
  try {
    const response = await apiClient.get('/test');
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testApiClient();
