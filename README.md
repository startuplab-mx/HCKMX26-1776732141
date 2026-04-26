# Infancias Súper Seguras — Backend

## Descripción
 Frente de Alerta y Respuesta Oportuna a la Violencia Digital contra Niñas, Niños y Adolescentes (*FARO*)

Faro es una aplicación web/móvil para el reporte de casos de violencia digital en contra de niñas, niños y adolescentes que protege la información reportada y la envía directamente a las autoridades del gobierno mexicano responsables de su investigación. En casos de reclutamiento forzado FARO actúa a través de la detección temprana y respuesta comunitaria identificando el lenguaje del crimen organizado promovido a través de videos en redes sociales, imágenes, memes, audios, etc., para activar una red de protección que evite que el reclutamiento avance. Esta red de protección consiste en recabar la información mínima necesaria para reportar el hecho ante las autoridades y solicitar medidas de protección especial para las víctimas.


## Problema que resuelve
La violencia en el entorno digital afecta a miles de niñas, niños y adolescentes cada día, sin embargo uno de los principales problemas para su erradicación consiste en recopilar la información de las víctimas y hacerla llegar de forma segura a las autoridades responsables de su investigación. 

Hoy no existe un canal único, simple y trazable para que cualquier persona —incluyendo menores— reporte contenido que promueve el reclutamiento forzado en redes sociales. Esta plataforma:

- Centraliza la denuncia con cuestionarios adaptados por edad.
- Permite guardar el reporte como borrador y completarlo después.
- Al presentarse, envía el reporte por correo a las autoridades correspondientes (Guardia Nacional / PFPNNA).
- Expone endpoints para que las autoridades consulten todos los reportes presentados.

## Tecnologías y herramientas utilizadas
- **Java 17**
- **Spring Boot 3.3** (Auto-configuración, Data JPA, Mail)
- **Jersey (JAX-RS)** para los endpoints REST
- **H2** como base de datos embebida (volátil, sólo demo)
- **Hibernate / JPA** para persistencia
- **Jackson** para JSON
- **Maven** como build tool
- **JavaMailSender** para envío de correos a autoridades

### Instrucciones para ejecutar el prototipo

#### Requisitos
- Java 17+
- Maven 3.9+ (o usar el wrapper incluido `./mvnw`)

#### Ejecutar local
```bash
cd back/HackathonProject/demo
./mvnw spring-boot:run
```

La aplicación arranca en `http://localhost:8080`. Endpoints bajo `/api/...`. Consola H2 en `/h2-console` (jdbc url: `jdbc:h2:mem:reportingdb`).

#### Documentación de la API (Swagger / OpenAPI)
- **Swagger UI**: <http://localhost:8080/swagger>
- **OpenAPI JSON**: <http://localhost:8080/api/openapi.json>
- **OpenAPI YAML**: <http://localhost:8080/api/openapi.yaml>

#### Build de jar ejecutable
```bash
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

## Documentación de IAs utilizadas

| IA | Para qué | En qué medida |
|----|----------|---------------|
| **Claude Code** | Configuración de Maveny template del README. | Generación inicial del esqueleto y cuestionarios; la lógica de negocio fue revisada y ajustada manualmente. |

## Integrantes del equipo
- Emma Ureña García
- Mario Ureña García
- Tania Benitez Rodríguez 
- Diego Farías Pineda
- Víctor Hugo Rodas Balderrama

