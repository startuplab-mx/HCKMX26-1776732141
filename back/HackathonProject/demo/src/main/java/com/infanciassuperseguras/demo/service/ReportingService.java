package com.infanciassuperseguras.demo.service;

import com.infanciassuperseguras.demo.dto.AnswerDto;
import com.infanciassuperseguras.demo.dto.CreateReportDto;
import com.infanciassuperseguras.demo.dto.ReportDetailDto;
import com.infanciassuperseguras.demo.dto.ReportSummaryDto;
import com.infanciassuperseguras.demo.entity.*;
import com.infanciassuperseguras.demo.repository.EvidenceRepository;
import com.infanciassuperseguras.demo.repository.FormRepository;
import com.infanciassuperseguras.demo.repository.QuestionRepository;
import com.infanciassuperseguras.demo.repository.ResponseFormRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class ReportingService {

    private final FormRepository formRepo;
    private final QuestionRepository questionRepo;
    private final ResponseFormRepository responseFormRepo;
    private final EvidenceRepository evidenceRepo;
    private final MailService mailService;

    public ReportingService(FormRepository formRepo,
                            QuestionRepository questionRepo,
                            ResponseFormRepository responseFormRepo,
                            EvidenceRepository evidenceRepo,
                            MailService mailService) {
        this.formRepo = formRepo;
        this.questionRepo = questionRepo;
        this.responseFormRepo = responseFormRepo;
        this.evidenceRepo = evidenceRepo;
        this.mailService = mailService;
    }

    @Transactional(readOnly = true)
    public List<ReportSummaryDto> listSummaries() {
        return responseFormRepo.findAll().stream()
                .sorted(Comparator.comparing(ResponseForm::getCreated).reversed())
                .map(this::toSummary)
                .toList();
    }

    private ReportSummaryDto toSummary(ResponseForm rf) {
        List<Evidence> ev = evidenceRepo.findByResponseFormId(rf.getId());
        long danger = ev.stream().filter(Evidence::isDangerous).count();
        ReportSummaryDto dto = new ReportSummaryDto();
        dto.id = rf.getId();
        dto.filed = rf.getFiled();
        dto.created = rf.getCreated();
        dto.status = rf.getStatus().name();
        dto.evidenceCount = ev.size();
        dto.dangerousEvidenceCount = danger;
        dto.reviewed = rf.isReviewed();
        dto.evidenceConfirmed = rf.isEvidenceConfirmed();
        dto.addressed = rf.isAddressed();
        if (danger > 0) dto.dangerLevel = "DANGER";
        else if (!ev.isEmpty()) dto.dangerLevel = "WARNING";
        else dto.dangerLevel = "GRAY";
        return dto;
    }

    @Transactional
    public ResponseForm markReviewed(Long id) {
        ResponseForm rf = mustFind(id);
        rf.setReviewed(true);
        return responseFormRepo.save(rf);
    }

    @Transactional
    public ResponseForm markEvidenceConfirmed(Long id) {
        ResponseForm rf = mustFind(id);
        rf.setEvidenceConfirmed(true);
        return responseFormRepo.save(rf);
    }

    @Transactional
    public ResponseForm markAddressed(Long id) {
        ResponseForm rf = mustFind(id);
        rf.setAddressed(true);
        return responseFormRepo.save(rf);
    }

    private ResponseForm mustFind(Long id) {
        return responseFormRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ResponseForm " + id));
    }

    /** Long version sent when the user reported actual content/contact/evidence. */
    public static final String THANK_YOU_FULL =
            "Agradecemos tu esfuerzo en promover un entorno digital seguro y libre de violencia contra niñas, niños y adolescentes. " +
                    "Tu reporte fue enviado al Centro Nacional de Respuesta a Incidentes Cibernéticos de la Guardia Nacional de México y a la " +
                    "Procuraduría Federal de Protección de Niñas, Niños y Adolescentes. Adicionalmente informaremos a los administradores de la " +
                    "red social en la que se difundió el contenido reportado para que eliminen el contenido.";

    /** Short version when nothing was actually reported (all "No", no evidence). */
    public static final String THANK_YOU_NEGATIVE =
            "Agradecemos tu esfuerzo en promover un entorno digital seguro y libre de violencia contra niñas, niños y adolescentes.";

    /** Picks the thank-you message based on whether the report contains any positive signal. */
    @Transactional(readOnly = true)
    public String buildThankYouMessage(Long reportId) {
        ResponseForm rf = mustFind(reportId);
        long evidenceCount = evidenceRepo.findByResponseFormId(reportId).size();
        return isAllNegative(rf, evidenceCount) ? THANK_YOU_NEGATIVE : THANK_YOU_FULL;
    }

    private boolean isAllNegative(ResponseForm rf, long evidenceCount) {
        if (evidenceCount > 0) return false;
        for (Response r : rf.getResponses()) {
            String val = r.getResponse();
            if (val == null || val.isBlank()) continue;
            Question q = r.getQuestion();
            // age is auto-filled and doesn't carry incident signal
            if (q.getQuestion() != null && q.getQuestion().toLowerCase().contains("edad")) continue;

            switch (q.getResponseType()) {
                case SINGLE_CHOICE -> {
                    if (!"no".equalsIgnoreCase(val.trim())) return false;
                }
                case MULTI_CHOICE, URL, FILE, TEXT -> {
                    // any non-blank value here means the user actually reported something
                    return false;
                }
            }
        }
        return true;
    }

    @Transactional
    public ResponseForm createDraft(CreateReportDto dto) {
        Form form = formRepo.findById(dto.getFormId())
                .orElseThrow(() -> new EntityNotFoundException("Form " + dto.getFormId()));
        ResponseForm rf = new ResponseForm();
        rf.setForm(form);
        rf.setStatus(ReportStatus.DRAFT);
        rf.setProfileId(dto.getProfileId());
        applyAnswers(rf, dto.getAnswers());
        return responseFormRepo.save(rf);
    }

    @Transactional(readOnly = true)
    public ReportDetailDto getDetail(Long id) {
        ResponseForm rf = mustFind(id);
        List<Evidence> ev = evidenceRepo.findByResponseFormId(id);
        long danger = ev.stream().filter(Evidence::isDangerous).count();

        ReportDetailDto dto = new ReportDetailDto();
        dto.id = rf.getId();
        dto.status = rf.getStatus().name();
        dto.created = rf.getCreated();
        dto.filed = rf.getFiled();
        dto.profileId = rf.getProfileId();
        dto.reviewed = rf.isReviewed();
        dto.evidenceConfirmed = rf.isEvidenceConfirmed();
        dto.addressed = rf.isAddressed();
        if (danger > 0) dto.dangerLevel = "DANGER";
        else if (!ev.isEmpty()) dto.dangerLevel = "WARNING";
        else dto.dangerLevel = "GRAY";

        dto.answers = rf.getResponses().stream()
                .sorted(Comparator.comparingInt(r -> r.getQuestion().getOrderIndex()))
                .map(r -> {
                    ReportDetailDto.AnswerDetail a = new ReportDetailDto.AnswerDetail();
                    a.questionId = r.getQuestion().getId();
                    a.questionText = r.getQuestion().getQuestion();
                    a.responseType = r.getQuestion().getResponseType().name();
                    a.orderIndex = r.getQuestion().getOrderIndex();
                    a.response = r.getResponse();
                    return a;
                })
                .toList();

        dto.evidence = ev.stream().map(e -> {
            ReportDetailDto.EvidenceDetail d = new ReportDetailDto.EvidenceDetail();
            d.id = e.getId();
            d.filename = e.getFilename();
            d.dangerous = e.isDangerous();
            d.createdAt = e.getCreatedAt();
            return d;
        }).toList();

        return dto;
    }

    public long countValidatedByProfile(String profileId) {
        if (profileId == null || profileId.isBlank()) return 0;
        return responseFormRepo.countByProfileIdAndStatus(profileId, ReportStatus.FILED);
    }

    @Transactional
    public ResponseForm updateDraft(Long id, List<AnswerDto> answers) {
        ResponseForm rf = responseFormRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ResponseForm " + id));
        if (rf.getStatus() == ReportStatus.FILED) {
            throw new IllegalStateException("Filed reports cannot be edited");
        }
        rf.getResponses().clear();
        applyAnswers(rf, answers);
        return responseFormRepo.save(rf);
    }

    @Transactional
    public ResponseForm fileReport(Long id) {
        ResponseForm rf = responseFormRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ResponseForm " + id));
        if (rf.getStatus() == ReportStatus.FILED) {
            return rf;
        }
        rf.setStatus(ReportStatus.FILED);
        rf.setFiled(Instant.now());
        ResponseForm saved = responseFormRepo.save(rf);
        mailService.sendReportToAuthorities(saved);
        return saved;
    }

    public List<ResponseForm> listFiled() {
        return responseFormRepo.findByStatus(ReportStatus.FILED);
    }

    public ResponseForm get(Long id) {
        return responseFormRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ResponseForm " + id));
    }

    private void applyAnswers(ResponseForm rf, List<AnswerDto> answers) {
        if (answers == null) return;
        for (AnswerDto a : answers) {
            Question q = questionRepo.findById(a.getQuestionId())
                    .orElseThrow(() -> new EntityNotFoundException("Question " + a.getQuestionId()));
            Response r = new Response();
            r.setQuestion(q);
            r.setResponse(a.getResponse());
            r.setResponseForm(rf);
            rf.getResponses().add(r);
        }
    }
}
