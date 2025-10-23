-- V2__create_core_tables.sql
-- 1. roles
create table if not exists roles (
	id int auto_increment primary key,
    name varchar(50) not null unique
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 2. users
create table if not exists users (
	id bigint auto_increment primary key,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    full_name varchar(200),
    phone varchar(50),
    is_active tinyint(1) default 1,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 3. user_roles
create table if not exists user_roles (
	user_id bigint not null,
    role_id int not null,
    primary key(user_id, role_id),
    constraint fk_ur_user foreign key (user_id) references users(id) on delete cascade,
    constraint fk_ur_role foreign key (role_id) references roles(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

-- 4. categories
create table if not exists categories (
	id int auto_increment primary key,
    parent_id int default null,
    name varchar(200) not null,
    slug varchar(255) not null unique,
    description text,
    created_at datetime default current_timestamp,
    constraint fk_cat_parent foreign key (parent_id) references categories(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

-- 5. products
create table if not exists products (
	id bigint auto_increment primary key,
    sku varchar(100) unique,
    name varchar(255) not null,
	slug varchar(255) not null unique,
    short_decs varchar(512),
    long_decs text,
    price decimal(12,2) not null,
    brand varchar(100),
    category_id int,
    status enum('active', 'inactive', 'hidden') default 'active',
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,
    constraint fk_prod_category foreign key (category_id) references categories(id) on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

-- 6. product_images
create table if not exists product_images (
	id bigint auto_increment primary key,
    product_id bigint not null,
    url varchar(1024),
    position int default 0,
    is_main tinyint(1) default 0,
    constraint fk_img_prod foreign key (product_id) references products(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

-- 7. inventory
create table if not exists inventory (
	id bigint auto_increment primary key,
    product_id bigint not null,
    sku varchar(100) not null,
    quantity int default 0,
    reserved int default 0,
    updated_at datetime default current_timestamp on update current_timestamp,
    unique key uq_inventory_product_sku (product_id, sku),
    constraint fk_inv_prod foreign key (product_id) references products(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

-- 8. carts + cart_items
create table if not exists carts (
	id bigint auto_increment primary key,
    user_id bigint not null,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,
    constraint fk_cart_user foreign key (user_id) references users(id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci; 

create table if not exists cart_items (
	id bigint auto_increment primary key,
    cart_id bigint not null,
    product_id bigint not null,
    sku varchar(100),
    quantity int not null,
    price decimal(12,2) not null,
    added_at datetime default current_timestamp,
    constraint fk_ci_cart foreign key (cart_id) references carts(id) on delete cascade,
    constraint fk_ci_prod foreign key (product_id) references products(id) 
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- 9. orders + order_items
create table if not exists orders (
	id bigint auto_increment primary key,
    order_no varchar(64) not null unique,
    user_id bigint,
    total_amount decimal(12,2) not null,
    discount_amount decimal(12,2) default 0,
    status enum('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') default 'pending',
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp on update current_timestamp,
    constraint fk_order_user foreign key (user_id) references users(id) 
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists order_items (
	id bigint auto_increment primary key,
    order_id bigint not null,
	product_id bigint not null,
	sku varchar(100),
	quantity int not null,
	price decimal(12,2) not null,
	constraint fk_oi_order foreign key (order_id) references orders(id) on delete cascade,
	constraint fk_oi_prod foreign key (product_id) references products(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

-- Indexes for performance (basic)
create index idx_products_category on products(category_id);
create index idx_inventory_product on inventory(product_id);
create index idx_orders_created_at on orders(created_at);

-- 10. user_events (lightweight for AI later)
create table if not exists user_events (
	id bigint auto_increment primary key,
    user_id bigint,
    product_id bigint,
    event_type enum('view', 'click', 'add_to_cart', 'purchase', 'search') not null,
    event_meta json,
    occurred_at datetime default current_timestamp,
    index idx_event_user_product (user_id, product_id, event_type),
    constraint fk_event_user foreign key (user_id) references users(id),
    constraint fk_event_product foreign key (product_id) references products(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;