/**
 * Test form submission with file upload for legal documents
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testLegalDocumentSubmit() {
    const baseURL = 'http://localhost:3001';
    
    console.log('=== Testing Legal Document Form Submission ===\n');
    
    try {
        // First, get the login page to obtain session
        console.log('1. Getting login page...');
        const loginPageResponse = await axios.get(`${baseURL}/login`);
        
        // Extract cookies from response
        const cookies = loginPageResponse.headers['set-cookie'] || [];
        const cookieString = cookies.join('; ');
        
        console.log('   Session cookies:', cookieString ? '✓' : '❌');
        
        // Login with admin credentials
        console.log('\n2. Logging in...');
        const loginData = new FormData();
        loginData.append('username', 'admin');
        loginData.append('password', 'admin123');
        
        const loginResponse = await axios.post(`${baseURL}/login`, loginData, {
            headers: {
                ...loginData.getHeaders(),
                'Cookie': cookieString
            },
            maxRedirects: 0,
            validateStatus: (status) => status === 302 || status === 200
        });
        
        console.log('   Login status:', loginResponse.status);
        const sessionCookies = loginResponse.headers['set-cookie'] || [];
        const fullCookieString = [...cookies, ...sessionCookies].join('; ');
        
        // Get create page
        console.log('\n3. Getting create form page...');
        const createPageResponse = await axios.get(`${baseURL}/legal-documents/create`, {
            headers: {
                'Cookie': fullCookieString
            }
        });
        
        console.log('   Create page status:', createPageResponse.status);
        console.log('   Page contains form:', createPageResponse.data.includes('document-form') ? '✓' : '❌');
        console.log('   Page contains file input:', createPageResponse.data.includes('attachments') ? '✓' : '❌');
        
        // Create a test file
        console.log('\n4. Creating test file...');
        const testFilePath = path.join(__dirname, 'test-upload.pdf');
        const testFileContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n213\n%%EOF');
        
        fs.writeFileSync(testFilePath, testFileContent);
        console.log('   Test PDF created:', fs.existsSync(testFilePath) ? '✓' : '❌');
        console.log('   File size:', fs.statSync(testFilePath).size, 'bytes');
        
        // Submit the form
        console.log('\n5. Submitting form with file...');
        const formData = new FormData();
        formData.append('document_number', 'TEST-001/2025');
        formData.append('title', 'Test Document Upload');
        formData.append('document_type', 'Thông báo');
        formData.append('issuing_authority', 'Ban Quản lý Test');
        formData.append('status', 'Dự thảo');
        formData.append('attachments', fs.createReadStream(testFilePath), {
            filename: 'test-upload.pdf',
            contentType: 'application/pdf'
        });
        
        console.log('   Form data prepared with fields:');
        console.log('   - document_number: TEST-001/2025');
        console.log('   - title: Test Document Upload');
        console.log('   - file: test-upload.pdf');
        
        const submitResponse = await axios.post(`${baseURL}/legal-documents`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Cookie': fullCookieString
            },
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });
        
        console.log('\n6. Response analysis:');
        console.log('   Status:', submitResponse.status);
        console.log('   Location header:', submitResponse.headers.location || 'None');
        
        if (submitResponse.status === 302) {
            console.log('   ✓ Redirect response (likely success)');
        } else if (submitResponse.status === 200) {
            console.log('   Form returned (check for errors)');
            if (submitResponse.data.includes('error')) {
                console.log('   ❌ Form contains error messages');
            }
        } else {
            console.log('   ❌ Unexpected status code');
        }
        
        // Clean up
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
            console.log('   Test file cleaned up');
        }
        
        console.log('\n=== Test completed ===');
        
    } catch (error) {
        console.error('\n❌ Test failed:');
        console.error('   Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Headers:', error.response.headers);
            if (error.response.data && typeof error.response.data === 'string') {
                const errorSnippet = error.response.data.substring(0, 500);
                console.error('   Response snippet:', errorSnippet);
            }
        }
        
        // Clean up test file if exists
        const testFilePath = path.join(__dirname, 'test-upload.pdf');
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

// Install axios if not present
try {
    require('axios');
    testLegalDocumentSubmit();
} catch (error) {
    console.log('Installing axios...');
    require('child_process').execSync('npm install axios', { stdio: 'inherit' });
    console.log('Axios installed. Rerun the script.');
}