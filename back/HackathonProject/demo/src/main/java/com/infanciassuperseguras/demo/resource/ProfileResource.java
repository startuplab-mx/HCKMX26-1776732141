package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Anonymous profile lookups. The profileId is an opaque cookie value that the
 * frontend assigns to a browser; no PII is stored against it. The backend just
 * counts how many of that profile's reports have been validated/filed so the
 * landing page can show a level/badge progression.
 */
@Component
@Path("/profile")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Profile", description = "Estadísticas anónimas asociadas a un identificador de perfil temporal.")
public class ProfileResource {

    private final ReportingService reportingService;

    public ProfileResource(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GET
    @Path("/{profileId}/stats")
    @Operation(summary = "Cuenta de reportes validados (FILED) asociados al perfil temporal")
    public Map<String, Object> stats(@PathParam("profileId") String profileId) {
        long validated = reportingService.countValidatedByProfile(profileId);
        return Map.of(
                "profileId", profileId,
                "validatedReports", validated
        );
    }
}
