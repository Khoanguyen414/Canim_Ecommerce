package com.example.canim_ecommerce.service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryService {
    Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        String publicId = UUID.randomUUID().toString();

        Map params = ObjectUtils.asMap(
            "public_id", publicId,
            "folder", "canim_products",
            "resource_type", "image"
        );

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);

        return uploadResult.get("secure_url").toString();
    }

}
