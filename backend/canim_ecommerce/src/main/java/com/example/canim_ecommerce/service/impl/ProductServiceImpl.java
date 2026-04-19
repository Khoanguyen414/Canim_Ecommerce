package com.example.canim_ecommerce.service.impl;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.canim_ecommerce.dto.request.productVariants.ProductVariantRequest;
import com.example.canim_ecommerce.dto.request.products.ProductCreationRequest;
import com.example.canim_ecommerce.dto.request.products.ProductFilterRequest;
import com.example.canim_ecommerce.dto.request.products.ProductStatusRequest;
import com.example.canim_ecommerce.dto.request.products.ProductUpdateRequest;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import com.example.canim_ecommerce.dto.response.ProductVariantResponse;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.ProductMapper;
import com.example.canim_ecommerce.repository.CategoryRepository;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.repository.specification.ProductSpecification;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.service.ProductService;
import com.example.canim_ecommerce.utils.SlugUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductServiceImpl implements ProductService {
    ProductRepository productRepository;
    ProductVariantRepository productVariantRepository;
    CategoryRepository categoryRepository;
    ProductMapper productMapper;
    InventoryService inventoryService;

    @Override
    public PageResponse<ProductResponse> getProducts(ProductFilterRequest filterRequest, int pageNum, int sizePage, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNum - 1, sizePage, sort);
        Specification<Product> spec = ProductSpecification.filterProducts(filterRequest);
        Page<Product> pageData = productRepository.findAll(spec, pageable);

        List<ProductResponse> data = pageData.getContent().stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    enrichProductData(response);
                    return response;
                })
                .toList();

        return PageResponse.<ProductResponse>builder()
                .page(pageNum)
                .size(sizePage)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .data(data)
                .build();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));
        ProductResponse response = productMapper.toProductResponse(product);

        enrichProductData(response);
        return response;
    }

    @Override
    public ProductResponse getProductBySku(String sku) {
        ProductVariant variant = productVariantRepository.findBySku(sku)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product variant not found with sku: " + sku));

        Product product = variant.getProduct();

        if (product.getStatus() == ProductStatus.HIDDEN) {
            throw new ApiException(ApiStatus.NOT_FOUND, "This product has been discontinued or removed.");
        }

        ProductResponse response = productMapper.toProductResponse(product);

        enrichProductData(response);  
        return response;
    }

    @Override
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found with slug: " + slug));
        ProductResponse response = productMapper.toProductResponse(product);

        enrichProductData(response);
        return response;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request) {
        String slug = SlugUtils.toSlug(request.getName());

        if (productRepository.existsBySlug(slug)) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Product slug already exists.");
        }

        for (ProductVariantRequest variantRequest : request.getVariants()) {
            if (productVariantRepository.existsBySku(variantRequest.getSku())) {
                throw new ApiException(ApiStatus.RESOURCE_EXIST, "SKU already exists.");
            }
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(slug);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Category not found"));
            product.setCategory(category);
        }

        if (product.getVariants() != null) {
            for (ProductVariant variant : product.getVariants()) {
                variant.setProduct(product);
            }
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        productMapper.updateProduct(product, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product's category not found"));
            product.setCategory(category);
        }

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void changeProductStatus(Long id, ProductStatusRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        product.setStatus(request.getStatus());
        productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        if (product.getStatus() == ProductStatus.HIDDEN) {
            return;
        }

        product.setStatus(ProductStatus.HIDDEN);
        productRepository.save(product);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importProducts(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Map<String, Product> productMap = new HashMap<>();

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                int rowIndex = i;
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String name = row.getCell(0).getStringCellValue();
                String sku = row.getCell(1).getStringCellValue();
                double price = row.getCell(2).getNumericCellValue();
                double catId = row.getCell(3).getNumericCellValue();

                if (productVariantRepository.existsBySku(sku)) {
                    throw new ApiException(
                            ApiStatus.RESOURCE_EXIST, 
                            "The line " + (rowIndex + 1) + ": SKU " + sku + " already exists!");
                }

                Category category = categoryRepository.findById((int) catId)
                        .orElseThrow(() -> new ApiException(
                                ApiStatus.NOT_FOUND,
                                "The line " + (rowIndex + 1) + ": Category ID " + catId + " does not exist!"));

                String slug = SlugUtils.toSlug(name);
                Product product = productMap.get(slug);
                
                if (product == null) {
                    product = productRepository.findBySlug(slug).orElse(null);

                    if (product == null) {
                        product = Product.builder()
                                .name(name)
                                .slug(slug)
                                .category(category)
                                .status(ProductStatus.ACTIVE)
                                .build();
                    }
                    productMap.put(slug, product);
                }

                ProductVariant variant = ProductVariant.builder()
                        .sku(sku)
                        .price(BigDecimal.valueOf(price))
                        .product(product)
                        .build();

                if (product.getVariants() == null) {
                    product.setVariants(new ArrayList<>());
                }

                product.getVariants().add(variant);
            }

            productRepository.saveAll(productMap.values());
        } catch (Exception e) {
            throw new ApiException(ApiStatus.INVALID_INPUT, "Error reading Excel file: " + e.getMessage());
        }
    }

    private void enrichProductData(ProductResponse response) {
        if (response.getVariants() == null || response.getVariants().isEmpty()) {
            return;
        }

        BigDecimal min = null;
        BigDecimal max = null;

        for (ProductVariantResponse variantResponse : response.getVariants()) {
            Integer availableQty = inventoryService.getAvailableQuantityForVariant(variantResponse.getId());
            variantResponse.setQuantity(availableQty);

            BigDecimal currentPrice = variantResponse.getPrice();
            if (currentPrice != null) {
                if (min == null || currentPrice.compareTo(min) < 0) {
                    min = currentPrice;
                }
                if (max == null || currentPrice.compareTo(max) > 0) {
                    max = currentPrice;
                }
            }
        }

        response.setMinPrice(min);
        response.setMaxPrice(max);
    }
}
