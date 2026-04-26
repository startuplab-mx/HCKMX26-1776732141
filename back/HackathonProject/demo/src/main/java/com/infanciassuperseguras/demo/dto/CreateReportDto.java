package com.infanciassuperseguras.demo.dto;

import java.util.List;

public class CreateReportDto {
    private Long formId;
    private String profileId;
    private List<AnswerDto> answers;

    public Long getFormId() { return formId; }
    public void setFormId(Long formId) { this.formId = formId; }
    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }
    public List<AnswerDto> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDto> answers) { this.answers = answers; }
}
