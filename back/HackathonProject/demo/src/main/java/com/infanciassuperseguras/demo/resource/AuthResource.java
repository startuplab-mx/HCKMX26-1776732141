package com.infanciassuperseguras.demo.resource;

import com.infanciassuperseguras.demo.entity.AppUser;
import com.infanciassuperseguras.demo.repository.AppUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth", description = "Autenticación de administradores y autoridades.")
public class AuthResource {

    public static class LoginDto {
        public String username;
        public String password;
    }

    private final AppUserRepository userRepository;

    public AuthResource(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @POST
    @Path("/login")
    @Operation(summary = "Inicia sesión y emite un token de acceso")
    public Response login(LoginDto dto) {
        if (dto == null || dto.username == null || dto.password == null) {
            return unauthorized();
        }
        Optional<AppUser> match = userRepository.findByUsername(dto.username)
                .filter(u -> u.getPassword().equals(dto.password));
        if (match.isEmpty()) {
            return unauthorized();
        }
        AppUser user = match.get();
        return Response.ok(Map.of(
                "token", UUID.randomUUID().toString(),
                "username", user.getUsername(),
                "role", user.getRole().name()
        )).build();
    }

    private Response unauthorized() {
        return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "Credenciales inválidas"))
                .build();
    }
}
