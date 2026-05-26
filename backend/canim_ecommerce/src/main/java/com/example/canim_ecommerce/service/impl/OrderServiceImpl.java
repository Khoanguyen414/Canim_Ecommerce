package com.example.canim_ecommerce.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.entity.Cart;
import com.example.canim_ecommerce.entity.CartItem;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderItem;
import com.example.canim_ecommerce.entity.OrderStatusHistory;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.OrderMapper;
import com.example.canim_ecommerce.mapper.PageResponseMapper;
import com.example.canim_ecommerce.repository.CartRepository;
import com.example.canim_ecommerce.repository.OrderRepository;
import com.example.canim_ecommerce.repository.specification.OrderSpecification;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.service.OrderService;
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {
    static Long DEFAULT_WAREHOUSE_ID = 1L;
    static BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.ZERO;
    static BigDecimal DEFAULT_DISCOUNT_AMOUNT = BigDecimal.ZERO;
    static String REDIS_CART_KEY = "cart:user:";

    OrderRepository orderRepository;
    CartRepository cartRepository;
    InventoryService inventoryService;
    OrderMapper orderMapper;
    PageResponseMapper pageResponseMapper;
    RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse checkout(CheckoutRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Cart not found"));

        List<CartItem> selectedItems = cart.getItems()
                .stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsSelected()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Please select at least one item to checkout");
        }

        validateSelectedItemsBeforeCheckout(selectedItems);

        for (CartItem item : selectedItems) {
            inventoryService.checkAndLockStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariant().getId(),
                    item.getQuantity());
        }

        for (CartItem item : selectedItems) {
            inventoryService.reserveStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariant().getId(),
                    item.getQuantity());
        }

        BigDecimal subTotal = calculateSubTotal(selectedItems);
        BigDecimal shippingFee = DEFAULT_SHIPPING_FEE;
        BigDecimal discountAmount = DEFAULT_DISCOUNT_AMOUNT;
        BigDecimal totalAmount = subTotal.add(shippingFee).subtract(discountAmount);

        Order order = Order.builder()
                .orderNo(generateOrderNo())
                .userId(userId)
                .subTotal(subTotal)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .shippingAddress(request.getShippingAddress())
                .orderNote(request.getOrderNote())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(resolveInitialPaymentStatus(request.getPaymentMethod()))
                .orderStatus(OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : selectedItems) {
            OrderItem orderItem = buildOrderItemSnapshot(cartItem);
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);

        List<OrderStatusHistory> histories = new ArrayList<>();

        OrderStatusHistory firstHistory = buildStatusHistory(
                order,
                null,
                OrderStatus.PENDING,
                "User checkout order",
                userId);

        histories.add(firstHistory);
        order.setHistories(histories);

        Order savedOrder = orderRepository.save(order);

        cart.getItems().removeAll(selectedItems);
        cartRepository.save(cart);

        redisTemplate.delete(REDIS_CART_KEY + userId);

        return orderMapper.toDetailResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long orderId, Long userIdScope) {
        Order order;

        if (userIdScope != null) {
            order = orderRepository.findByIdAndUserId(orderId, userIdScope)
                    .orElseThrow(() -> new ApiException(
                            ApiStatus.NOT_FOUND,
                            "Order not found or you do not have permission to view this order"));
        } else {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));
        }

        return orderMapper.toDetailResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(OrderFilterRequest filterRequest, Long userIdScope, int pageNum,
            int sizePage,
            String sortBy, String sortDir) {
        int pageIndex = Math.max(pageNum - 1, 0);

        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageIndex, sizePage, sort);

        Specification<Order> specification = OrderSpecification.filterOrders(
                filterRequest,
                userIdScope);

        Page<OrderResponse> responsePage = orderRepository.findAll(specification, pageable)
                .map(orderMapper::toOrderResponse);

        return pageResponseMapper.toPageResponse(responsePage);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Long actorId = SecurityUtils.getCurrentUserId();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));

        OrderStatus currentStatus = order.getOrderStatus();
        OrderStatus newStatus = request.getOrderStatus();

        validateAdminStatusTransition(currentStatus, newStatus);

        switch (newStatus) {
            case PROCESSING -> markAsProcessing(order, request.getReason(), actorId);
            case SHIPPED -> markAsShipped(order, request.getReason(), actorId);
            case DELIVERED -> markAsDelivered(order, request.getReason(), actorId);
            case CANCELLED -> cancelOrderInternal(order, request.getReason(), actorId);
            default -> throw new ApiException(ApiStatus.BAD_REQUEST, "Unsupported order status transition");
        }

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toDetailResponse(savedOrder);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse cancelOrder(
            Long orderId,
            String reason,
            Long userIdScope,
            boolean adminAction) {
        Order order;

        if (userIdScope != null) {
            order = orderRepository.findByIdAndUserId(orderId, userIdScope)
                    .orElseThrow(() -> new ApiException(
                            ApiStatus.NOT_FOUND,
                            "Order not found or you do not have permission to cancel this order"));
        } else {
            order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));
        }

        if (!adminAction && order.getOrderStatus() != OrderStatus.PENDING) {
            throw new ApiException(
                    ApiStatus.BAD_REQUEST,
                    "User can only cancel an order when it is in PENDING status");
        }

        if (adminAction
                && order.getOrderStatus() != OrderStatus.PENDING
                && order.getOrderStatus() != OrderStatus.PROCESSING) {
            throw new ApiException(
                    ApiStatus.BAD_REQUEST,
                    "Admin can only cancel PENDING or PROCESSING orders");
        }

        cancelOrderInternal(order, reason, SecurityUtils.getCurrentUserId());

        Order savedOrder = orderRepository.save(order);

        return orderMapper.toDetailResponse(savedOrder);
    }

    private void validateSelectedItemsBeforeCheckout(List<CartItem> selectedItems) {
        for (CartItem item : selectedItems) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid cart item quantity");
            }

            ProductVariant variant = item.getVariant();

            if (variant == null) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid product variant in cart");
            }

            if (!Boolean.TRUE.equals(variant.getIsActive())) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Product variant is no longer active");
            }

            Product product = variant.getProduct();

            if (product == null) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Product not found");
            }

            if (product.getStatus() != ProductStatus.ACTIVE) {
                throw new ApiException(
                        ApiStatus.BAD_REQUEST,
                        "Product " + product.getName() + " is no longer active");
            }
        }
    }

    private BigDecimal calculateSubTotal(List<CartItem> selectedItems) {
        BigDecimal subTotal = BigDecimal.ZERO;

        for (CartItem item : selectedItems) {
            BigDecimal price = item.getVariant().getPrice();
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
            subTotal = subTotal.add(price.multiply(quantity));
        }

        return subTotal;
    }

    private OrderItem buildOrderItemSnapshot(CartItem cartItem) {
        ProductVariant variant = cartItem.getVariant();

        return OrderItem.builder()
                .variantId(variant.getId())
                .variantName(buildVariantName(variant))
                .quantity(cartItem.getQuantity())
                .price(variant.getPrice())
                .build();
    }

    private String buildVariantName(ProductVariant variant) {
        Product product = variant.getProduct();

        String productName = product != null ? product.getName() : "Unknown Product";
        String color = variant.getColor() != null ? variant.getColor() : "";
        String size = variant.getSize() != null ? variant.getSize() : "";

        String variantInfo = (color + " " + size).trim();

        if (!StringUtils.hasText(variantInfo)) {
            return productName;
        }

        return productName + " - " + variantInfo;
    }

    private PaymentStatus resolveInitialPaymentStatus(PaymentMethod paymentMethod) {
        return PaymentStatus.UNPAID;
    }

    private void validateAdminStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (newStatus == null) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "New order status is required");
        }

        if (currentStatus == newStatus) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Order is already in " + newStatus + " status");
        }

        boolean valid = switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.PROCESSING
                    || newStatus == OrderStatus.CANCELLED;

            case PROCESSING -> newStatus == OrderStatus.SHIPPED
                    || newStatus == OrderStatus.CANCELLED;

            case SHIPPED -> newStatus == OrderStatus.DELIVERED;

            case DELIVERED, CANCELLED -> false;
        };

        if (!valid) {
            throw new ApiException(
                    ApiStatus.BAD_REQUEST,
                    "Cannot change order status from " + currentStatus + " to " + newStatus);
        }
    }

    private void markAsProcessing(Order order, String reason, Long actorId) {
        OrderStatus oldStatus = order.getOrderStatus();

        order.setOrderStatus(OrderStatus.PROCESSING);

        addHistory(
                order,
                oldStatus,
                OrderStatus.PROCESSING,
                normalizeReason(reason, "Admin confirmed order"),
                actorId);
    }

    private void markAsShipped(Order order, String reason, Long actorId) {
        OrderStatus oldStatus = order.getOrderStatus();

        for (OrderItem item : order.getItems()) {
            inventoryService.releaseAndExportStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariantId(),
                    item.getQuantity(),
                    order.getId());
        }

        order.setOrderStatus(OrderStatus.SHIPPED);

        addHistory(
                order,
                oldStatus,
                OrderStatus.SHIPPED,
                normalizeReason(reason, "Order shipped and stock exported"),
                actorId);
    }

    private void markAsDelivered(Order order, String reason, Long actorId) {
        OrderStatus oldStatus = order.getOrderStatus();

        order.setOrderStatus(OrderStatus.DELIVERED);

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        addHistory(
                order,
                oldStatus,
                OrderStatus.DELIVERED,
                normalizeReason(reason, "Order delivered successfully"),
                actorId);
    }

    private void cancelOrderInternal(Order order, String reason, Long actorId) {
        OrderStatus oldStatus = order.getOrderStatus();

        for (OrderItem item : order.getItems()) {
            inventoryService.unreserveStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariantId(),
                    item.getQuantity());
        }

        order.setOrderStatus(OrderStatus.CANCELLED);

        addHistory(
                order,
                oldStatus,
                OrderStatus.CANCELLED,
                normalizeReason(reason, "Order cancelled"),
                actorId);
    }

    private void addHistory(
            Order order,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            String reason,
            Long actorId) {
        if (order.getHistories() == null) {
            order.setHistories(new ArrayList<>());
        }

        OrderStatusHistory history = buildStatusHistory(
                order,
                fromStatus,
                toStatus,
                reason,
                actorId);

        order.getHistories().add(history);
    }

    private OrderStatusHistory buildStatusHistory(
            Order order,
            OrderStatus fromStatus,
            OrderStatus toStatus,
            String reason,
            Long actorId) {
        return OrderStatusHistory.builder()
                .order(order)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .createdBy(actorId)
                .build();
    }

    private String normalizeReason(String reason, String defaultReason) {
        if (StringUtils.hasText(reason)) {
            return reason.trim();
        }

        return defaultReason;
    }

    private String generateOrderNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String orderNo = "ORD-" + datePart + "-" + randomFourDigits();

        while (orderRepository.existsByOrderNo(orderNo)) {
            orderNo = "ORD-" + datePart + "-" + randomFourDigits();
        }

        return orderNo;
    }

    private int randomFourDigits() {
        return (int) (Math.random() * 9000) + 1000;
    }
}
