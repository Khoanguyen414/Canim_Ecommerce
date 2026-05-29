package com.example.canim_ecommerce.entity;

import java.time.LocalDateTime;
import java.util.Set;

import com.example.canim_ecommerce.enums.AuthProvider;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true, length = 255)
    String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    String password;

    @Column(name = "full_name", length = 200)
    String fullName;

    @Column(length = 50)
    String phone;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "google_subject_id", unique = true, length = 255)
    String googleSubjectId;

    @Column(name = "avatar_url", length = 1024)
    String avatarUrl;

    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    Boolean emailVerified = false;

    @Column(name = "is_active")
    @Builder.Default
    Boolean active = true;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    Set<Role> roles;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
