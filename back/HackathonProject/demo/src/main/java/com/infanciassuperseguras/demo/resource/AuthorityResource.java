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
    @Operation(summary = "Lista las autoridades. Usa ?enabled=true para filtrar solo las habilitadas.")
    public List<Authority> list(@QueryParam("enabled") Boolean enabled) {
        List<Authority> all = repository.findAll();
        if (enabled == null) return all;
        return all.stream().filter(a -> a.isEnabled() == enabled).toList();
    }

    @POST
    @Operation(summary = "Da de alta una autoridad")
    public Response create(Authority authority) {
        Authority saved = repository.save(authority);
        return Response.status(Response.Status.CREATED).entity(saved).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Actualiza nombre, correo o estado de habilitación de una autoridad")
    public Response update(@PathParam("id") Long id, Authority body) {
        return repository.findById(id)
                .map(existing -> {
                    if (body.getName() != null) existing.setName(body.getName());
                    if (body.getEmail() != null) existing.setEmail(body.getEmail());
                    existing.setEnabled(body.isEnabled());
                    return Response.ok(repository.save(existing)).build();
                })
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Elimina una autoridad por id")
    public Response delete(@PathParam("id") Long id) {
        repository.deleteById(id);
        return Response.noContent().build();
    }
}
