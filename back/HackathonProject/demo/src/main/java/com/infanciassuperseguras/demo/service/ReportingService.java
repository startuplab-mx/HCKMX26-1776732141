package com.infanciassuperseguras.demo.service;

import com.infanciassuperseguras.demo.dto.AnswerDto;
import com.infanciassuperseguras.demo.dto.CreateReportDto;
import com.infanciassuperseguras.demo.entity.*;
import com.infanciassuperseguras.demo.repository.FormRepository;
import com.infanciassuperseguras.demo.repository.QuestionRepository;
import com.infanciassuperseguras.demo.repository.ResponseFormRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ReportingService {

    private final FormRepository formRepo;
    private final QuestionRepository questionRepo;
    private final ResponseFormRepository responseFormRepo;
    private final MailService mailService;

    public ReportingService(FormRepository formRepo,
                            QuestionRepository questionRepo,
                            ResponseFormRepository responseFormRepo,
                            MailService mailService) {
        this.formRepo = formRepo;
        this.questionRepo = questionRepo;
        this.responseFormRepo = responseFormRepo;
        this.mailService = mailService;
    }

    @Transactional
    public ResponseForm createDraft(CreateReportDto dto) {
        Form form = formRepo.findById(dto.getFormId())
                .orElseThrow(() -> new EntityNotFoundException("Form " + dto.getFormId()));
        ResponseForm rf = new ResponseForm();
        rf.setForm(form);
        rf.setStatus(ReportStatus.DRAFT);
        applyAnswers(rf, dto.getAnswers());
        return responseFormRepo.save(rf);
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
