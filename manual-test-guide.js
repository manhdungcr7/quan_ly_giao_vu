// Test form submission manual
console.log('🧪 Test form data preparation...');

const testData = {
    document_number: 'TEST-MANUAL-001-2025',
    title: 'Quy định test thủ công',
    document_type: 'Quy định',
    issuing_authority: 'Phòng CNTT Test',
    issue_date: '2025-01-10',
    effective_date: '2025-01-10',
    status: 'Dự thảo'
};

console.log('✅ Test data ready:');
console.log(JSON.stringify(testData, null, 2));

console.log('\n📝 Instructions for manual testing:');
console.log('1. Open: http://localhost:3003/legal-documents/create');
console.log('2. Fill form with above data');
console.log('3. Click "Lưu văn bản" button');
console.log('4. Check terminal logs for any errors');
console.log('5. Should redirect to show page or list page');

console.log('\n🔍 Check these in browser:');
console.log('- Form fields populated correctly');
console.log('- No JavaScript errors in console');
console.log('- Submit button is clickable');
console.log('- Network tab shows POST request');