package com.example.canim_ecommerce.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.entity.Role;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.repository.RoleRepository;
import com.example.canim_ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DataSeeder implements CommandLineRunner{
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@example.com")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow();

            User admin = User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Admin")
                .roles(Set.of(adminRole))
                .active(true)
                .build();
            
            userRepository.save(admin);
        }
    }
}
