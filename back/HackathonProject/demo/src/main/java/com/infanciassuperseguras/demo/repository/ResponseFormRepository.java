package com.infanciassuperseguras.demo.repository;

import com.infanciassuperseguras.demo.entity.ReportStatus;
import com.infanciassuperseguras.demo.entity.ResponseForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResponseFormRepository extends JpaRepository<ResponseForm, Long> {
    List<ResponseForm> findByStatus(ReportStatus status);
}
