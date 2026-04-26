package com.infanciassuperseguras.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({ "questions", "hibernateLazyInitializer", "handler" })
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

    @Column(length = 64)
    private String profileId;

    @Column(nullable = false)
    private boolean reviewed = false;

    @Column(nullable = false)
    private boolean evidenceConfirmed = false;

    @Column(nullable = false)
    private boolean addressed = false;

    @OneToMany(mappedBy = "responseForm", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Response> responses = new ArrayList<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (this.created == null) this.created = now;
        if (this.updated == null) this.updated = now;
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
    public void setCreated(Instant created) { this.created = created; }
    public Instant getUpdated() { return updated; }
    public void setUpdated(Instant updated) { this.updated = updated; }
    public Instant getFiled() { return filed; }
    public void setFiled(Instant filed) { this.filed = filed; }
    public String getProfileId() { return profileId; }
    public void setProfileId(String profileId) { this.profileId = profileId; }
    public boolean isReviewed() { return reviewed; }
    public void setReviewed(boolean reviewed) { this.reviewed = reviewed; }
    public boolean isEvidenceConfirmed() { return evidenceConfirmed; }
    public void setEvidenceConfirmed(boolean evidenceConfirmed) { this.evidenceConfirmed = evidenceConfirmed; }
    public boolean isAddressed() { return addressed; }
    public void setAddressed(boolean addressed) { this.addressed = addressed; }
    public List<Response> getResponses() { return responses; }
    public void setResponses(List<Response> responses) { this.responses = responses; }
}
