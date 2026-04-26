package com.infanciassuperseguras.demo.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ReportDetailDto {
    public Long id;
    public String status;
    public Instant created;
    public Instant filed;
    public String profileId;
    public String dangerLevel;
    public boolean reviewed;
    public boolean evidenceConfirmed;
    public boolean addressed;
    public List<AnswerDetail> answers = new ArrayList<>();
    public List<EvidenceDetail> evidence = new ArrayList<>();

    public static class AnswerDetail {
        public Long questionId;
        public String questionText;
        public String responseType;
        public int orderIndex;
        public String response;
    }

    public static class EvidenceDetail {
        public Long id;
        public String filename;
        public boolean dangerous;
        public Instant createdAt;
    }
}
