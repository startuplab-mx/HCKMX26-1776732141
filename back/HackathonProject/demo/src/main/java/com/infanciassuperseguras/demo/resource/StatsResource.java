package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.ReportStatus;
import com.infanciassuperseguras.demo.repository.EvidenceRepository;
import com.infanciassuperseguras.demo.repository.ResponseFormRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Path("/stats")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Stats", description = "Métricas agregadas para el dashboard.")
public class StatsResource {

    private final ResponseFormRepository responseFormRepo;
    private final EvidenceRepository evidenceRepo;

    public StatsResource(ResponseFormRepository responseFormRepo, EvidenceRepository evidenceRepo) {
        this.responseFormRepo = responseFormRepo;
        this.evidenceRepo = evidenceRepo;
    }

    @GET
    @Operation(summary = "Conteos agregados de reportes y evidencia")
    public Map<String, Long> stats() {
        long total = responseFormRepo.count();
        long filed = responseFormRepo.countByStatus(ReportStatus.FILED);
        long drafts = total - filed;
        long evidence = evidenceRepo.count();
        long dangerousEvidence = evidenceRepo.countByDangerousTrue();
        return Map.of(
                "totalReports", total,
                "filedReports", filed,
                "draftReports", drafts,
                "totalEvidence", evidence,
                "dangerousEvidence", dangerousEvidence
        );
    }
}
