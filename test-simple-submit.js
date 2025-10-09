const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3002';

async function testSubmit() {
    try {
        console.log('🔍 Testing Legal Document Submit (Simple)...\n');

        // Step 1: Login first
        console.log('Step 1: Login to get session cookie...');
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
            username: 'admin',
            password: 'admin123'
        }, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });

        const cookies = loginResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.join('; ') : '';
        console.log('✅ Login successful\n');

        // Step 2: Submit form WITHOUT files (simplest case)
        console.log('Step 2: Submit legal document form (no files)...');
        
        const formData = {
            document_number: 'TEST-SIMPLE-001-2025',
            title: 'Quy định test đơn giản',
            document_type: 'Quy định',
            issuing_authority: 'Phòng CNTT Test',
            status: 'Dự thảo',
            issue_date: '2025-01-10',
            effective_date: '2025-01-10'
        };

        console.log('Data to submit:', JSON.stringify(formData, null, 2));

        const submitResponse = await axios.post(`${BASE_URL}/legal-documents`, formData, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });

        console.log('\n✅ Form submitted successfully!');
        console.log('Response Status:', submitResponse.status);
        console.log('Response Headers:', submitResponse.headers);
        
        if (submitResponse.headers.location) {
            console.log('Redirect to:', submitResponse.headers.location);
        }

    } catch (error) {
        console.error('\n❌ Error occurred:');
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Status Text:', error.response.statusText);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data ? error.response.data.substring(0, 500) : 'No data');
        } else if (error.request) {
            console.error('No response received');
            console.error('Request:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        
        console.error('\nFull error:', error);
    }
}

testSubmit();
