package com.infanciassuperseguras.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infanciassuperseguras.demo.entity.*;
import com.infanciassuperseguras.demo.repository.AppUserRepository;
import com.infanciassuperseguras.demo.repository.AuthorityRepository;
import com.infanciassuperseguras.demo.repository.FormRepository;
import com.infanciassuperseguras.demo.repository.ResponseFormRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Random;
import java.util.Set;

@Component
public class SeederService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeederService.class);

    /** Fixed profile id used by the demo cookie so the level/badge starts populated. */
    public static final String DEMO_PROFILE_ID = "demo-profile";

    private final FormRepository formRepository;
    private final AuthorityRepository authorityRepository;
    private final AppUserRepository userRepository;
    private final ResponseFormRepository responseFormRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SeederService(FormRepository formRepository,
                         AuthorityRepository authorityRepository,
                         AppUserRepository userRepository,
                         ResponseFormRepository responseFormRepository) {
        this.formRepository = formRepository;
        this.authorityRepository = authorityRepository;
        this.userRepository = userRepository;
        this.responseFormRepository = responseFormRepository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (formRepository.count() == 0) {
            seedForms();
        }
        if (authorityRepository.count() == 0) {
            seedAuthorities();
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (responseFormRepository.count() == 0) {
            seedDemoReports();
        }
    }

    private void seedDemoReports() {
        Form form = formRepository.findAllWithQuestions().stream().findFirst().orElse(null);
        if (form == null) {
            log.warn("No forms available; skipping demo report seed.");
            return;
        }

        Instant now = Instant.now();
        Instant earliest = now.minus(90, ChronoUnit.DAYS);
        Instant latest = now.minus(1, ChronoUnit.DAYS);
        long rangeSeconds = latest.getEpochSecond() - earliest.getEpochSecond();

        Random random = new Random(42); // deterministic so the demo dataset is repeatable

        for (int i = 0; i < 16; i++) {
            long offset = (long) (random.nextDouble() * rangeSeconds);
            Instant when = earliest.plusSeconds(offset);

            ResponseForm rf = new ResponseForm();
            rf.setForm(form);
            rf.setStatus(ReportStatus.FILED);
            rf.setProfileId(DEMO_PROFILE_ID);
            rf.setCreated(when);
            rf.setUpdated(when);
            rf.setFiled(when);

            for (Question q : form.getQuestions()) {
                Response r = new Response();
                r.setQuestion(q);
                r.setResponseForm(rf);
                r.setResponse(sampleAnswer(q, random, i));
                rf.getResponses().add(r);
            }

            responseFormRepository.save(rf);
        }
        log.info("Seeded 16 validated demo reports (random dates between {} and {}) for profile {}",
                earliest, latest, DEMO_PROFILE_ID);
    }

    private static final String[] YES_NO = { "Sí", "No" };
    private static final String[] SOCIAL_NETWORKS = {
            "TikTok", "Instagram", "Facebook", "WhatsApp", "Telegram", "X"
    };

    private String sampleAnswer(Question q, Random random, int reportIndex) {
        String text = q.getQuestion().toLowerCase();
        if (text.contains("edad")) return "18 o más";
        return switch (q.getResponseType()) {
            case SINGLE_CHOICE -> YES_NO[random.nextInt(YES_NO.length)];
            case MULTI_CHOICE -> {
                int picks = 1 + random.nextInt(3);
                Set<String> chosen = new LinkedHashSet<>();
                while (chosen.size() < picks) {
                    chosen.add(SOCIAL_NETWORKS[random.nextInt(SOCIAL_NETWORKS.length)]);
                }
                yield String.join(", ", chosen);
            }
            case URL -> "https://ejemplo.com/contenido-" + reportIndex;
            case FILE -> "evidencia-" + reportIndex + ".png";
            case TEXT -> "Respuesta de prueba " + reportIndex;
        };
    }

    private void seedUsers() {
        AppUser admin = new AppUser();
        admin.setUsername("admin");
        admin.setPassword("admin");
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);

        AppUser authority = new AppUser();
        authority.setUsername("authority");
        authority.setPassword("authority");
        authority.setRole(UserRole.AUTHORITY);
        userRepository.save(authority);

        log.info("Seeded {} users (admin/admin, authority/authority)", userRepository.count());
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
