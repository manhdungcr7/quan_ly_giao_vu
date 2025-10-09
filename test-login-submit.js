// Complete test: login first, then submit document form
const axios = require('axios');
const FormData = require('form-data');

// Create axios instance to preserve cookies
const client = axios.create({
    baseURL: 'http://localhost:3000',
    validateStatus: () => true, // Accept any status
    maxRedirects: 0 // Don't follow redirects automatically
});

async function loginAndSubmitForm() {
    try {
        console.log('🔐 Step 1: Logging in...');
        
        // First, get login page to establish session
        const loginPageResp = await client.get('/auth/login');
        console.log('📄 Login page status:', loginPageResp.status);
        
        // Extract cookies from login page
        let cookies = '';
        if (loginPageResp.headers['set-cookie']) {
            cookies = loginPageResp.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
        }
        
        // Submit login form (use URLSearchParams for form-encoded data)
        const loginData = new URLSearchParams();
        loginData.append('username', 'admin');
        loginData.append('password', 'Admin@123');
        
        const loginResp = await client.post('/auth/login', loginData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies
            }
        });
        
        console.log('🔑 Login response status:', loginResp.status);
        
        // Update cookies after login
        if (loginResp.headers['set-cookie']) {
            const newCookies = loginResp.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
            cookies = cookies ? cookies + '; ' + newCookies : newCookies;
        }
        
        if (loginResp.status === 302 && loginResp.headers.location === '/dashboard') {
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed:', loginResp.data);
            return;
        }
        
        console.log('📝 Step 2: Submitting document form...');
        
        // Now submit the document form with authenticated session
        const docForm = new FormData();
        docForm.append('direction', 'incoming');
        docForm.append('document_number', '54/CV-TEST');
        docForm.append('title', 'Văn bản test authentication');
        docForm.append('type_id', '1');
        docForm.append('content_summary', 'Test văn bản với authentication hợp lệ');
        docForm.append('issue_date', '2025-09-30');
        docForm.append('processing_deadline', '2025-10-15');
        docForm.append('priority', 'medium');
        docForm.append('assigned_to', '1');
        docForm.append('from_org_id', '1');
        docForm.append('chi_dao', 'Test chỉ đạo');
        
        const docResp = await client.post('/documents', docForm, {
            headers: {
                ...docForm.getHeaders(),
                'Cookie': cookies
            }
        });
        
        console.log('📤 Document submission status:', docResp.status);
        console.log('📍 Redirect location:', docResp.headers.location);
        
        if (docResp.status === 302 && docResp.headers.location?.includes('/documents/')) {
            console.log('✅ Document created successfully!');
        } else {
            console.log('❌ Document creation failed');
            if (docResp.data) {
                console.log('Response:', docResp.data);
            }
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('🔌 Server not running on localhost:3000');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

loginAndSubmitForm();