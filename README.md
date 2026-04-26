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

### Backend (`back/HackathonProject/demo`)
- **Java 17** + **Spring Boot 3.3** (auto-configuración, Data JPA, Mail).
- **Jersey (JAX-RS)** para los endpoints REST montados bajo `/api/...`.
- **Hibernate / JPA** para la capa de persistencia y **H2** como base de datos embebida en memoria (volátil, sólo demo; con `create-drop` el esquema se reconstruye en cada arranque).
- **Jackson** para serialización JSON.
- **JavaMailSender** para el envío de los reportes presentados a las autoridades habilitadas.
- **Swagger / OpenAPI 3** (springdoc) para documentar la API.
- **Maven** como build tool (con wrapper `./mvnw`).

### Módulo de Huella Digital (`back/HackathonProject/demo/scripts`)
- **Python 3** invocado por el backend vía `ProcessBuilder` para generar la huella perceptual de cada evidencia (imagen o video).
- **Pillow + numpy + imagehash** para los hashes perceptuales (`pHash`, `dHash`, `wHash`, `aHash`).
- **OpenCV (opencv-python-headless)** para extracción de keyframes y flujo óptico en videos.
- **pytesseract** (Tesseract OCR) para extraer texto incrustado en imágenes y detectar palabras clave de reclutamiento.
- **librosa + soundfile + scipy** (opcional, sólo para audio de video) → chroma, MFCC, energía espectral, BPM.
- **ffmpeg** (opcional, para extraer pista de audio antes del análisis con librosa).
- Generación de miniaturas con `javax.imageio` + AWT del lado Java para previsualización en el dashboard.

### Frontend (`front/faro`)
- **React 18** + **TypeScript** + **Vite** (dev server con proxy de `/api` al backend).
- **React Router** para el ruteo (`/landing`, `/es-mx`, `/reportar`, `/admin/...`, etc.).
- CSS plano con scoping por clase, sin frameworks de UI.
- Cookie anónima `faro_profile` para asociar reportes a un perfil temporal sin almacenar PII de la persona menor de edad.

### Pruebas y demo
- **Postman** (colecciones en `back/HackathonProject/postman`) para probar los endpoints REST.
- Datos sembrados automáticamente en el primer arranque: 2 usuarios (`admin/admin`, `authority/authority`), 2 autoridades, 4 formularios por rango de edad, y 16 reportes validados con respuestas y fechas aleatorias entre los últimos 90 días.

### Instrucciones para ejecutar el prototipo

#### Requisitos
- **Java 17+** y **Maven 3.9+** (o el wrapper `./mvnw`).
- **Node.js 20+** y **npm** para el frontend.
- **Python 3.10+** para el módulo de huella digital.
- **Tesseract OCR** instalado en el sistema (sólo si se quiere detectar texto en imágenes):
  - macOS: `brew install tesseract tesseract-lang`
  - Ubuntu: `sudo apt-get install tesseract-ocr tesseract-ocr-spa`
- **ffmpeg** opcional, sólo para análisis de audio de video (`brew install ffmpeg`).

#### 1. Backend (Spring Boot, puerto 8080)
```bash
cd back/HackathonProject/demo
./mvnw spring-boot:run
```
- API: <http://localhost:8080/api/>
- Swagger UI: <http://localhost:8080/swagger>
- OpenAPI JSON / YAML: <http://localhost:8080/api/openapi.json> · <http://localhost:8080/api/openapi.yaml>
- Consola H2: <http://localhost:8080/h2-console> (jdbc url: `jdbc:h2:mem:reportingdb`)

Para construir un jar ejecutable:
```bash
./mvnw clean package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

#### 2. Módulo de Huella Digital (Python)
Desde `back/HackathonProject/demo`, instala las dependencias en un virtualenv local:
```bash
make -C scripts install      # crea scripts/.venv y ejecuta pip install -r requirements.txt
make -C scripts check        # imprime el --help del script para validar la instalación
```
El backend ya apunta a `scripts/.venv/bin/python` por defecto (override con la variable `FARO_PYTHON`). Sin este paso las cargas de evidencia siguen funcionando, pero se guardan sin huella perceptual ni detección por palabras clave.

#### 3. Frontend (Vite, puerto 5173)
```bash
cd front/faro
npm install
npm run dev
```
La app abre en <http://localhost:5173>; el dev server hace proxy de `/api` al backend en `:8080`.

Recorrido recomendado para la demo:
1. **`/landing`** → mascota, video y CTA "Reportar incidente".
2. **`/es-mx`** → reporte como menor de edad (lleva tutorial guiado, calidad del reporte por estrellas y perfil temporal por cookie).
3. **`/reportar`** → reporte como persona mayor de edad (formulario y preguntas obtenidas dinámicamente del backend).
4. **`/login`** → `admin/admin` o `authority/authority`.
5. **`/admin/dashboard`** → métricas agregadas (reportes totales, enviados a autoridades, evidencias marcadas como peligro).
6. **`/admin/reports`** → tabla con nivel de peligro, coincidencias, modal de revisión con miniaturas y enlaces a reportes con la misma evidencia.
7. **`/admin/authorities`** y **`/admin/forms`** → administración (sólo rol ADMIN).

#### Variables de entorno útiles (backend)
- `MAIL_ENABLED=true` y credenciales SMTP (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`) para enviar correos reales a las autoridades. Por defecto los correos se loguean en consola sin enviarse.
- `FARO_PYTHON` para apuntar a otro intérprete (por ejemplo `python3` del sistema).
- `FARO_SCRIPT` para mover el script a otra ruta.
- `FARO_TIMEOUT` para extender el timeout (segundos) del proceso Python.

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

