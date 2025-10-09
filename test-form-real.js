// Test form submission with actual form data
const axios = require('axios');
const FormData = require('form-data');

async function testFormSubmission() {
    try {
        console.log('🧪 Testing form submission to /documents...');
        
        // Create form data matching the screenshot
        const form = new FormData();
        form.append('direction', 'incoming');
        form.append('document_number', '54/CV');
        form.append('title', 'vvvvvvv');
        form.append('type_id', '1'); // Document type
        form.append('content_summary', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
        form.append('issue_date', '2025-02-10');
        form.append('received_date', ''); // Empty in form
        form.append('processing_deadline', '2025-02-10');
        form.append('priority', 'medium'); // "Bình thường"
        form.append('assigned_to', '1'); // "Quản trị viên"
        form.append('from_org_id', '1'); // "Ban Giám hiệu" 
        form.append('to_org_id', '');
        form.append('chi_dao', 'Lộc xử lý');
        
        const response = await axios.post('http://localhost:3000/documents', form, {
            headers: {
                ...form.getHeaders(),
                'Cookie': 'connect.sid=s%3AyourSessionId' // Would need real session
            },
            maxRedirects: 0, // Don't follow redirects to see response
            validateStatus: () => true // Accept any status
        });
        
        console.log('📤 Response status:', response.status);
        console.log('📍 Response headers:', response.headers.location);
        
        if (response.status === 302) {
            console.log('✅ Form submitted successfully (redirect)');
        } else {
            console.log('❌ Unexpected response:', response.data);
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('🔌 Server not running on localhost:3000');
            console.log('💡 Start server first: npm run dev');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testFormSubmission();