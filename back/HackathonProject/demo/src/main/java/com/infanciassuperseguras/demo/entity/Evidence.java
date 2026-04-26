package com.infanciassuperseguras.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "response_form_id")
    @JsonIgnoreProperties({ "form", "responses", "hibernateLazyInitializer", "handler" })
    private ResponseForm responseForm;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private boolean dangerous;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String fingerprintJson;

    /** Hex-encoded perceptual hash extracted from the fingerprint payload. */
    @Column(length = 32)
    private String phash;

    /** Base64-encoded JPEG thumbnail (max ~160x160) for images; null for videos. */
    @Lob
    @Column(columnDefinition = "CLOB")
    private String thumbnailBase64;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public ResponseForm getResponseForm() { return responseForm; }
    public void setResponseForm(ResponseForm responseForm) { this.responseForm = responseForm; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public boolean isDangerous() { return dangerous; }
    public void setDangerous(boolean dangerous) { this.dangerous = dangerous; }
    public String getFingerprintJson() { return fingerprintJson; }
    public void setFingerprintJson(String fingerprintJson) { this.fingerprintJson = fingerprintJson; }
    public String getPhash() { return phash; }
    public void setPhash(String phash) { this.phash = phash; }
    public String getThumbnailBase64() { return thumbnailBase64; }
    public void setThumbnailBase64(String thumbnailBase64) { this.thumbnailBase64 = thumbnailBase64; }
    public Instant getCreatedAt() { return createdAt; }
}
