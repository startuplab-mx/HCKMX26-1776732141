package com.infanciassuperseguras.demo.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "response_forms")
public class ResponseForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "form_id")
    private Form form;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @Column(nullable = false)
    private Instant created;

    @Column(nullable = false)
    private Instant updated;

    @Column
    private Instant filed;

    @OneToMany(mappedBy = "responseForm", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Response> responses = new ArrayList<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.created = now;
        this.updated = now;
        if (this.status == null) this.status = ReportStatus.DRAFT;
    }

    @PreUpdate
    void onUpdate() {
        this.updated = Instant.now();
    }

    public Long getId() { return id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
    public Instant getCreated() { return created; }
    public Instant getUpdated() { return updated; }
    public Instant getFiled() { return filed; }
    public void setFiled(Instant filed) { this.filed = filed; }
    public List<Response> getResponses() { return responses; }
    public void setResponses(List<Response> responses) { this.responses = responses; }
}
