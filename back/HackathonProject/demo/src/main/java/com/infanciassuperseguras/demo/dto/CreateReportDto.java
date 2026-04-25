package com.infanciassuperseguras.demo.dto;

import java.util.List;

public class CreateReportDto {
    private Long formId;
    private List<AnswerDto> answers;

    public Long getFormId() { return formId; }
    public void setFormId(Long formId) { this.formId = formId; }
    public List<AnswerDto> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDto> answers) { this.answers = answers; }
}
