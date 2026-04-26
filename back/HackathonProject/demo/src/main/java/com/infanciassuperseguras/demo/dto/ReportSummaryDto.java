package com.infanciassuperseguras.demo.dto;

import java.time.Instant;

public class ReportSummaryDto {
    public Long id;
    public Instant filed;
    public Instant created;
    public String status;
    public String dangerLevel; // DANGER | WARNING | GRAY
    public long evidenceCount;
    public long dangerousEvidenceCount;
    public boolean reviewed;
    public boolean evidenceConfirmed;
    public boolean addressed;
}
