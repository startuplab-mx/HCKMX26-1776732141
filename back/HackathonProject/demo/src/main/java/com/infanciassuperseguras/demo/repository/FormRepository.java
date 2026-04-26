package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FormRepository extends JpaRepository<Form, Long> {

    @Query("SELECT DISTINCT f FROM Form f LEFT JOIN FETCH f.questions")
    List<Form> findAllWithQuestions();

    @Query("SELECT f FROM Form f LEFT JOIN FETCH f.questions WHERE f.id = :id")
    Optional<Form> findByIdWithQuestions(Long id);
}
