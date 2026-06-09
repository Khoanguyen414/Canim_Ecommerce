package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
import com.example.canim_ecommerce.service.AiProductContextService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiProductContextController {

    AiProductContextService aiProductContextService;

    @GetMapping({
            "/products/context",
            "/product-contexts/available"
    })
    public List<AiProductContextResponse> getAvailableProductContexts() {
        return aiProductContextService.getAvailableProductContexts();
    }
}