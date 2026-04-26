package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.FormType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;


@Component
@Path("/formType")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Form Types", description = "Tipos de formularios de reporte.")
public class FormTypeResource {
    private final List<FormType> formTypes;
    public FormTypeResource() {
        this.formTypes = Arrays.asList(FormType.values());
    }

    @GET
    @Operation(summary = "Lista todos los tipos de formularios disponibles")
    public List<String> list() {
        return formTypes.stream().map(FormType::name).toList();
    }
}
