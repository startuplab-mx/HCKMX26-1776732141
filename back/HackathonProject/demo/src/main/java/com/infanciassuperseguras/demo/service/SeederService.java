package com.infanciassuperseguras.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infanciassuperseguras.demo.entity.*;
import com.infanciassuperseguras.demo.repository.AuthorityRepository;
import com.infanciassuperseguras.demo.repository.FormRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.Iterator;

@Component
public class SeederService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeederService.class);

    private final FormRepository formRepository;
    private final AuthorityRepository authorityRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SeederService(FormRepository formRepository, AuthorityRepository authorityRepository) {
        this.formRepository = formRepository;
        this.authorityRepository = authorityRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (formRepository.count() == 0) {
            seedForms();
        }
        if (authorityRepository.count() == 0) {
            seedAuthorities();
        }
    }

    private void seedForms() throws Exception {
        try (InputStream in = new ClassPathResource("seed/general-questions.json").getInputStream()) {
            JsonNode root = objectMapper.readTree(in);
            for (JsonNode node : root) {
                Form form = new Form();
                form.setDescription(node.get("description").asText());
                form.setTargetType(TargetType.valueOf(node.get("targetType").asText()));
                form.setTargetValue(node.get("targetValue").asText());

                int idx = 0;
                Iterator<JsonNode> qs = node.get("questions").elements();
                while (qs.hasNext()) {
                    JsonNode qn = qs.next();
                    Question q = new Question();
                    q.setQuestion(qn.get("question").asText());
                    q.setResponseType(ResponseType.valueOf(qn.get("responseType").asText()));
                    q.setOpenEnded(qn.get("openEnded").asBoolean());
                    q.setOrderIndex(idx++);
                    q.setForm(form);
                    form.getQuestions().add(q);
                }
                formRepository.save(form);
                log.info("Seeded form: {}", form.getDescription());
            }
        }
    }

    private void seedAuthorities() {
        Authority a1 = new Authority();
        a1.setName("Centro Nacional de Respuesta a Incidentes Cibernéticos - Guardia Nacional");
        a1.setEmail("cert-mx@example.gob.mx");
        authorityRepository.save(a1);

        Authority a2 = new Authority();
        a2.setName("Procuraduría Federal de Protección de Niñas, Niños y Adolescentes");
        a2.setEmail("procuraduria@example.gob.mx");
        authorityRepository.save(a2);

        log.info("Seeded {} authorities", authorityRepository.count());
    }
}
