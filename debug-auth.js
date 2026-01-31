/**
 * Debug Script - Check Cookie Status
 * Run this in browser console to diagnose auth issues
 */

console.log('🔍 Auth Debug Report\n');

// 1. Check cookies
console.log('📋 Current Cookies:');
const cookies = document.cookie;
if (!cookies) {
    console.log('   ❌ NO COOKIES SET');
} else {
    cookies.split(';').forEach(c => {
        console.log(`   ${c.trim()}`);
    });
}

// 2. Check specific auth cookies
console.log('\n🔑 Auth Cookies:');
console.log('   access_token:', cookies.includes('access_token') ? '✅ Present' : '❌ Missing');
console.log('   refresh_token:', cookies.includes('refresh_token') ? '✅ Present' : '❌ Missing');

// 3. Test API endpoint
console.log('\n🌐 Testing Admin Endpoint...');
fetch('/api/v1/admin/mail-config', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'X-Tenant-ID': 'e3253710-d965-42d2-bdf8-4cf3762381c2'
    }
}).then(r => {
    console.log(`   Status: ${r.status} ${r.statusText}`);
    if (r.status === 401) {
        console.log('   ⚠️ 401 = Missing/expired access token');
    } else if (r.status === 403) {
        console.log('   ⚠️ 403 = Permission denied or CSRF');
    } else if (r.status === 200) {
        console.log('   ✅ Success!');
    }
}).catch(e => {
    console.error('   ❌ Error:', e.message);
});

// 4. Check if on HTTPS
console.log('\n🔒 Protocol:');
console.log('   Current:', window.location.protocol);
console.log('   Secure cookies require HTTPS in production');

console.log('\n💡 Next Steps:');
console.log('   1. If no cookies → Login flow broken');
console.log('   2. If only refresh_token → access_token expired, need refresh');
console.log('   3. If 401 on API → Implement token refresh');
