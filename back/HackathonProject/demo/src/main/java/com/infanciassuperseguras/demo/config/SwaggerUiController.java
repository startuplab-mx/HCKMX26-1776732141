package com.infanciassuperseguras.demo.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class SwaggerUiController {

    @GetMapping({"/swagger", "/swagger.html", "/swagger-ui", "/swagger-ui/", "/swagger-ui.html"})
    public RedirectView swagger() {
        return new RedirectView("/swagger-ui/index.html");
    }
}
