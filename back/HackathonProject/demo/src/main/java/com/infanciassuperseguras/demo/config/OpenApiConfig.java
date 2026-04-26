package com.infanciassuperseguras.demo.config;

import io.swagger.v3.jaxrs2.integration.JaxrsOpenApiContextBuilder;
import io.swagger.v3.oas.integration.SwaggerConfiguration;
import io.swagger.v3.oas.integration.api.OpenApiContext;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class OpenApiConfig {

    @PostConstruct
    public void init() throws Exception {
        OpenAPI oas = new OpenAPI()
                .info(new Info()
                        .title("Infancias Súper Seguras API")
                        .version("0.0.1")
                        .description("Plataforma de reportes de contenido que promueve el reclutamiento forzado de NNA."))
                .servers(List.of(new Server().url("/api").description("API base")));

        SwaggerConfiguration cfg = new SwaggerConfiguration()
                .openAPI(oas)
                .prettyPrint(true)
                .resourcePackages(Set.of("com.infanciassuperseguras.demo.resource"));

        new JaxrsOpenApiContextBuilder<>()
                .ctxId(OpenApiContext.OPENAPI_CONTEXT_ID_PREFIX + ".default")
                .openApiConfiguration(cfg)
                .buildContext(true);
    }
}
