-- Enhancement for Legal Documents Module
-- Add new fields and audit log table

-- Add new fields to legal_documents table (check first to avoid errors)
SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND column_name = 'signer_name') = 0,
  'ALTER TABLE `legal_documents` ADD COLUMN `signer_name` varchar(255) DEFAULT NULL COMMENT ''Người ký'' AFTER `related_documents`',
  'SELECT ''Column signer_name already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND column_name = 'signer_position') = 0,
  'ALTER TABLE `legal_documents` ADD COLUMN `signer_position` varchar(255) DEFAULT NULL COMMENT ''Chức vụ người ký'' AFTER `signer_name`',
  'SELECT ''Column signer_position already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND column_name = 'version') = 0,
  'ALTER TABLE `legal_documents` ADD COLUMN `version` int(11) DEFAULT 1 COMMENT ''Phiên bản văn bản'' AFTER `signer_position`',
  'SELECT ''Column version already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Modify status enum
ALTER TABLE `legal_documents` 
  MODIFY COLUMN `status` enum('Dự thảo','Còn hiệu lực','Hết hiệu lực','Bị thay thế','Đã hủy') DEFAULT 'Dự thảo';

-- Create audit log table for legal documents
CREATE TABLE IF NOT EXISTS `legal_document_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `document_id` int(11) NOT NULL,
  `action` enum('Tạo mới','Cập nhật','Xóa','Tải xuống','Xem','Upload file','Xóa file') NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL COMMENT 'Tên người thực hiện',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP address',
  `user_agent` text DEFAULT NULL COMMENT 'Browser info',
  `old_values` text DEFAULT NULL COMMENT 'Giá trị cũ (JSON)',
  `new_values` text DEFAULT NULL COMMENT 'Giá trị mới (JSON)',
  `details` text DEFAULT NULL COMMENT 'Chi tiết thao tác',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_document_id` (`document_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_audit_document` FOREIGN KEY (`document_id`) REFERENCES `legal_documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký hoạt động văn bản pháp lý';

-- Add version tracking for file attachments (check first)
SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND column_name = 'version') = 0,
  'ALTER TABLE `legal_document_attachments` ADD COLUMN `version` int(11) DEFAULT 1 COMMENT ''Phiên bản file'' AFTER `mime_type`',
  'SELECT ''Column version already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND column_name = 'is_current') = 0,
  'ALTER TABLE `legal_document_attachments` ADD COLUMN `is_current` tinyint(1) DEFAULT 1 COMMENT ''1=phiên bản hiện tại, 0=phiên bản cũ'' AFTER `version`',
  'SELECT ''Column is_current already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND column_name = 'replaced_by') = 0,
  'ALTER TABLE `legal_document_attachments` ADD COLUMN `replaced_by` int(11) DEFAULT NULL COMMENT ''ID file thay thế'' AFTER `is_current`',
  'SELECT ''Column replaced_by already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND column_name = 'download_count') = 0,
  'ALTER TABLE `legal_document_attachments` ADD COLUMN `download_count` int(11) DEFAULT 0 COMMENT ''Số lần tải xuống'' AFTER `replaced_by`',
  'SELECT ''Column download_count already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes for version tracking
SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND index_name = 'idx_version') = 0,
  'ALTER TABLE `legal_document_attachments` ADD INDEX `idx_version` (`document_id`, `version`)',
  'SELECT ''Index idx_version already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_document_attachments' 
   AND index_name = 'idx_is_current') = 0,
  'ALTER TABLE `legal_document_attachments` ADD INDEX `idx_is_current` (`is_current`)',
  'SELECT ''Index idx_is_current already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing data
UPDATE `legal_documents` SET `status` = 'Còn hiệu lực' WHERE `status` = 'Còn hiệu lực';
UPDATE `legal_document_attachments` SET `is_current` = 1 WHERE `is_current` IS NULL;

-- Create view for easy querying
CREATE OR REPLACE VIEW `v_legal_documents_full` AS
SELECT 
  ld.*,
  u1.username as created_by_username,
  u2.username as updated_by_username,
  COUNT(DISTINCT lda.id) as attachment_count,
  SUM(CASE WHEN lda.is_current = 1 THEN 1 ELSE 0 END) as current_attachment_count,
  GROUP_CONCAT(DISTINCT CASE WHEN lda.is_current = 1 THEN lda.mime_type END) as file_types
FROM legal_documents ld
LEFT JOIN users u1 ON ld.created_by = u1.id
LEFT JOIN users u2 ON ld.updated_by = u2.id
LEFT JOIN legal_document_attachments lda ON ld.id = lda.document_id
GROUP BY ld.id;

-- Add fulltext search for better performance
SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND index_name = 'idx_fulltext_search') > 0,
  'ALTER TABLE `legal_documents` DROP INDEX `idx_fulltext_search`',
  'SELECT ''Index does not exist'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `legal_documents` 
  ADD FULLTEXT INDEX `idx_fulltext_search` (`document_number`, `title`, `summary`, `keywords`, `subject`);

-- Create index for advanced search
SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND index_name = 'idx_advanced_search') = 0,
  'CREATE INDEX `idx_advanced_search` ON `legal_documents` (`document_type`, `status`, `issue_date`, `effective_date`)',
  'SELECT ''Index idx_advanced_search already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @query = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE table_schema = DATABASE() 
   AND table_name = 'legal_documents' 
   AND index_name = 'idx_signer') = 0,
  'CREATE INDEX `idx_signer` ON `legal_documents` (`signer_name`)',
  'SELECT ''Index idx_signer already exists'''
));
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
