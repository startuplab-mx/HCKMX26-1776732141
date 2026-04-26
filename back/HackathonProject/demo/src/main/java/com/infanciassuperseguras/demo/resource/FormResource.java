package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.Form;
import com.infanciassuperseguras.demo.repository.FormRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Path("/forms")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Forms", description = "Plantillas de formularios de reporte (banco de preguntas).")
public class FormResource {

    private final FormRepository formRepository;

    public FormResource(FormRepository formRepository) {
        this.formRepository = formRepository;
    }

    @GET
    @Operation(summary = "Lista todos los formularios disponibles")
    public List<Form> list() {
        return formRepository.findAll();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtiene un formulario por id, incluyendo sus preguntas")
    public Response get(@PathParam("id") Long id) {
        return formRepository.findById(id)
                .map(f -> Response.ok(f).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    @Operation(summary = "Crea un nuevo formulario")
    public Response create(Form form) {
        Form saved = formRepository.save(form);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }
}
