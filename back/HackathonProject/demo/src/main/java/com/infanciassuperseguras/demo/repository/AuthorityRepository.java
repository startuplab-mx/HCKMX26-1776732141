package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Authority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuthorityRepository extends JpaRepository<Authority, Long> {
    List<Authority> findByEnabledTrue();
}
