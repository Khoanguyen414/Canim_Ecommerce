package com.example.canim_ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String>{
    
}
