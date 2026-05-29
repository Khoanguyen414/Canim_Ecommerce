package com.example.canim_ecommerce.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.order.CancelOrderRequest;
import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderShippingRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.OrderStatisticsResponse;
import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.entity.Cart;
import com.example.canim_ecommerce.entity.CartItem;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderItem;
import com.example.canim_ecommerce.entity.OrderStatusHistory;
import com.example.canim_ecommerce.entity.PaymentTransaction;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.EventType;
import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;
import com.example.canim_ecommerce.enums.PaymentTransactionStatus;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.enums.ShippingStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.OrderMapper;
import com.example.canim_ecommerce.mapper.PageResponseMapper;
import com.example.canim_ecommerce.mapper.PaymentTransactionMapper;
import com.example.canim_ecommerce.repository.CartRepository;
import com.example.canim_ecommerce.repository.OrderRepository;
import com.example.canim_ecommerce.repository.PaymentTransactionRepository;
import com.example.canim_ecommerce.repository.UserRepository;
import com.example.canim_ecommerce.repository.specification.OrderSpecification;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.service.OrderService;
import com.example.canim_ecommerce.service.UserEventService;
import com.example.canim_ecommerce.utils.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {

    static Long DEFAULT_WAREHOUSE_ID = 1L;
    static BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.ZERO;
    static BigDecimal DEFAULT_DISCOUNT_AMOUNT = BigDecimal.ZERO;
    static String REDIS_CART_KEY = "cart:user:";
    static String AUTO_CANCEL_REASON = "Order automatically cancelled because the pending time expired";

    @Value("${order.pending-expiration-hours:24}")
    @NonFinal
    long pendingExpirationHours;

    OrderRepository orderRepository;
    PaymentTransactionRepository paymentTransactionRepository;
    UserRepository userRepository;
    CartRepository cartRepository;
    InventoryService inventoryService;
    OrderMapper orderMapper;
    PaymentTransactionMapper paymentTransactionMapper;
    PageResponseMapper pageResponseMapper;
    RedisTemplate<String, Object> redisTemplate;
    TransactionTemplate transactionTemplate;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse checkout(CheckoutRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        String idempotencyKey = normalizeNullableText(request.getIdempotencyKey());

        if (idempotencyKey != null) {
            Order existingOrder = orderRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)
                    .orElse(null);

            if (existingOrder != null) {
                return toDetailResponse(existingOrder, false);
            }
        }

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
                .idempotencyKey(idempotencyKey)
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

        Order savedOrder;
        try {
            savedOrder = idempotencyKey == null ? orderRepository.save(order) : orderRepository.saveAndFlush(order);
        } catch (DataIntegrityViolationException exception) {
            if (idempotencyKey != null) {
                return orderRepository.findByUserIdAndIdempotencyKey(userId, idempotencyKey)
                        .map(existingOrder -> toDetailResponse(existingOrder, false))
                        .orElseThrow(() -> exception);
            }

            throw exception;
        }

        createPendingPaymentTransaction(savedOrder);

        cart.getItems().removeAll(selectedItems);
        cartRepository.save(cart);

        redisTemplate.delete(REDIS_CART_KEY + userId);

        return toDetailResponse(savedOrder, false);
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

        return toDetailResponse(order, userIdScope == null);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(
            OrderFilterRequest filterRequest,
            Long userIdScope,
            int pageNum,
            int sizePage,
            String sortBy,
            String sortDir) {
        int pageIndex = Math.max(pageNum - 1, 0);

        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageIndex, sizePage, sort);

        Specification<Order> specification = OrderSpecification.filterOrders(
                filterRequest,
                userIdScope);

        boolean adminContext = userIdScope == null;

        Page<OrderResponse> responsePage = orderRepository.findAll(specification, pageable)
                .map(order -> toOrderResponse(order, adminContext));

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

        return toDetailResponse(savedOrder, true);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderDetailResponse cancelOrder(
            Long orderId,
            CancelOrderRequest request,
            Long currentUserId,
            boolean adminAction) {
        String cancelReason = resolveCancelReason(request);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));

        if (!adminAction) {
            if (currentUserId == null) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Current user is required to cancel an order");
            }

            if (!currentUserId.equals(order.getUserId())) {
                throw new ApiException(
                        ApiStatus.NOT_FOUND,
                        "Order not found or you do not have permission to cancel this order");
            }
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Order is already cancelled");
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

        Long actorId = adminAction ? SecurityUtils.getCurrentUserId() : currentUserId;

        cancelOrderInternal(order, cancelReason, actorId);

        Order savedOrder = orderRepository.save(order);

        return toDetailResponse(savedOrder, adminAction);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse updateOrderShipping(Long orderId, UpdateOrderShippingRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Cannot update shipping information for a cancelled order");
        }

        if (request.getShippingProvider() != null) {
            order.setShippingProvider(normalizeNullableText(request.getShippingProvider()));
        }

        if (request.getTrackingCode() != null) {
            order.setTrackingCode(normalizeNullableText(request.getTrackingCode()));
        }

        if (request.getShippingStatus() != null) {
            order.setShippingStatus(request.getShippingStatus());
        }

        Order savedOrder = orderRepository.save(order);

        return toOrderResponse(savedOrder, true);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderStatisticsResponse getAdminStatistics(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime fromDateTime = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate == null ? null : toDate.plusDays(1).atStartOfDay();

        if (fromDateTime != null && toDateTime != null && !fromDateTime.isBefore(toDateTime)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "From date must be before or equal to to date");
        }

        long totalOrders = orderRepository.countOrdersInRange(fromDateTime, toDateTime);
        long pendingOrders = countByStatus(OrderStatus.PENDING, fromDateTime, toDateTime);
        long processingOrders = countByStatus(OrderStatus.PROCESSING, fromDateTime, toDateTime);
        long shippedOrders = countByStatus(OrderStatus.SHIPPED, fromDateTime, toDateTime);
        long deliveredOrders = countByStatus(OrderStatus.DELIVERED, fromDateTime, toDateTime);
        long cancelledOrders = countByStatus(OrderStatus.CANCELLED, fromDateTime, toDateTime);
        BigDecimal totalRevenue = orderRepository.sumRevenueByStatusInRange(
                OrderStatus.DELIVERED.name(),
                fromDateTime,
                toDateTime);

        return OrderStatisticsResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue == null ? BigDecimal.ZERO : totalRevenue)
                .pendingOrders(pendingOrders)
                .processingOrders(processingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .cancelRate(calculateCancelRate(totalOrders, cancelledOrders))
                .revenueByDate(List.of())
                .topSellingProducts(List.of())
                .build();
    }

    @Override
    public void autoCancelExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(pendingExpirationHours);
        List<Long> expiredOrderIds = orderRepository
                .findTop100ByOrderStatusAndCreatedAtBeforeOrderByCreatedAtAsc(OrderStatus.PENDING, cutoff)
                .stream()
                .map(Order::getId)
                .toList();

        for (Long orderId : expiredOrderIds) {
            try {
                transactionTemplate.executeWithoutResult(status -> cancelExpiredPendingOrder(orderId));
            } catch (Exception exception) {
                log.error("Failed to auto cancel expired pending order id={}", orderId, exception);
            }
        }
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
        Product product = variant.getProduct();

        return OrderItem.builder()
                .variantId(variant.getId())
                .skuSnapshot(variant.getSku())
                .productNameSnapshot(product == null ? null : product.getName())
                .imageUrlSnapshot(product == null ? null : getMainImageUrl(product))
                .variantName(buildVariantName(variant))
                .quantity(cartItem.getQuantity())
                .price(variant.getPrice())
                .build();
    }

    private String buildVariantName(ProductVariant variant) {
        String color = normalizeNullableText(variant.getColor());
        String size = normalizeNullableText(variant.getSize());

        if (StringUtils.hasText(color) && StringUtils.hasText(size)) {
            return color + " / " + size;
        }

        if (StringUtils.hasText(color)) {
            return color;
        }

        if (StringUtils.hasText(size)) {
            return size;
        }

        return variant.getSku();

    }

    private String getMainImageUrl(Product product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }

        return product.getImages()
                .stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsMain()))
                .findFirst()
                .orElse(product.getImages().get(0))
                .getUrl();
    }

    private PaymentStatus resolveInitialPaymentStatus(PaymentMethod paymentMethod) {
        return PaymentStatus.UNPAID;
    }

    private long countByStatus(OrderStatus status, LocalDateTime fromDateTime, LocalDateTime toDateTime) {
        return orderRepository.countOrdersByStatusInRange(status.name(), fromDateTime, toDateTime);
    }

    private BigDecimal calculateCancelRate(long totalOrders, long cancelledOrders) {
        if (totalOrders == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal.valueOf(cancelledOrders)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
    }

    private PaymentTransaction createPendingPaymentTransaction(Order order) {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .order(order)
                .paymentMethod(order.getPaymentMethod())
                .amount(order.getTotalAmount())
                .status(PaymentTransactionStatus.PENDING)
                .build();

        return paymentTransactionRepository.save(transaction);
    }

    private void markLatestPaymentTransactionPaid(Order order, LocalDateTime paidAt) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .orElseGet(() -> PaymentTransaction.builder()
                        .order(order)
                        .paymentMethod(order.getPaymentMethod())
                        .amount(order.getTotalAmount())
                        .build());

        transaction.setPaymentMethod(order.getPaymentMethod());
        transaction.setAmount(order.getTotalAmount());
        transaction.setStatus(PaymentTransactionStatus.PAID);
        transaction.setPaidAt(paidAt == null ? LocalDateTime.now() : paidAt);

        paymentTransactionRepository.save(transaction);
    }

    private void cancelPendingPaymentTransaction(Order order) {
        paymentTransactionRepository.findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .filter(transaction -> transaction.getStatus() == PaymentTransactionStatus.PENDING)
                .ifPresent(transaction -> {
                    transaction.setStatus(PaymentTransactionStatus.CANCELLED);
                    paymentTransactionRepository.save(transaction);
                });
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
        if (order.getConfirmedAt() == null) {
            order.setConfirmedAt(LocalDateTime.now());
        }

        addHistory(
                order,
                oldStatus,
                OrderStatus.PROCESSING,
                normalizeReason(reason, "Admin confirmed order"),
                actorId);
    }

    private void markAsShipped(Order order, String reason, Long actorId) {
        OrderStatus oldStatus = order.getOrderStatus();
        LocalDateTime now = LocalDateTime.now();

        for (OrderItem item : order.getItems()) {
            inventoryService.releaseAndExportStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariantId(),
                    item.getQuantity(),
                    order.getId());
        }

        order.setOrderStatus(OrderStatus.SHIPPED);
        if (order.getConfirmedAt() == null) {
            order.setConfirmedAt(now);
        }
        if (order.getShippedAt() == null) {
            order.setShippedAt(now);
        }
        order.setShippingStatus(ShippingStatus.IN_TRANSIT);

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
        if (order.getDeliveredAt() == null) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        order.setShippingStatus(ShippingStatus.DELIVERED);

        if (order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            markLatestPaymentTransactionPaid(order, order.getDeliveredAt());
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
        String historyReason = normalizeReason(reason, "Order cancelled");

        for (OrderItem item : order.getItems()) {
            inventoryService.unreserveStock(
                    DEFAULT_WAREHOUSE_ID,
                    item.getVariantId(),
                    item.getQuantity());
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getCancelledAt() == null) {
            order.setCancelledAt(LocalDateTime.now());
        }
        order.setCancelReason(reason);
        order.setCancelledBy(resolveActor(actorId));
        order.setShippingStatus(ShippingStatus.CANCELLED);
        cancelPendingPaymentTransaction(order);

        addHistory(
                order,
                oldStatus,
                OrderStatus.CANCELLED,
                historyReason,
                actorId);
    }

    private void cancelExpiredPendingOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            return;
        }

        cancelOrderInternal(order, AUTO_CANCEL_REASON, null);
        orderRepository.save(order);
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

    private String resolveCancelReason(CancelOrderRequest request) {
        if (request == null) {
            return null;
        }

        if (request.getReason() != null && !request.getReason().isBlank()) {
            return request.getReason().trim();
        }

        if (request.getCancelReason() != null && !request.getCancelReason().isBlank()) {
            return request.getCancelReason().trim();
        }

        return null;
    }

    private String normalizeNullableText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return value.trim();
    }

    private User resolveActor(Long actorId) {
        if (actorId == null) {
            return null;
        }

        return userRepository.findById(actorId)
                .orElse(null);
    }

    private OrderResponse toOrderResponse(Order order, boolean adminContext) {
        OrderResponse response = orderMapper.toOrderResponse(order);
        enrichOrderResponse(response, adminContext);

        return response;
    }

    private OrderDetailResponse toDetailResponse(Order order, boolean adminContext) {
        OrderDetailResponse response = orderMapper.toDetailResponse(order);
        enrichOrderDetailResponse(response, adminContext);
        paymentTransactionRepository.findTopByOrder_IdOrderByCreatedAtDesc(order.getId())
                .map(paymentTransactionMapper::toResponse)
                .ifPresent(response::setLatestPaymentTransaction);

        return response;
    }

    private void enrichOrderResponse(OrderResponse response, boolean adminContext) {
        response.setOrderStatusLabel(resolveOrderStatusLabel(response.getOrderStatus()));
        response.setPaymentStatusLabel(resolvePaymentStatusLabel(response.getPaymentStatus()));
        response.setCanCancel(canCancel(response.getOrderStatus(), adminContext));
        response.setNextAction(resolveNextAction(response.getOrderStatus()));
    }

    private void enrichOrderDetailResponse(OrderDetailResponse response, boolean adminContext) {
        response.setOrderStatusLabel(resolveOrderStatusLabel(response.getOrderStatus()));
        response.setPaymentStatusLabel(resolvePaymentStatusLabel(response.getPaymentStatus()));
        response.setCanCancel(canCancel(response.getOrderStatus(), adminContext));
        response.setNextAction(resolveNextAction(response.getOrderStatus()));
    }

    private String resolveOrderStatusLabel(OrderStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case PENDING -> "Pending";
            case PROCESSING -> "Processing";
            case SHIPPED -> "Shipped";
            case DELIVERED -> "Delivered";
            case CANCELLED -> "Cancelled";
        };
    }

    private String resolvePaymentStatusLabel(PaymentStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case UNPAID -> "Unpaid";
            case PAID -> "Paid";
            case REFUNDED -> "Refunded";
        };
    }

    private Boolean canCancel(OrderStatus status, boolean adminContext) {
        if (status == null) {
            return false;
        }

        if (adminContext) {
            return status == OrderStatus.PENDING || status == OrderStatus.PROCESSING;
        }

        return status == OrderStatus.PENDING;
    }

    private String resolveNextAction(OrderStatus status) {
        if (status == null) {
            return null;
        }

        return switch (status) {
            case PENDING -> "Waiting for confirmation";
            case PROCESSING -> "Preparing order";
            case SHIPPED -> "Order is being shipped";
            case DELIVERED -> "Order completed";
            case CANCELLED -> "Order cancelled";
        };
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