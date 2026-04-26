package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.Evidence;
import com.infanciassuperseguras.demo.service.FingerprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Map;

@Component
@Path("/reports/{id}/evidence/fingerprint")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Reports")
public class FingerprintResource {

    private final FingerprintService service;

    public FingerprintResource(FingerprintService service) {
        this.service = service;
    }

    @POST
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    @Operation(summary = "Genera la huella digital perceptual de un archivo de evidencia (imagen o video)")
    public Response fingerprint(@PathParam("id") Long reportId,
                                @HeaderParam("X-Filename") String filename,
                                InputStream body) {
        try {
            Evidence ev = service.fingerprintAndStore(reportId, body, filename);
            return Response.ok(Map.of(
                    "evidenceId", ev.getId(),
                    "reportId", reportId,
                    "filename", ev.getFilename(),
                    "dangerous", ev.isDangerous()
            )).build();
        } catch (Exception e) {
            return Response.serverError()
                    .entity(Map.of("error", e.getMessage()))
                    .build();
        }
    }
}
