-- Thêm các trường phục vụ quy trình duyệt sổ tay công tác
ALTER TABLE workbooks
  ADD COLUMN approver_id INT UNSIGNED NULL AFTER user_id,
  ADD COLUMN approval_requested_at DATETIME NULL AFTER status,
  ADD COLUMN approval_decision_at DATETIME NULL AFTER approval_requested_at,
  ADD COLUMN approval_note VARCHAR(255) NULL AFTER approval_decision_at;

ALTER TABLE workbooks
  ADD CONSTRAINT fk_workbooks_approver
  FOREIGN KEY (approver_id) REFERENCES users(id)
  ON DELETE SET NULL;

CREATE INDEX idx_workbooks_approver ON workbooks (approver_id);
