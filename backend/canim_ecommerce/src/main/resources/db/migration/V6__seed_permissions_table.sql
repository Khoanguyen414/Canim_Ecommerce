-- V6__seed_permissions_table.sql
-- permissions
insert ignore into permissions (name, description) 
VALUES 	('USER_READ', 'Xem danh sách người dùng'),
		('USER_CREATE', 'Tạo người dùng mới'),
		('USER_UPDATE', 'Cập nhật thông tin người dùng'),
		('USER_DELETE', 'Xóa người dùng'),
		('ROLE_READ', 'Xem danh sách vai trò'),
		('ROLE_CREATE', 'Tạo vai trò mới'),
		('ROLE_UPDATE', 'Cập nhật vai trò'),
		('ROLE_DELETE', 'Xóa vai trò');

-- role_permissions
insert ignore into role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ROLE_ADMIN';