package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.Authority;
import com.infanciassuperseguras.demo.repository.AuthorityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Path("/authorities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authorities", description = "Gestión de autoridades a las que se envían los reportes presentados.")
public class AuthorityResource {

    private final AuthorityRepository repository;

    public AuthorityResource(AuthorityRepository repository) {
        this.repository = repository;
    }

    @GET
    @Operation(summary = "Lista todas las autoridades")
    public List<Authority> list() {
        return repository.findAll();
    }

    @POST
    @Operation(summary = "Da de alta una autoridad")
    public Response create(Authority authority) {
        Authority saved = repository.save(authority);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Elimina una autoridad por id")
    public Response delete(@PathParam("id") Long id) {
        repository.deleteById(id);
        return Response.noContent().build();
    }
}
