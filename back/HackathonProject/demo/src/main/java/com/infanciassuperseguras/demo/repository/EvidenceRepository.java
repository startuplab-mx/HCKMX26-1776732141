package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    long countByDangerousTrue();

    java.util.List<Evidence> findByResponseFormId(Long responseFormId);

    @org.springframework.data.jpa.repository.Query(
            "SELECT e FROM Evidence e WHERE e.phash IS NOT NULL OR e.dhash IS NOT NULL " +
                    "OR e.whash IS NOT NULL OR e.ahash IS NOT NULL OR e.ocrText IS NOT NULL")
    java.util.List<Evidence> findAllMatchable();
}
