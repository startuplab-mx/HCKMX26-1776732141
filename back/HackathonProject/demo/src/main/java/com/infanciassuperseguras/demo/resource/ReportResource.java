package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.dto.AnswerDto;
import com.infanciassuperseguras.demo.dto.CreateReportDto;
import com.infanciassuperseguras.demo.dto.ReportDetailDto;
import com.infanciassuperseguras.demo.dto.ReportSummaryDto;
import com.infanciassuperseguras.demo.entity.ResponseForm;
import com.infanciassuperseguras.demo.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Reports", description = "Creación, edición, presentación y consulta de reportes ciudadanos.")
public class ReportResource {

    private final ReportingService service;

    public ReportResource(ReportingService service) {
        this.service = service;
    }

    @POST
    @Operation(summary = "Crea un reporte como borrador (DRAFT)")
    public Response createDraft(CreateReportDto dto) {
        ResponseForm rf = service.createDraft(dto);
        return Response.status(Response.Status.CREATED).entity(rf).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Actualiza las respuestas de un borrador")
    public ResponseForm updateDraft(@PathParam("id") Long id, List<AnswerDto> answers) {
        return service.updateDraft(id, answers);
    }

    @POST
    @Path("/{id}/file")
    @Operation(summary = "Presenta el reporte (FILED) y notifica por correo a las autoridades habilitadas")
    public Response file(@PathParam("id") Long id) {
        ResponseForm rf = service.fileReport(id);
        String message = service.buildThankYouMessage(id);
        return Response.ok(Map.of(
                "report", rf,
                "message", message
        )).build();
    }

    @GET
    @Operation(summary = "Lista los reportes presentados (consulta para autoridades)")
    public List<ResponseForm> listFiled() {
        return service.listFiled();
    }

    @GET
    @Path("/summary")
    @Operation(summary = "Resumen de reportes con nivel de peligro y estado de revisión (para dashboards)")
    public List<ReportSummaryDto> listSummaries() {
        return service.listSummaries();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtiene el detalle de un reporte por id")
    public ResponseForm get(@PathParam("id") Long id) {
        return service.get(id);
    }

    @GET
    @Path("/{id}/detail")
    @Operation(summary = "Detalle del reporte con respuestas y evidencia (DTO plano para UI)")
    public ReportDetailDto getDetail(@PathParam("id") Long id) {
        return service.getDetail(id);
    }

    @POST
    @Path("/{id}/review")
    @Operation(summary = "Marca un reporte como revisado")
    public ResponseForm markReviewed(@PathParam("id") Long id) {
        return service.markReviewed(id);
    }

    @POST
    @Path("/{id}/confirm-evidence")
    @Operation(summary = "Confirma que la evidencia del reporte es relevante")
    public ResponseForm markEvidenceConfirmed(@PathParam("id") Long id) {
        return service.markEvidenceConfirmed(id);
    }

    @POST
    @Path("/{id}/addressed")
    @Operation(summary = "Marca el reporte como atendido")
    public ResponseForm markAddressed(@PathParam("id") Long id) {
        return service.markAddressed(id);
    }
}
