-- V5__create_permissions_table.sql
-- 1. permissions
create table if not exists permissions (
	id int auto_increment primary key,
    name varchar(50) not null unique,
    description text
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 2. role_permissions
create table if not exists role_permissions (
	role_id int not null,
    permission_id int not null,
    primary key(role_id, permission_id),
    constraint fk_rp_role foreign key (role_id) references roles(id),
    constraint fk_rp_permission foreign key (permission_id) references permissions(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 