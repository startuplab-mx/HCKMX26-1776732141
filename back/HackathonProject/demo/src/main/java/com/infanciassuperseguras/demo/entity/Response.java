package com.infanciassuperseguras.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "responses")
public class Response {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "response_form_id")
    @JsonIgnore
    private ResponseForm responseForm;

    @Column(length = 4000)
    private String response;

    public Long getId() { return id; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public ResponseForm getResponseForm() { return responseForm; }
    public void setResponseForm(ResponseForm responseForm) { this.responseForm = responseForm; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
