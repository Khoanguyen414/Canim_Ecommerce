package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.Entity.*;
import com.example.canim_ecommerce.dto.request.OrderRequest;
import com.example.canim_ecommerce.dto.request.OrderItemRequest;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.exception.CustomException;
import com.example.canim_ecommerce.mapper.OrderMapper;
import com.example.canim_ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private InventoryRepository inventoryRepo;
    @Autowired private OrderMapper mapper; // MapStruct

    //Lấy danh sách đơn hàng 
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAll(Pageable pageable) {
        return orderRepo.findAll(pageable).map(mapper::toResponse);
        // mapper::toResponse → tự map Order entity → OrderResponse
    }

    //Lọc theo trạng thái
    @Transactional(readOnly = true)
    public Page<OrderResponse> getByStatus(String status, Pageable pageable) {
        Order.Status s = Order.Status.valueOf(status.toUpperCase());
        return orderRepo.findByStatus(s, pageable).map(mapper::toResponse);
    }

    //Tạo đơn hàng mới (admin tạo hộ khách)
    @Transactional
    public OrderResponse create(OrderRequest request) {
        Order order = mapper.toEntity(request);

        //
        order.setOrderNo(UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        BigDecimal totalAmount = BigDecimal.ZERO;

        //Duyệt từng sản phẩm trong đơn
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepo.findById(itemReq.getProductId())
                    .orElseThrow(() -> new CustomException("Sản phẩm không tồn tại"));

            Inventory inv = inventoryRepo.findByProductId(product.getId());
            if (inv == null || inv.getQuantity() < itemReq.getQuantity()) {
                throw new CustomException("Hết hàng: " + product.getName());
            }

            // Cập nhật tồn kho: trừ số lượng, tăng reserved
            inv.setQuantity(inv.getQuantity() - itemReq.getQuantity());
            inv.setReserved(inv.getReserved() + itemReq.getQuantity());
            inventoryRepo.save(inv);

            // Tạo OrderItem
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setSku(product.getSku());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice() != null ? itemReq.getPrice() : product.getPrice());

            order.getItems().add(item);

            // Cộng dồn tổng tiền
            totalAmount = totalAmount.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        order.setStatus(Order.Status.PAID); // Admin tạo → coi như đã thanh toán
        orderRepo.save(order);

        // Trả về Response đầy đủ (có id, orderNo, createdAt...)
        return mapper.toResponse(order);
    }

    //Cập nhật trạng thái đơn hàng
    @Transactional
    public OrderResponse updateStatus(Long id, String newStatus) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new CustomException("Đơn hàng không tồn tại"));

        Order.Status status = Order.Status.valueOf(newStatus.toUpperCase());
        order.setStatus(status);

        // Khi giao hàng → bỏ reserved
        if (status == Order.Status.SHIPPED) {
            for (OrderItem item : order.getItems()) {
                Inventory inv = inventoryRepo.findByProductId(item.getProduct().getId());
                if (inv != null) {
                    inv.setReserved(inv.getReserved() - item.getQuantity());
                    inventoryRepo.save(inv);
                }
            }
        }

        // Khi hủy → hoàn lại số lượng
        if (status == Order.Status.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Inventory inv = inventoryRepo.findByProductId(item.getProduct().getId());
                if (inv != null) {
                    inv.setQuantity(inv.getQuantity() + item.getQuantity());
                    inv.setReserved(inv.getReserved() - item.getQuantity());
                    inventoryRepo.save(inv);
                }
            }
        }

        orderRepo.save(order);
        return mapper.toResponse(order);
    }
}   