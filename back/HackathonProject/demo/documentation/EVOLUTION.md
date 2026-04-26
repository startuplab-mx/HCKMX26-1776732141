# Evolución planeada — Infancias Súper Seguras (Backend)

## Backlog
### Corto plazo (post-hackathon)
- Migrar de H2 in-memory a **PostgreSQL** (Render/Neon/Supabase) para persistencia real.
- Endpoint `POST /api/forms/{id}/validators` para registrar reglas de ramificación de preguntas.
- Motor de ramificación: el cliente consulta `GET /api/reports/{id}/next-question` que evalúa los `Validator` definidos en el formulario.
- Soporte de archivos (evidencia): subida a almacenamiento de objetos (S3 / R2) y referencia desde la entidad `Response`.
- Autenticación para autoridades (JWT + rol AUTHORITY) sobre `GET /api/reports`.
- Internacionalización (i18n) — actualmente todo en español.
- Bitácora de auditoría (quién creó / presentó cada reporte).
- Notificación automática a la red social donde se difundió el contenido (integración con APIs de denuncia de cada plataforma).

### Mediano plazo
- Tablero de métricas para autoridades (volumen, plataforma, distribución por edad/género).
- Clasificación automática del contenido reportado vía LLM (urgencia, categoría).
- **Webhooks salientes a las autoridades** (Guardia Nacional / PFPNNA y otros sistemas externos) en lugar de —o además de— el correo SMTP actual:
  - Disparo en tiempo real al cambiar `ResponseForm` a `FILED` o cuando la huella digital detecta peligro.
  - Payload firmado (HMAC-SHA256) y reintentos con backoff exponencial.
  - Endpoint de administración `POST /api/webhooks` para registrar URL + secreto + tipos de evento (`report.filed`, `evidence.dangerous`, `evidence.duplicate_match`).
  - Bitácora de entregas (status, intentos, payload) para auditoría.
- **Alianzas con redes sociales** para retiro acelerado del contenido reportado:
  - Integraciones con los Trusted Flagger / Partner Programs de TikTok, Meta (Facebook/Instagram), X y YouTube.
  - Servicio interno `SocialNetworkTakedownService` que, a partir de la URL reportada y la red detectada, envía la solicitud por la API correspondiente con la huella perceptual como evidencia adicional.
  - Estado de la solicitud sincronizado de vuelta al reporte (`pending`, `accepted`, `rejected`, `removed`) para mostrar trazabilidad a la persona reportante y a las autoridades.
  - Plantillas de denuncia legales pre-aprobadas para acortar el tiempo de revisión por parte de la plataforma.
- Modo offline para captura desde móvil (PWA) con sincronización al recuperar conexión.
- Pruebas e2e con Testcontainers + PostgreSQL.

### Largo plazo
- Federación con sistemas de denuncia internacionales.
- Análisis predictivo de patrones de reclutamiento por región.

## Arquitectura planeada

### Estado actual (MVP)
```
[ Cliente Web (front) ]
            │ HTTPS / JSON
            ▼
┌────────────────────────────────┐
│  Spring Boot (jar embebido)   │
│  ┌──────────────────────────┐ │
│  │ Jersey Resources (/api)  │ │
│  │  - FormResource          │ │
│  │  - ReportResource        │ │
│  │  - AuthorityResource     │ │
│  └────────────┬─────────────┘ │
│  ┌────────────▼─────────────┐ │
│  │ Services                 │ │
│  │  - ReportingService      │ │
│  │  - MailService (SMTP)    │ │
│  │  - SeederService         │ │
│  └────────────┬─────────────┘ │
│  ┌────────────▼─────────────┐ │
│  │ Spring Data JPA repos    │ │
│  └────────────┬─────────────┘ │
│            ▼                  │
│        H2 in-memory           │
└────────────────────────────────┘
            │ SMTP
            ▼
   Autoridades habilitadas
```

### Estado objetivo (post-MVP)
```
[ Front Web ]   [ Front Móvil PWA ]
        │                │
        └────────┬───────┘
                 ▼
        API Gateway / Auth (JWT)
                 │
   ┌─────────────┴──────────────┐
   ▼                            ▼
[ Service Reporting ]    [ Service Notifications ]
   │                            │
   │                            ├──► SMTP (autoridades)
   │                            ├──► Webhooks firmados (HMAC) → Guardia Nacional / PFPNNA
   │                            └──► Trusted Flagger APIs (TikTok / Meta / X / YouTube)
   ▼                                    │
PostgreSQL (RDS/Neon)                   ▼
   │                            Estado de takedown
   ▼                                    │
Object Storage (evidencia) ◄────────────┘
```

### Decisiones clave
- **Jersey (JAX-RS)** para los endpoints según restricción del proyecto, integrado bajo `spring.jersey.application-path=/api`.
- **Bootstrap del banco de preguntas** desde un JSON empaquetado en el classpath, dado que H2 in-memory pierde datos en cada reinicio.
- **Empaquetado jar con Tomcat embebido** para facilitar deploy en Render / Railway sin servlet container externo.
- **Validators como entidad de primer nivel** para que la lógica de ramificación de preguntas sea data-driven y no hardcodeada por formulario.
- **Webhooks como canal primario hacia autoridades** (a futuro): el correo SMTP queda como respaldo para sistemas que no expongan endpoints. Los webhooks permiten integraciones bidireccionales (acuse, número de expediente, estatus) y reducen la latencia de respuesta frente a contenido peligroso.
- **Acuerdos con redes sociales como fast-path de retiro**: la solicitud por API a través de un programa de Trusted Flagger acelera el takedown de horas/días a minutos cuando la huella digital coincide con contenido previamente catalogado. Es complementario al reporte a autoridades, no lo sustituye.
