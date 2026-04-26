package com.infanciassuperseguras.demo.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class BaseEntity {
    /*@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;*/

    @Column(nullable = false)
    private Instant created;

    @Column(nullable = false)
    private Instant updated;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.created = now;
        this.updated = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updated = Instant.now();
    }
    

    /*public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }*/
    public Instant getCreated() { return created; }
    public Instant getUpdated() { return updated; }
}
