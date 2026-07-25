async function testAuth() {
  const baseUrl = 'http://localhost:3000/api/auth';
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Test User';

  console.log(`Testing Registration for ${email}...`);
  try {
    const regRes = await fetch(`${baseUrl}/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    const regData = await regRes.json();
    console.log('Registration Status:', regRes.status);
    console.log('Registration Response:', regData);

    console.log(`\nTesting Login for ${email}...`);
    const loginRes = await fetch(`${baseUrl}/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);
    
    // Check if we get a session token or cookie
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Login Set-Cookie header:', cookies ? 'Present' : 'Not Present');
    if (cookies) {
      console.log(cookies.split(';')[0]); // Print first part of cookie
    }

  } catch (error) {
    console.error('Error during test:', error);
  }
}

testAuth();
