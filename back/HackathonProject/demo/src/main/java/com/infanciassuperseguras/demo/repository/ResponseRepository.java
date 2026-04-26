package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Response;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResponseRepository extends JpaRepository<Response, Long> {
}
