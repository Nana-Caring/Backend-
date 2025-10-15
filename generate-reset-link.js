// Generate a test reset link using the production endpoint
const http = require('http');

async function generateTestResetLink() {
  console.log('🧪 Generating test reset link...\n');
  
  const postData = JSON.stringify({
    email: 'princengwakomashumu@gmail.com'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('✅ Reset email request sent successfully!');
          console.log('📨 Response:', JSON.stringify(jsonData, null, 2));
          console.log('\n📧 Check your email for the reset link!');
          console.log('📱 Email: princengwakomashumu@gmail.com');
          console.log('⏰ Link expires in 10 minutes');
          resolve(jsonData);
        } catch (error) {
          console.log('❌ Error:', responseData);
          reject(new Error(responseData));
        }
      });
    });

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running on localhost:5000');
        console.log('💡 Make sure your backend server is started');
      }
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Also create a function to check server logs
async function checkResetToken() {
  console.log('🔍 To get the reset token from server logs:');
  console.log('1. Check your terminal where the backend server is running');
  console.log('2. Look for the log: "✅ Password reset email sent successfully"');
  console.log('3. The reset URL will be in the email sent to your Gmail');
  console.log('\n🌐 Your reset link should look like:');
  console.log('https://password-reset-29wr.onrender.com/reset-password?token=...&email=...');
}

// Run the test
generateTestResetLink()
  .then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('1. Check your Gmail inbox for the reset email');
    console.log('2. Click the reset link in the email');
    console.log('3. If the link shows "Not Found", your frontend needs a /reset-password route');
    checkResetToken();
  })
  .catch((error) => {
    console.log('❌ Test failed:', error.message);
  });
