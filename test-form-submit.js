// Simple test to check if documents can be created via API
const db = require('./config/database');

async function testCreateDocument() {
    try {
        console.log('🧪 Testing document creation...');
        
        // Create a test document directly in database
        const result = await db.query(`
            INSERT INTO documents (
                direction, document_number, title, type_id, content_summary, 
                issue_date, priority, status, from_org_id, to_org_id, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            'incoming', 'API-TEST-005/2024', 'Văn bản test API', 1, 
            'Đây là test văn bản từ API', '2024-09-30', 'medium', 
            'pending', 1, 2, 1
        ]);
        
        console.log('✅ Document created with ID:', result.insertId);
        
        // Check if it appears in the list
        const docs = await db.findMany('SELECT * FROM documents WHERE direction = ?', ['incoming']);
        console.log('📄 Total incoming documents:', docs.length);
        
        docs.forEach(doc => {
            console.log(`- ${doc.document_number}: ${doc.title} (${doc.status})`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testCreateDocument();