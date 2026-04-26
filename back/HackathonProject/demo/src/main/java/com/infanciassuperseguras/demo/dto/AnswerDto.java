package com.infanciassuperseguras.demo.dto;

public class AnswerDto {
    private Long questionId;
    private String response;

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
