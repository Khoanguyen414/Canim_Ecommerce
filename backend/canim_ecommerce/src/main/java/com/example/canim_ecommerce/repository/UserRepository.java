package com.example.canim_ecommerce.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleSubjectId(String googleSubjectId);

    boolean existsByEmail(String email);

    @Query("""
            SELECT DISTINCT u
            FROM User u
            LEFT JOIN FETCH u.roles
            WHERE u.id = :id
            """)
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findWithRolesByEmail(String email);
}
