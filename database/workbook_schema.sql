-- Tạo bảng workbooks (sổ tay công tác)
CREATE TABLE IF NOT EXISTS `workbooks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `approver_id` int unsigned DEFAULT NULL COMMENT 'Người duyệt được chỉ định',
  `week_start` date NOT NULL COMMENT 'Ngày bắt đầu tuần (thứ 2)',
  `week_end` date NOT NULL COMMENT 'Ngày kết thúc tuần (chủ nhật)',
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft' COMMENT 'Trạng thái: bản nháp, đã gửi, đã duyệt, từ chối',
  `quick_notes` longtext COMMENT 'Ghi chú nhanh cho tuần',
  `approval_requested_at` datetime DEFAULT NULL COMMENT 'Thời điểm gửi duyệt',
  `approval_decision_at` datetime DEFAULT NULL COMMENT 'Thời điểm người duyệt ra quyết định',
  `approval_note` varchar(255) DEFAULT NULL COMMENT 'Nhận xét của người duyệt',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_week` (`user_id`, `week_start`, `week_end`),
  KEY `idx_status` (`status`),
  KEY `idx_approver` (`approver_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sổ tay công tác theo tuần';

-- Tạo bảng workbook_entries (chi tiết công việc từng ngày)
CREATE TABLE IF NOT EXISTS `workbook_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `workbook_id` int unsigned NOT NULL,
  `day_of_week` tinyint(1) NOT NULL COMMENT 'Thứ trong tuần: 1=Thứ 2, 2=Thứ 3, ..., 7=Chủ nhật',
  `main_focus` text COMMENT 'Mục tiêu chính trong ngày',
  `tasks` longtext COMMENT 'Danh sách công việc cần làm',
  `notes` longtext COMMENT 'Ghi chú bổ sung',
  `progress` tinyint(3) unsigned NOT NULL DEFAULT 0 COMMENT 'Tiến độ hoàn thành (%): 0-100',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_workbook_day` (`workbook_id`, `day_of_week`),
  KEY `idx_day_of_week` (`day_of_week`),
  KEY `idx_progress` (`progress`),
  FOREIGN KEY (`workbook_id`) REFERENCES `workbooks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Chi tiết công việc từng ngày trong tuần';

-- Thêm index để tối ưu query
CREATE INDEX `idx_workbooks_date_range` ON `workbooks` (`week_start`, `week_end`);
CREATE INDEX `idx_workbook_entries_updated` ON `workbook_entries` (`updated_at`);

-- Thêm ràng buộc để đảm bảo logic nghiệp vụ
ALTER TABLE `workbooks` ADD CONSTRAINT `chk_week_dates` CHECK (`week_end` >= `week_start`);
ALTER TABLE `workbook_entries` ADD CONSTRAINT `chk_day_of_week` CHECK (`day_of_week` BETWEEN 1 AND 7);
ALTER TABLE `workbook_entries` ADD CONSTRAINT `chk_progress_range` CHECK (`progress` BETWEEN 0 AND 100);