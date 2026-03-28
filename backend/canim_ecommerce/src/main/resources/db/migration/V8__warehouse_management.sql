-- V8__warehouse_management.sql
create table
    if not exists suppliers (
        id bigint auto_increment primary key,
        code varchar(50)not null unique,
        name varchar(255)not null,
        contact_person varchar(100)not null,
        email varchar(100)not null unique,
        phone varchar(20)not null,
        address TEXTnot null,
        is_active tinyint (1) default 1,
        created_at datetime default current_timestamp,
        updated_at datetime default current_timestamp on update current_timestamp
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

create table
    if not exists inventory_batches (
        id bigint auto_increment primary key,
        product_id bigintnot null,
        batch_code varchar(100)not null,
        quantity_remaining INTnot null default 0,
        import_price DECIMAL(15, 2) default 0,
        expired_at datetime NULL,
        created_at datetime default current_timestamp,
        constraint fk_batch_prod foreign key (product_id) references products (id) on delete cascade
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

create index idx_batch_product_date on inventory_batches (product_id, created_at);

create table
    if not exists inventory_receipts (
        id bigint auto_increment primary key,
        receipt_code varchar(50)not null unique,
        type ENUM ('INBOUND', 'OUTBOUND')not null,
        reason ENUM (
            'PURCHASE',
            'RETURN_TO_SUPPLIER',
            'SALES_ORDER',
            'DAMAGE',
            'STOCKTAKE_ADJUST'
        )not null,
        supplier_id bigint NULL,
        order_id bigint NULL,
        warehouse_staff_id bigint,
        status ENUM ('PENDING', 'COMPLETED', 'CANCELLED') default 'PENDING',
        note TEXT,
        created_at datetime default current_timestamp,
        updated_at datetime default current_timestamp on update current_timestamp,
        constraint fk_receipt_supplier foreign key (supplier_id) references suppliers (id),
        constraint fk_receipt_order foreign key (order_id) references orders (id),
        constraint fk_receipt_staff foreign key (warehouse_staff_id) references users (id)
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

create table
    if not exists inventory_receipt_details (
        id bigint auto_increment primary key,
        receipt_id bigintnot null,
        product_id bigintnot null,
        batch_id bigint NULL,
        quantity INTnot null CHECK (quantity > 0),
        price DECIMAL(15, 2)not null,
        constraint fk_ird_receipt foreign key (receipt_id) references inventory_receipts (id) on delete cascade,
        constraint fk_ird_product foreign key (product_id) references products (id),
        constraint fk_ird_batch foreign key (batch_id) references inventory_batches (id)
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

create table
    if not exists stock_checks (
        id bigint auto_increment primary key,
        code varchar(50)not null unique,
        staff_id bigint,
        check_date datetime default current_timestamp,
        status enum ('DRAFT', 'COMPLETED', 'CANCELLED') default 'DRAFT',
        note TEXT,
        constraint fk_check_staff foreign key (staff_id) references users (id)
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

create table
    if not exists stock_check_details (
        id bigint auto_increment primary key,
        check_id bigintnot null,
        product_id bigintnot null,
        system_quantity INTnot null,
        actual_quantity INTnot null,
        difference INT,
        reason TEXT,
        constraint fk_scd_check foreign key (check_id) references stock_checks (id) on delete cascade,
        constraint fk_scd_product foreign key (product_id) references products (id)
    ) engine = InnoDB default charset = utf8mb4 collate = utf8mb4_unicode_ci;

insert ignore into permissions (name, description)
values
    ('SUPPLIER_READ', 'Xem nhà cung cấp'),
    ('SUPPLIER_MANAGE', 'Thêm sửa xóa nhà cung cấp'),
    ('WAREHOUSE_READ', 'Xem tồn kho và lịch sử'),
    ('WAREHOUSE_IMPORT', 'Tạo phiếu nhập kho'),
    ('WAREHOUSE_EXPORT', 'Tạo phiếu xuất kho'),
    ('WAREHOUSE_STOCKTAKE', 'Thực hiện kiểm kê');

insert ignore into role_permissions (role_id, permission_id)
select
    r.id,
    p.id
from
    roles r,
    permissions p
where
    r.name = 'ROLE_ADMIN'
    and p.name in (
        'SUPPLIER_READ',
        'SUPPLIER_MANAGE',
        'WAREHOUSE_READ',
        'WAREHOUSE_IMPORT',
        'WAREHOUSE_EXPORT',
        'WAREHOUSE_STOCKTAKE'
    );

insert ignore into igmore roles (name)
values
    ('ROLE_WAREHOUSE');

insert ignore into igmore role_permissions (role_id, permission_id)
select
    r.id,
    p.id
from
    roles r,
    permissions p
where
    r.name = 'ROLE_WAREHOUSE'
    and p.name in (
        'PRODUCT_READ',
        'WAREHOUSE_READ',
        'WAREHOUSE_IMPORT',
        'WAREHOUSE_EXPORT',
        'WAREHOUSE_STOCKTAKE',
        'SUPPLIER_READ'
    );