package com.example.canim_ecommerce.service;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Lưu ảnh: ưu tiên Cloudinary; nếu lỗi hoặc mode=local thì lưu thư mục uploads/ (dev).
 */
@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageStorageService {

    final CloudinaryService cloudinaryService;

    @Value("${app.storage.mode:local}")
    String storageMode;

    @Value("${app.storage.public-url:http://localhost:8000/canim_ecommerce/uploads}")
    String publicBaseUrl;

    public ImageStorageService(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        if ("cloudinary".equalsIgnoreCase(storageMode)) {
            try {
                return cloudinaryService.uploadImage(file);
            } catch (Exception ex) {
                log.warn("Cloudinary upload failed, falling back to local storage: {}", ex.getMessage());
            }
        }

        return LocalFileStorage.save(file, publicBaseUrl);
    }
}
