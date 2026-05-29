package com.example.canim_ecommerce.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

final class LocalFileStorage {

    private static final Path ROOT = Paths.get("uploads", "products");

    private LocalFileStorage() {}

    static String save(MultipartFile file, String publicBaseUrl) throws IOException {
        Files.createDirectories(ROOT);

        String original = file.getOriginalFilename();
        String ext = "jpg";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase();
        }
        String filename = UUID.randomUUID() + "." + ext;
        Path target = ROOT.resolve(filename);
        Files.write(target, file.getBytes());

        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return base + "/products/" + filename;
    }
}
