package com.infanciassuperseguras.demo.service;

import com.infanciassuperseguras.demo.entity.Authority;
import com.infanciassuperseguras.demo.entity.Response;
import com.infanciassuperseguras.demo.entity.ResponseForm;
import com.infanciassuperseguras.demo.repository.AuthorityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final AuthorityRepository authorityRepository;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public MailService(JavaMailSender mailSender, AuthorityRepository authorityRepository) {
        this.mailSender = mailSender;
        this.authorityRepository = authorityRepository;
    }

    public void sendReportToAuthorities(ResponseForm rf) {
        List<Authority> authorities = authorityRepository.findByEnabledTrue();
        if (authorities.isEmpty()) {
            log.warn("No enabled authorities; report {} not emailed.", rf.getId());
            return;
        }

        String body = buildBody(rf);
        String[] to = authorities.stream().map(Authority::getEmail).toArray(String[]::new);

        if (!mailEnabled) {
            log.info("[MAIL DISABLED] Would send report {} to {}\n{}", rf.getId(), String.join(",", to), body);
            return;
        }

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(to);
        msg.setSubject("Nuevo reporte ciudadano #" + rf.getId());
        msg.setText(body);
        try {
            mailSender.send(msg);
            log.info("Report {} sent to {} authorities.", rf.getId(), to.length);
        } catch (Exception e) {
            log.error("Failed sending report {}: {}", rf.getId(), e.getMessage());
        }
    }

    private String buildBody(ResponseForm rf) {
        String header = "Reporte #" + rf.getId() +
                "\nFormulario: " + rf.getForm().getDescription() +
                "\nFiled: " + rf.getFiled() + "\n\n";
        String answers = rf.getResponses().stream()
                .map(this::formatResponse)
                .collect(Collectors.joining("\n"));
        return header + answers;
    }

    private String formatResponse(Response r) {
        return "- " + r.getQuestion().getQuestion() + "\n  -> " + r.getResponse();
    }
}
