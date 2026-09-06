async function testLogin() {
  try {
    console.log("[1] Fetching CSRF Token...");
    const csrfRes = await fetch("http://localhost:3001/api/auth/csrf");
    const csrfData = await csrfRes.json();
    
    // Extract cookies properly
    let rawCookies = csrfRes.headers.get('set-cookie');
    let cookies = rawCookies ? rawCookies.split(',').map(c => c.split(';')[0]).join('; ') : '';
    console.log("CSRF Token:", csrfData.csrfToken);

    console.log("[2] Submitting Login Credentials...");
    const params = new URLSearchParams({
      phone: "0000000000",
      password: "ShopAdmin@2026!",
      csrfToken: csrfData.csrfToken,
      json: "true"
    });

    const loginRes = await fetch("http://localhost:3001/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookies,
      },
      body: params,
      redirect: "manual"
    });

    const loginCookiesRaw = loginRes.headers.get('set-cookie');
    const loginData = await loginRes.json();
    
    if (loginData.url && loginData.url.includes("error")) {
        console.error("❌ Login failed (Credentials rejected)");
        return;
    }

    if (!loginCookiesRaw || !loginCookiesRaw.includes('next-auth.session-token')) {
      console.error("❌ Failed to get session cookie!");
      return;
    }
    console.log("✅ Session token generated and received successfully!");

    // Build the final cookie string
    let finalCookies = loginCookiesRaw.split(',').map(c => c.split(';')[0]).join('; ');

    console.log("[3] Accessing Protected Admin Route (/admin)...");
    const adminRes = await fetch("http://localhost:3001/admin", {
      headers: {
        "Cookie": finalCookies
      },
      redirect: "manual"
    });

    console.log("Admin Route Status Code:", adminRes.status);
    if (adminRes.status === 200) {
      console.log("✅ SUCCESS: Accessed /admin dashboard using the new session!");
    } else {
      console.log("❌ FAILED: Redirected or denied. Status:", adminRes.status);
    }

  } catch (err) {
    console.error("Error during test:", err);
  }
}
testLogin();

