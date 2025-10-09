const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testLegalDocumentSubmit() {
    try {
        console.log('🔍 Testing Legal Document Submit...\n');

        // Step 1: Login to get session cookie
        console.log('Step 1: Login...');
        const loginResponse = await axios.post('http://localhost:3002/login', {
            username: 'admin',
            password: 'admin123'
        }, {
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            }
        });

        const cookies = loginResponse.headers['set-cookie'];
        console.log('✅ Login successful');
        console.log('Cookies:', cookies ? 'Received' : 'Not received\n');

        if (!cookies) {
            console.error('❌ No cookies received from login');
            return;
        }

        // Step 2: Submit legal document form (without files first)
        console.log('\nStep 2: Submit legal document form...');
        
        const formData = {
            document_number: 'TEST-001-2025',
            title: 'Quy định test chức năng module',
            document_type: 'Quy định',
            issuing_authority: 'Phòng CNTT',
            issue_date: '2025-01-10',
            effective_date: '2025-01-15',
            status: 'Dự thảo',
            subject: 'Testing',
            summary: 'Đây là văn bản test',
            keywords: 'test, demo',
            signer_name: 'Nguyễn Văn A',
            signer_position: 'Trưởng phòng'
        };

        const submitResponse = await axios.post(
            'http://localhost:3002/legal-documents',
            formData,
            {
                headers: {
                    'Cookie': cookies.join('; '),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 400;
                }
            }
        );

        console.log('Status:', submitResponse.status);
        console.log('Headers:', submitResponse.headers);
        
        if (submitResponse.status === 302 || submitResponse.status === 301) {
            console.log('✅ Form submitted - Redirect to:', submitResponse.headers.location);
        } else {
            console.log('Response data:', submitResponse.data);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
    }
}

testLegalDocumentSubmit();
