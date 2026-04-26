package com.infanciassuperseguras.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infanciassuperseguras.demo.entity.Evidence;
import com.infanciassuperseguras.demo.entity.ResponseForm;
import com.infanciassuperseguras.demo.repository.EvidenceRepository;
import com.infanciassuperseguras.demo.repository.ResponseFormRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
public class FingerprintService {

    /** Recruiting-related keywords that flag evidence as dangerous when found in OCR text. */
    private static final List<String> DANGER_KEYWORDS = List.of(
            "trabajo facil", "trabajo fácil", "buen sueldo", "paga diaria",
            "dinero rapido", "dinero rápido", "unete", "únete",
            "reclutamiento", "reclutar", "halcon", "halcón",
            "sicario", "narco", "cartel", "cártel",
            "armas", "droga", "transporte"
    );

    private final ObjectMapper mapper = new ObjectMapper();
    private final EvidenceRepository evidenceRepo;
    private final ResponseFormRepository responseFormRepo;

    @Value("${faro.fingerprint.python:python3}")
    private String pythonExecutable;

    @Value("${faro.fingerprint.script:scripts/faro_fingerprint.py}")
    private String scriptPath;

    @Value("${faro.fingerprint.timeoutSeconds:120}")
    private long timeoutSeconds;

    public FingerprintService(EvidenceRepository evidenceRepo, ResponseFormRepository responseFormRepo) {
        this.evidenceRepo = evidenceRepo;
        this.responseFormRepo = responseFormRepo;
    }

    public Evidence fingerprintAndStore(Long reportId, InputStream in, String originalFilename)
            throws IOException, InterruptedException {
        ResponseForm rf = responseFormRepo.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("ResponseForm " + reportId));

        String suffix = extensionOf(originalFilename);
        Path tmp = Files.createTempFile("faro-evidence-", suffix);
        try {
            Files.copy(in, tmp, StandardCopyOption.REPLACE_EXISTING);
            JsonNode huella = fingerprintFile(tmp);

            Evidence ev = new Evidence();
            ev.setResponseForm(rf);
            ev.setFilename(originalFilename == null ? "" : originalFilename);
            ev.setFingerprintJson(huella.toString());
            ev.setDangerous(isDangerous(huella));
            return evidenceRepo.save(ev);
        } finally {
            Files.deleteIfExists(tmp);
        }
    }

    public JsonNode fingerprintFile(Path file) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(
                pythonExecutable,
                scriptPath,
                "--input", file.toAbsolutePath().toString(),
                "--stdout"
        );
        pb.redirectErrorStream(false);

        Process proc = pb.start();
        ByteArrayOutputStream stdout = new ByteArrayOutputStream();
        try (OutputStream sink = stdout; InputStream src = proc.getInputStream()) {
            src.transferTo(sink);
        }

        boolean finished = proc.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            proc.destroyForcibly();
            throw new IOException("Fingerprint script timed out after " + timeoutSeconds + "s");
        }

        if (proc.exitValue() != 0) {
            String err = new String(proc.getErrorStream().readAllBytes());
            throw new IOException("Fingerprint script failed (exit " + proc.exitValue() + "): " + err);
        }

        byte[] payload = stdout.toByteArray();
        if (payload.length == 0) {
            throw new IOException("Fingerprint script produced empty output");
        }
        return mapper.readTree(payload);
    }

    private boolean isDangerous(JsonNode huella) {
        JsonNode imagen = huella.path("huella_imagen");
        String text = imagen.path("texto_ocr").asText("").toLowerCase(Locale.ROOT);
        if (!text.isEmpty()) {
            for (String kw : DANGER_KEYWORDS) {
                if (text.contains(kw)) return true;
            }
        }
        // Videos: any frame OCR text triggers
        JsonNode video = huella.path("huella_video");
        JsonNode frameTexts = video.path("texto_ocr_frames");
        if (frameTexts.isArray()) {
            for (JsonNode t : frameTexts) {
                String s = t.asText("").toLowerCase(Locale.ROOT);
                for (String kw : DANGER_KEYWORDS) {
                    if (s.contains(kw)) return true;
                }
            }
        }
        return false;
    }

    private String extensionOf(String filename) {
        if (filename == null) return ".bin";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return ".bin";
        return filename.substring(dot);
    }
}
