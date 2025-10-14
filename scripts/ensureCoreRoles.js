require('dotenv').config();
const AuthController = require('../app/controllers/AuthController');

async function ensureCoreRoles() {
    console.log('🌱 Ensuring core roles (admin, faculty_lead, lecturer)...');
    const controller = new AuthController();

    try {
        await controller.ensureCoreRoles();
        console.log('✅ Core roles are present and activated.');
    } catch (error) {
        console.error('❌ Failed to ensure core roles:', error.message || error);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    ensureCoreRoles().then(() => {
        // Ensure pending async operations flush before exit
        setTimeout(() => process.exit(process.exitCode || 0), 100);
    });
}

module.exports = ensureCoreRoles;
