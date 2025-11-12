package com.example.canim_ecommerce.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.OrderItem;
import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.dto.OrderDTO;
import com.example.canim_ecommerce.dto.request.OrderRequestDTO;
import com.example.canim_ecommerce.mapper.OrderMapper;
import com.example.canim_ecommerce.repository.OrderRepository;

import jakarta.persistence.criteria.Order;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderMapper orderMapper;

    public OrderDTO createOrder(OrderRequestDTO dto) {
        Order order = orderMapper.toEntity(dto);
        order = orderRepository.save(order);
        return orderMapper.toDTO(order);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return orderMapper.toDTO(order);
    }

    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toDTO);
    }

    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        orderMapper.updateStatus(order, newStatus);
        order = orderRepository.save(order);
        return orderMapper.toDTO(order);
    }

    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel shipped or delivered order"); // Nghiệp vụ: Giới hạn hủy
        }
        order.setStatus(Order.OrderStatus.CANCELLED);
        // Mở rộng: Hoàn stock cho từng item
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
        orderRepository.save(order);
    }
}