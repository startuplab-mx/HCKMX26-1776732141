package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    long countByDangerousTrue();

    java.util.List<Evidence> findByResponseFormId(Long responseFormId);
}
