package com.infanciassuperseguras.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "validators")
public class Validator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "form_id")
    private Form form;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id")
    private Question question;

    /** Expected answer that triggers next step (e.g. "Si"). Null means any non-empty answer. */
    @Column
    private String expectedValue;

    /** Next question to show when expectedValue matches. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_question_id")
    private Question nextQuestion;

    /** Whether matching this rule should immediately file the report at the end of the chain. */
    @Column(nullable = false)
    private boolean terminal;

    public Long getId() { return id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public String getExpectedValue() { return expectedValue; }
    public void setExpectedValue(String expectedValue) { this.expectedValue = expectedValue; }
    public Question getNextQuestion() { return nextQuestion; }
    public void setNextQuestion(Question nextQuestion) { this.nextQuestion = nextQuestion; }
    public boolean isTerminal() { return terminal; }
    public void setTerminal(boolean terminal) { this.terminal = terminal; }
}
