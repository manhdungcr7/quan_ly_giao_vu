INSERT INTO roles (name, description, permissions) VALUES
('admin', 'System Administrator', '["all"]'),
('staff', 'Staff Member', '["read", "write_own"]'),
('lecturer', 'Lecturer', '["read", "write_own", "teach"]'),
('viewer', 'Read Only', '["read"]'),
('guest', 'Guest account with limited permissions', '["read"]'),
('department_head', 'Trưởng khoa', '["read", "write_own", "approve_department"]'),
('deputy_department_head', 'Phó trưởng khoa', '["read", "write_own", "assist_department"]'),
('board', 'Ban giám hiệu', '["read", "write_own", "approve_all"]');
