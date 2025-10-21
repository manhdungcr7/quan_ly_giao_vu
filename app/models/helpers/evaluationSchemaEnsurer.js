const CREATE_STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS evaluation_criteria (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        category ENUM('teaching','research','service','professional','other') NOT NULL DEFAULT 'teaching',
        measurement_type ENUM('numeric','percentage','grade','boolean','text') NOT NULL DEFAULT 'numeric',
        min_value DECIMAL(10,2) NULL,
        max_value DECIMAL(10,2) NULL,
        unit VARCHAR(50) NULL,
        weight DECIMAL(5,2) NOT NULL DEFAULT 0,
        is_required BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active),
        INDEX idx_order (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS evaluation_periods (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        semester TINYINT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        evaluation_deadline DATE NULL,
        status ENUM('draft','active','closed','archived') DEFAULT 'draft',
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_year (academic_year),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS evaluation_period_criteria (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        period_id INT UNSIGNED NOT NULL,
        criteria_id INT UNSIGNED NOT NULL,
        weight DECIMAL(5,2) NOT NULL DEFAULT 0,
        target_value DECIMAL(10,2) NULL,
        excellent_value DECIMAL(10,2) NULL,
        is_required BOOLEAN DEFAULT FALSE,
        notes TEXT NULL,
        UNIQUE KEY unique_period_criteria (period_id, criteria_id),
        INDEX idx_period (period_id),
        INDEX idx_criteria (criteria_id),
        CONSTRAINT fk_epc_period FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
        CONSTRAINT fk_epc_criteria FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS staff_evaluations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        staff_id INT UNSIGNED NOT NULL,
        period_id INT UNSIGNED NOT NULL,
        criteria_id INT UNSIGNED NOT NULL,
        self_assessment_value DECIMAL(10,2) NULL,
        self_assessment_note TEXT NULL,
        self_assessment_date DATETIME NULL,
        manager_assessment_value DECIMAL(10,2) NULL,
        manager_assessment_note TEXT NULL,
        manager_id INT UNSIGNED NULL,
        manager_assessment_date DATETIME NULL,
        final_value DECIMAL(10,2) NULL,
        grade ENUM('excellent','good','average','poor') NULL,
        evidence_files JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_evaluation (staff_id, period_id, criteria_id),
        INDEX idx_staff (staff_id),
        INDEX idx_period (period_id),
        INDEX idx_grade (grade),
        CONSTRAINT fk_se_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        CONSTRAINT fk_se_period FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
        CONSTRAINT fk_se_criteria FOREIGN KEY (criteria_id) REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
        CONSTRAINT fk_se_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    `CREATE TABLE IF NOT EXISTS staff_evaluation_summary (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        staff_id INT UNSIGNED NOT NULL,
        period_id INT UNSIGNED NOT NULL,
        total_score DECIMAL(6,2) NULL,
        final_grade ENUM('excellent','good','average','poor','incomplete') NULL,
        ranking_in_department INT NULL,
        ranking_in_school INT NULL,
        strengths TEXT NULL,
        weaknesses TEXT NULL,
        recommendations TEXT NULL,
        self_assessment_submitted BOOLEAN DEFAULT FALSE,
        manager_review_completed BOOLEAN DEFAULT FALSE,
        final_approved BOOLEAN DEFAULT FALSE,
        approved_by INT UNSIGNED NULL,
        approved_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_summary (staff_id, period_id),
        INDEX idx_summary_staff (staff_id),
        INDEX idx_summary_period (period_id),
        CONSTRAINT fk_ses_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        CONSTRAINT fk_ses_period FOREIGN KEY (period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
        CONSTRAINT fk_ses_approved FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

let schemaEnsured = false;
let lastAttemptAt = 0;

const RETRY_WINDOW_MS = 60 * 1000;

async function ensureEvaluationSchema(db, force = false) {
    if (!db || typeof db.query !== 'function') {
        return false;
    }

    const now = Date.now();
    if (!force) {
        if (schemaEnsured) {
            return true;
        }
        if (lastAttemptAt && now - lastAttemptAt < RETRY_WINDOW_MS) {
            return false;
        }
    }

    lastAttemptAt = now;

    try {
        for (const statement of CREATE_STATEMENTS) {
            await db.query(statement);
        }
        schemaEnsured = true;
        return true;
    } catch (error) {
        console.warn('ensureEvaluationSchema: unable to create evaluation tables:', error.message);
        schemaEnsured = false;
        return false;
    }
}

function resetEvaluationSchemaCache() {
    schemaEnsured = false;
    lastAttemptAt = 0;
}

module.exports = {
    ensureEvaluationSchema,
    resetEvaluationSchemaCache
};
