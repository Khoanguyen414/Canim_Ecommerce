package com.example.canim_ecommerce.mapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.Entity.Order;
import com.example.canim_ecommerce.Entity.OrderItem;
import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.Entity.User;
import com.example.canim_ecommerce.dto.OrderDTO;
import com.example.canim_ecommerce.dto.OrderItemDTO;
import com.example.canim_ecommerce.dto.request.OrderRequestDTO;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order toEntity(OrderRequestDTO dto) {
        Order order = new Order();
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")); // Nghiệp vụ: Phải có user
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        double total = 0.0;
        Set<OrderItem> items = new HashSet<>();
        for (OrderItemDTO itemDto : dto.getOrderItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName()); // Nghiệp vụ: Kiểm tra tồn kho
            }
            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setOrder(order);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(product.getPrice());
            items.add(item);
            total += item.getQuantity() * item.getUnitPrice();
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity()); // Nghiệp vụ: Giảm tồn kho
            productRepository.save(product); // Cập nhật stock
        }
        order.setOrderItems(items);
        order.setTotalAmount(total);
        return order;
    }

    public OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderDate(order.getOrderDate());
        dto.setOrderItems(order.getOrderItems().stream().map(item -> {
            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setUnitPrice(item.getUnitPrice());
            return itemDto;
        }).collect(Collectors.toList()));
        return dto;
    }

    public void updateStatus(Order order, Order.OrderStatus newStatus) {
        order.setStatus(newStatus); // Nghiệp vụ: Chỉ update status cho Admin
    }
}
