package com.example.canim_ecommerce.service;

import java.util.List;

import com.example.canim_ecommerce.dto.response.ai.AiUserEventContextResponse;

public interface AiUserEventContextService {

    List<AiUserEventContextResponse> getRecentEventsByUser(Long userId);

    List<AiUserEventContextResponse> getRecentEventsInSystem();

    List<AiUserEventContextResponse> getStrongEventsByUser(Long userId);

    List<AiUserEventContextResponse> getRecentEventsByProduct(Long productId);

    List<AiUserEventContextResponse> getTrendingEvents(int days);
}