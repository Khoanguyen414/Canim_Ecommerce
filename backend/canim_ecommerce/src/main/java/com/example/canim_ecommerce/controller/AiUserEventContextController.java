package com.example.canim_ecommerce.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.canim_ecommerce.dto.response.ai.AiUserEventContextResponse;
import com.example.canim_ecommerce.service.AiUserEventContextService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/ai/user-events")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiUserEventContextController {

    AiUserEventContextService aiUserEventContextService;

    @GetMapping("/recent/user/{userId}")
    public ResponseEntity<List<AiUserEventContextResponse>> getRecentEventsByUser(
            @PathVariable Long userId) {

        List<AiUserEventContextResponse> response =
                aiUserEventContextService.getRecentEventsByUser(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/strong/user/{userId}")
    public ResponseEntity<List<AiUserEventContextResponse>> getStrongEventsByUser(
            @PathVariable Long userId) {

        List<AiUserEventContextResponse> response =
                aiUserEventContextService.getStrongEventsByUser(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent/product/{productId}")
    public ResponseEntity<List<AiUserEventContextResponse>> getRecentEventsByProduct(
            @PathVariable Long productId) {

        List<AiUserEventContextResponse> response =
                aiUserEventContextService.getRecentEventsByProduct(productId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent/system")
    public ResponseEntity<List<AiUserEventContextResponse>> getRecentEventsInSystem() {
        List<AiUserEventContextResponse> response =
                aiUserEventContextService.getRecentEventsInSystem();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<AiUserEventContextResponse>> getTrendingEvents(
            @RequestParam(defaultValue = "30") int days) {

        List<AiUserEventContextResponse> response =
                aiUserEventContextService.getTrendingEvents(days);

        return ResponseEntity.ok(response);
    }
}