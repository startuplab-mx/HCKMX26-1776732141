package com.infanciassuperseguras.demo.config;

import com.infanciassuperseguras.demo.resource.AuthResource;
import com.infanciassuperseguras.demo.resource.AuthorityResource;
import com.infanciassuperseguras.demo.resource.FingerprintResource;
import com.infanciassuperseguras.demo.resource.FormResource;
import com.infanciassuperseguras.demo.resource.ProfileResource;
import com.infanciassuperseguras.demo.resource.ReportResource;
import com.infanciassuperseguras.demo.resource.StatsResource;
import io.swagger.v3.jaxrs2.integration.resources.AcceptHeaderOpenApiResource;
import io.swagger.v3.jaxrs2.integration.resources.OpenApiResource;
import org.glassfish.jersey.server.ResourceConfig;
import org.springframework.stereotype.Component;

@Component
public class JerseyConfig extends ResourceConfig {
    public JerseyConfig() {
        register(FormResource.class);
        register(ReportResource.class);
        register(AuthorityResource.class);
        register(FingerprintResource.class);
        register(StatsResource.class);
        register(AuthResource.class);
        register(ProfileResource.class);

        // Serves OpenAPI spec at /api/openapi.json and /api/openapi.yaml
        register(OpenApiResource.class);
        register(AcceptHeaderOpenApiResource.class);
    }
}
