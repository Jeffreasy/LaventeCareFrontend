#!/usr/bin/env node

/**
 * Test Login Flow - Debug Script
 * 
 * This script simulates a login request to test cookie handling
 */

const API_URL = 'http://localhost:4321';

async function testLogin() {
    console.log('🔍 Testing Login Flow\n');
    console.log('1. Sending login request...');

    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'jeffrey@laventecare.nl',
            password: 'xX@&BfCqq3x&yC4jMG8m'
        }),
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    // Check for Set-Cookie headers
    console.log('\n2. Checking Set-Cookie headers:');
    const setCookies = response.headers.getSetCookie();

    if (setCookies && setCookies.length > 0) {
        console.log(`   Found ${setCookies.length} cookie(s):`);
        setCookies.forEach((cookie, i) => {
            console.log(`   [${i + 1}] ${cookie.substring(0, 100)}...`);

            // Parse cookie attributes
            const parts = cookie.split(';');
            const cookieName = parts[0].split('=')[0];
            console.log(`       Name: ${cookieName}`);

            if (cookie.includes('HttpOnly')) console.log('       ✓ HttpOnly');
            if (cookie.includes('Secure')) console.log('       ✓ Secure');
            if (cookie.includes('SameSite')) {
                const sameSite = cookie.match(/SameSite=(\w+)/i);
                if (sameSite) console.log(`       ✓ SameSite=${sameSite[1]}`);
            }
        });
    } else {
        console.log('   ❌ NO Set-Cookie headers found!');
    }

    // Check response body
    console.log('\n3. Response body:');
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    console.log('\n4. Testing /admin endpoint with cookies...');
    // Note: fetch doesn't auto-send cookies in Node.js
    // We need to manually extract and send them

    console.log('\n✅ Test complete');
}

testLogin().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
