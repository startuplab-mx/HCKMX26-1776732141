package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.dto.AnswerDto;
import com.infanciassuperseguras.demo.dto.CreateReportDto;
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

    private static final String THANK_YOU_MSG =
            "Agradecemos tu esfuerzo en promover un entorno digital seguro y libre de violencia contra niñas, niños y adolescentes. " +
            "Tu reporte fue enviado al Centro Nacional de Respuesta a Incidentes Cibernéticos de la Guardia Nacional de México y a la " +
            "Procuraduría Federal de Protección de Niñas, Niños y Adolescentes. Adicionalmente informaremos a los administradores de la " +
            "red social en la que se difundió el contenido reportado para que eliminen el contenido.";

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
        return Response.ok(Map.of(
                "report", rf,
                "message", THANK_YOU_MSG
        )).build();
    }

    @GET
    @Operation(summary = "Lista los reportes presentados (consulta para autoridades)")
    public List<ResponseForm> listFiled() {
        return service.listFiled();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtiene el detalle de un reporte por id")
    public ResponseForm get(@PathParam("id") Long id) {
        return service.get(id);
    }
}
