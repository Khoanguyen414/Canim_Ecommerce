-- V4__create_invalidated_tokens.sql
create table if not exists invalidated_tokens (
    id bigint auto_increment primary key,
    token varchar(512) not null unique,
    user_email varchar(255),
    reason varchar(255),
    expired_at datetime not null,
    created_at datetime default current_timestamp,
    unique key uq_invalidated_token (token)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
