
ALTER TABLE suppliers
ADD CONSTRAINT fk_supplier_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL,
   

ADD CONSTRAINT fk_supplier_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id)
    ON DELETE SET NULL;
   


ALTER TABLE supplier_product_price
ADD CONSTRAINT fk_spp_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON DELETE CASCADE,
   

ADD CONSTRAINT fk_spp_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE,
   

ADD CONSTRAINT fk_spp_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL;
  

INSERT INTO suppliers
(supplier_code, name, contact_name, email, phone, address, tax_id, payment_terms, rating, created_by)
VALUES

-- SUPPLIER 1: Nhà cung cấp hiện có (TP.HCM)
('SUP_001',                                    
 'Công Ty Cổ Phần Cung Cấp Hàng A',          
 'Nguyễn Văn A',                              
 'contact@supplier-a.com',               
 '0901234567',                               
 '123 Nguyễn Huệ, Quận 1, TP.HCM',          
 '0123456789',                      -- Mã số thuế             
 'NET30',                                     
 5.0,                                        
 1),                                         



-- SUPPLIER 2: Nhà cung cấp hiện có (Hà Nội)
('SUP_002',
 'Công Ty Cổ Phần Cung Cấp Hàng B',
 'Trần Thị B',
 'contact@supplier-b.com',
 '0987654321',                                  
 '456 Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội',
 '0987654321',                              -- Mã số thuế
 'COD',                                       -- Điều khoản: Thanh toán khi nhận hàng
 4.5,                                        
 1),

-- SUPPLIER 3: Nhà cung cấp mới (TP.HCM)
('SUP_003',
 'Công Ty Cổ Phần Cung Cấp Hàng C',
 'Phạm Văn C',
 'contact@supplier-c.com',
 '0912345678',
 '789 Đường Lê Lợi, Quận 1, TP.HCM',
 '0912345678',                                  -- Mã số thuế
 'ADVANCE',                                   -- Điều khoản: Thanh toán trước khi giao hàng
 4.0,                                         
 1);

