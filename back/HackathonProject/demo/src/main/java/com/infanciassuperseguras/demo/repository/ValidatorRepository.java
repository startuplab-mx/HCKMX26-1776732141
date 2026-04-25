package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Validator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ValidatorRepository extends JpaRepository<Validator, Long> {
    List<Validator> findByFormId(Long formId);
}
