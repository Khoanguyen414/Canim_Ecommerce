package com.example.canim_ecommerce.service;
import java.util.List;
import com.example.canim_ecommerce.dto.response.ai.AiProductContextResponse;
public interface AiProductContextService {
    List<AiProductContextResponse> getAvailableProductContexts();
    
}