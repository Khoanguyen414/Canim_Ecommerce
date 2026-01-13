package com.example.canim_ecommerce.dto.request.suppliers;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public class SupplierCreationRequest {
    
    @NotBlank(message = "Supplier code is required / Mã nhà cung cấp bắt buộc")
    private String supplierCode;  
    
    @NotBlank(message = "Supplier name is required / Tên nhà cung cấp bắt buộc")
    private String name;  
    
    @NotBlank(message = "Contact name is required / Tên liên hệ bắt buộc")
    private String contactName; 
    
    @NotBlank(message = "Email is required / Email bắt buộc")
    @Email(message = "Email should be valid / Email phải hợp lệ")
    private String email;  
    
    private String phone;  
    
    private String address; 
    
    private String taxId;  
    
    @NotBlank(message = "Payment terms is required / Điều khoản thanh toán bắt buộc")
    private String paymentTerms;  // NET30, COD, ADVANCE
    
    @NotNull(message = "Rating is required / Đánh giá bắt buộc")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0 / Đánh giá tối thiểu 1.0")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0 / Đánh giá tối đa 5.0")
    private BigDecimal rating;  // 5.0, 4.5, 4.0
    
    public String getSupplierCode() {
        return supplierCode;
    }
    
    public void setSupplierCode(String supplierCode) {
        this.supplierCode = supplierCode;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getContactName() {
        return contactName;
    }
    
    public void setContactName(String contactName) {
        this.contactName = contactName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    public String getTaxId() {
        return taxId;
    }
    
    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }
    //Đieu khoan thanh toan
    public String getPaymentTerms() {
        return paymentTerms;
    }
    
    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }
    
    public BigDecimal getRating() {
        return rating;
    }
    
    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }
}