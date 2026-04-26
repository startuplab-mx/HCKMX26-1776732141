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
    /** How many of this report's evidences also appear in other reports (perceptual match). */
    public long duplicateEvidenceCount;
    public boolean reviewed;
    public boolean evidenceConfirmed;
    public boolean addressed;
}
