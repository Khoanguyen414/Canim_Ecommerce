package com.example.canim_ecommerce.controller;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
import com.example.canim_ecommerce.service.AiProductContextService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
@RestController
@RequestMapping("/ai/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiProductContextController {
    AiProductContextService aiProductContextService;
    @GetMapping("/context")
    public List<AiProductContextResponse> getAvailableProductContexts() {
       return aiProductContextService.getAvailableProductContexts();
        
    }
}