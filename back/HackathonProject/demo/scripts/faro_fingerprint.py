"""
╔══════════════════════════════════════════════════════════════════════════════╗
║         FARO — Frente de Alerta y Respuesta Oportuna                        ║
║         Sistema de Extracción de Huella Digital (Fingerprinting)            ║
║         Hackathon 404: Threat Not Found — CDMX 2026                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

Descripción:
    Módulo de extracción de huellas digitales perceptuales para imágenes y
    videos. Inspirado en el principio de Shazam (hashes robustos y búsqueda
    por similitud), pero aplicado a contenido visual asociado al reclutamiento
    de niñas, niños y adolescentes por parte del crimen organizado.

Capas de análisis:
    1. Hash perceptual de imágenes  (pHash, dHash, wHash, aHash)
    2. Hash por frames de video     (keyframes + diferencia temporal)
    3. Flujo óptico                 (patrón de movimiento del video)
    4. Huella de audio              (chroma + MFCC + energía espectral)
    5. Extracción de texto (OCR)    (texto incrustado en imágenes/frames)
    6. Huella compuesta final       (vector unificado serializable)

Instalación de dependencias:
    pip install imagehash opencv-python-headless numpy pillow
                librosa soundfile scipy pytesseract

Dependencias opcionales:
    pip install sentence-transformers   # Para embeddings semánticos de texto
    pip install acoustid chromaprint    # Para huella de audio avanzada

Uso:
    python faro_fingerprint.py --input archivo.jpg
    python faro_fingerprint.py --input video.mp4
    python faro_fingerprint.py --compare img1.jpg img2.jpg
    python faro_fingerprint.py --catalog ./carpeta_imagenes
"""

import os
import sys
import json
import hashlib
import argparse
import warnings
import tempfile
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional

import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")

# ─── Importaciones con manejo de dependencias opcionales ─────────────────────

try:
    import imagehash
    IMAGEHASH_OK = True
except ImportError:
    IMAGEHASH_OK = False
    print("[ADVERTENCIA] imagehash no disponible. Instala: pip install imagehash", file=sys.stderr)

try:
    import cv2
    CV2_OK = True
except ImportError:
    CV2_OK = False
    print("[ADVERTENCIA] OpenCV no disponible. Instala: pip install opencv-python-headless", file=sys.stderr)

try:
    import librosa
    import soundfile as sf
    LIBROSA_OK = True
except ImportError:
    LIBROSA_OK = False
    print("[ADVERTENCIA] librosa no disponible. Instala: pip install librosa soundfile", file=sys.stderr)

try:
    import pytesseract
    OCR_OK = True
except ImportError:
    OCR_OK = False
    print("[ADVERTENCIA] pytesseract no disponible. Instala: pip install pytesseract", file=sys.stderr)

try:
    from sentence_transformers import SentenceTransformer
    _semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
    SEMANTIC_OK = True
except Exception:
    SEMANTIC_OK = False


# ═══════════════════════════════════════════════════════════════════════════════
# ESTRUCTURAS DE DATOS
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class HuellaImagen:
    phash:          str
    dhash:          str
    whash:          str
    ahash:          str
    hash_compuesto: str
    resolucion:     tuple
    modo_color:     str
    texto_ocr:      str
    embedding_texto: list
    timestamp:      str


@dataclass
class HuellaFrame:
    numero_frame:   int
    tiempo_seg:     float
    phash:          str
    dhash:          str
    es_keyframe:    bool
    diferencia:     float


@dataclass
class HuellaAudio:
    chromagram:     list
    mfcc:           list
    energia:        list
    tempo:          float
    duracion_seg:   float
    hash_audio:     str


@dataclass
class HuellaVideo:
    hash_archivo:       str
    duracion_seg:       float
    fps:                float
    resolucion:         tuple
    total_frames:       int
    keyframes:          list
    huella_audio:       Optional[dict]
    patron_movimiento:  list
    texto_ocr_frames:   list
    hash_secuencia:     str
    timestamp:          str


@dataclass
class HuellaCompuesta:
    tipo:               str
    ruta_origen:        str
    huella_imagen:      Optional[dict]
    huella_video:       Optional[dict]
    vector_busqueda:    list
    nivel_confianza:    float
    timestamp:          str


# ═══════════════════════════════════════════════════════════════════════════════
# MÓDULO 1: EXTRACCIÓN DE HUELLA DE IMÁGENES
# ═══════════════════════════════════════════════════════════════════════════════

class ExtractorImagen:
    def __init__(self, hash_size: int = 8):
        self.hash_size = hash_size

    def extraer(self, ruta: str) -> HuellaImagen:
        img_pil = Image.open(ruta).convert("RGB")
        hashes = self._calcular_hashes(img_pil)
        texto = self._extraer_texto(img_pil)
        embedding = self._calcular_embedding(texto)
        hash_bin = self._hash_binario(ruta)

        return HuellaImagen(
            phash=str(hashes["phash"]),
            dhash=str(hashes["dhash"]),
            whash=str(hashes["whash"]),
            ahash=str(hashes["ahash"]),
            hash_compuesto=hash_bin,
            resolucion=img_pil.size,
            modo_color=img_pil.mode,
            texto_ocr=texto,
            embedding_texto=embedding,
            timestamp=datetime.utcnow().isoformat()
        )

    def _calcular_hashes(self, img: Image.Image) -> dict:
        if not IMAGEHASH_OK:
            return {"phash": "n/a", "dhash": "n/a", "whash": "n/a", "ahash": "n/a"}
        return {
            "phash": imagehash.phash(img, hash_size=self.hash_size),
            "dhash": imagehash.dhash(img, hash_size=self.hash_size),
            "whash": imagehash.whash(img, hash_size=self.hash_size),
            "ahash": imagehash.average_hash(img, hash_size=self.hash_size),
        }

    def _extraer_texto(self, img: Image.Image) -> str:
        if not OCR_OK:
            return ""
        try:
            config = "--oem 3 --psm 11 -l spa+eng"
            texto = pytesseract.image_to_string(img, config=config)
            return texto.strip().lower()
        except Exception:
            return ""

    def _calcular_embedding(self, texto: str) -> list:
        if not SEMANTIC_OK or not texto:
            return []
        try:
            vector = _semantic_model.encode(texto)
            return vector.tolist()
        except Exception:
            return []

    def _hash_binario(self, ruta: str) -> str:
        h = hashlib.sha256()
        with open(ruta, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()

    def distancia(self, huella_a: HuellaImagen, huella_b: HuellaImagen) -> dict:
        if not IMAGEHASH_OK:
            return {}

        def hamming(h1, h2):
            try:
                ih1 = imagehash.hex_to_hash(h1)
                ih2 = imagehash.hex_to_hash(h2)
                return ih1 - ih2
            except Exception:
                return -1

        distancias = {
            "phash": hamming(huella_a.phash, huella_b.phash),
            "dhash": hamming(huella_a.dhash, huella_b.dhash),
            "whash": hamming(huella_a.whash, huella_b.whash),
            "ahash": hamming(huella_a.ahash, huella_b.ahash),
        }
        valores = [v for v in distancias.values() if v >= 0]
        distancias["promedio"] = round(sum(valores) / len(valores), 2) if valores else -1
        distancias["es_match"] = distancias["promedio"] < 15
        return distancias


# ═══════════════════════════════════════════════════════════════════════════════
# MÓDULO 2: EXTRACCIÓN DE HUELLA DE VIDEO
# ═══════════════════════════════════════════════════════════════════════════════

class ExtractorVideo:
    def __init__(self, umbral_keyframe: float = 0.08, intervalo_seg: float = 1.0, max_keyframes: int = 50):
        self.umbral_keyframe = umbral_keyframe
        self.intervalo_seg = intervalo_seg
        self.max_keyframes = max_keyframes
        self.extractor_img = ExtractorImagen()

    def extraer(self, ruta: str) -> HuellaVideo:
        if not CV2_OK:
            raise ImportError("OpenCV requerido para procesar video.")

        cap = cv2.VideoCapture(ruta)
        if not cap.isOpened():
            raise ValueError(f"No se puede abrir el video: {ruta}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duracion = total_frames / fps
        ancho = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        alto = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        print(f"  Video: {duracion:.1f}s | {fps:.1f}fps | {ancho}x{alto} | {total_frames} frames", file=sys.stderr)

        keyframes = self._extraer_keyframes(cap, fps, total_frames)
        patron_movimiento = self._calcular_flujo_optico(cap, fps)
        texto_frames = self._extraer_texto_frames(keyframes)
        huella_audio = self._extraer_audio(ruta)
        hash_seq = self._hash_secuencia(keyframes)
        hash_archivo = self.extractor_img._hash_binario(ruta)

        cap.release()

        return HuellaVideo(
            hash_archivo=hash_archivo,
            duracion_seg=round(duracion, 2),
            fps=round(fps, 2),
            resolucion=(ancho, alto),
            total_frames=total_frames,
            keyframes=[asdict(kf) for kf in keyframes],
            huella_audio=huella_audio,
            patron_movimiento=patron_movimiento,
            texto_ocr_frames=texto_frames,
            hash_secuencia=hash_seq,
            timestamp=datetime.utcnow().isoformat()
        )

    def _extraer_keyframes(self, cap, fps: float, total_frames: int) -> list:
        keyframes = []
        hash_anterior = None
        frame_num = 0
        tiempo_ultimo_kf = -self.intervalo_seg
        intervalo_frames = max(1, int(fps * self.intervalo_seg))

        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

        while len(keyframes) < self.max_keyframes:
            ret, frame_bgr = cap.read()
            if not ret:
                break

            if frame_num % max(1, intervalo_frames // 4) != 0:
                frame_num += 1
                continue

            tiempo_actual = frame_num / fps
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(frame_rgb)

            if IMAGEHASH_OK:
                hash_actual = imagehash.phash(img_pil, hash_size=8)
                dhash_actual = imagehash.dhash(img_pil, hash_size=8)

                diferencia = 0.0
                es_keyframe = False

                if hash_anterior is None:
                    es_keyframe = True
                else:
                    diferencia = (hash_actual - hash_anterior) / 64.0
                    es_keyframe = (
                        diferencia > self.umbral_keyframe and
                        (tiempo_actual - tiempo_ultimo_kf) >= self.intervalo_seg
                    )

                if es_keyframe:
                    keyframes.append(HuellaFrame(
                        numero_frame=frame_num,
                        tiempo_seg=round(tiempo_actual, 3),
                        phash=str(hash_actual),
                        dhash=str(dhash_actual),
                        es_keyframe=True,
                        diferencia=round(diferencia, 4)
                    ))
                    tiempo_ultimo_kf = tiempo_actual
                    hash_anterior = hash_actual

            frame_num += 1

        print(f"  Keyframes extraidos: {len(keyframes)}", file=sys.stderr)
        return keyframes

    def _calcular_flujo_optico(self, cap, fps: float) -> list:
        if not CV2_OK:
            return []

        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        muestras = min(10, int(cap.get(cv2.CAP_PROP_FRAME_COUNT) // 30))
        magnitudes = []
        angulos = []

        frame_anterior = None
        frame_num = 0
        paso = max(1, int(cap.get(cv2.CAP_PROP_FRAME_COUNT) // (muestras + 1)))

        for _ in range(muestras):
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            ret, frame = cap.read()
            if not ret:
                break

            gris = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gris = cv2.resize(gris, (160, 90))

            if frame_anterior is not None:
                flujo = cv2.calcOpticalFlowFarneback(
                    frame_anterior, gris, None,
                    pyr_scale=0.5, levels=3, winsize=15,
                    iterations=3, poly_n=5, poly_sigma=1.2, flags=0
                )
                mag, ang = cv2.cartToPolar(flujo[..., 0], flujo[..., 1])
                magnitudes.append(float(np.mean(mag)))
                angulos.append(float(np.mean(ang)))

            frame_anterior = gris
            frame_num += paso

        if not magnitudes:
            return [0.0, 0.0, 0.0, 0.0]

        return [
            round(float(np.mean(magnitudes)), 4),
            round(float(np.max(magnitudes)), 4),
            round(float(np.mean(angulos)), 4),
            round(float(np.std(magnitudes)), 4)
        ]

    def _extraer_texto_frames(self, keyframes: list) -> list:
        return []

    def _extraer_audio(self, ruta_video: str) -> Optional[dict]:
        if not LIBROSA_OK:
            return None

        try:
            ruta_audio = ruta_video.rsplit(".", 1)[0] + "_audio_tmp.wav"

            resultado = os.system(
                f'ffmpeg -i "{ruta_video}" -ar 22050 -ac 1 -vn "{ruta_audio}" -y -loglevel quiet'
            )

            if resultado != 0 or not os.path.exists(ruta_audio):
                return None

            y, sr = librosa.load(ruta_audio, sr=22050, mono=True)
            os.remove(ruta_audio)

            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1).tolist()

            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfcc, axis=1).tolist()

            spec = np.abs(librosa.stft(y))
            energia = np.mean(spec, axis=1)
            bandas = np.array_split(energia, 20)
            energia_bandas = [float(np.mean(b)) for b in bandas]

            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            tempo_val = float(tempo) if np.isscalar(tempo) else float(tempo[0])

            y_norm = (y / (np.max(np.abs(y)) + 1e-8) * 32767).astype(np.int16)
            hash_audio = hashlib.sha256(y_norm.tobytes()).hexdigest()

            print(f"  Audio: {len(y)/sr:.1f}s | BPM: {tempo_val:.1f}", file=sys.stderr)

            return asdict(HuellaAudio(
                chromagram=[round(v, 4) for v in chroma_mean],
                mfcc=[round(v, 4) for v in mfcc_mean],
                energia=[round(v, 6) for v in energia_bandas],
                tempo=round(tempo_val, 2),
                duracion_seg=round(len(y) / sr, 2),
                hash_audio=hash_audio
            ))

        except Exception as e:
            print(f"  [!] Error en extraccion de audio: {e}", file=sys.stderr)
            return None

    def _hash_secuencia(self, keyframes: list) -> str:
        if not keyframes:
            return ""
        secuencia = "|".join(kf["phash"] for kf in keyframes)
        return hashlib.sha256(secuencia.encode()).hexdigest()


# ═══════════════════════════════════════════════════════════════════════════════
# MÓDULO 3: HUELLA COMPUESTA Y VECTOR DE BÚSQUEDA
# ═══════════════════════════════════════════════════════════════════════════════

class GeneradorHuellaCompuesta:
    def generar(self, huella_imagen=None, huella_video=None, ruta="") -> HuellaCompuesta:
        vector = self._construir_vector(huella_imagen, huella_video)
        confianza = self._calcular_confianza(huella_imagen, huella_video)

        return HuellaCompuesta(
            tipo="video" if huella_video else "imagen",
            ruta_origen=ruta,
            huella_imagen=asdict(huella_imagen) if huella_imagen else None,
            huella_video=asdict(huella_video) if huella_video else None,
            vector_busqueda=vector,
            nivel_confianza=confianza,
            timestamp=datetime.utcnow().isoformat()
        )

    def _construir_vector(self, huella_img, huella_vid) -> list:
        bits = []

        def hash_a_bits(hex_str: str, longitud: int = 64) -> list:
            try:
                n = int(hex_str, 16)
                b = [(n >> i) & 1 for i in range(longitud - 1, -1, -1)]
                return b[:longitud]
            except Exception:
                return [0] * longitud

        if huella_img:
            bits.extend(hash_a_bits(huella_img.phash))
            bits.extend(hash_a_bits(huella_img.dhash))
            bits.extend(hash_a_bits(huella_img.whash))
            bits.extend(hash_a_bits(huella_img.ahash))

        elif huella_vid and huella_vid.keyframes:
            primer_kf = huella_vid.keyframes[0]
            bits.extend(hash_a_bits(primer_kf["phash"]))
            bits.extend(hash_a_bits(primer_kf["dhash"]))
            bits.extend(hash_a_bits(huella_vid.hash_secuencia[:16], 64))
            audio_hash = huella_vid.huella_audio.get("hash_audio", "0"*32) if huella_vid.huella_audio else "0"*32
            bits.extend(hash_a_bits(audio_hash[:16], 64))

        bits.extend([0] * max(0, 256 - len(bits)))
        return bits[:256]

    def _calcular_confianza(self, huella_img, huella_vid) -> float:
        score = 0.0
        if huella_img:
            if huella_img.phash and huella_img.phash != "n/a": score += 0.25
            if huella_img.dhash and huella_img.dhash != "n/a": score += 0.25
            if huella_img.texto_ocr:                           score += 0.25
            if huella_img.embedding_texto:                     score += 0.25
        elif huella_vid:
            if huella_vid.keyframes:                           score += 0.30
            if huella_vid.hash_secuencia:                      score += 0.25
            if huella_vid.huella_audio:                        score += 0.25
            if huella_vid.patron_movimiento:                   score += 0.20
        return round(min(score, 1.0), 2)

    def distancia_vectores(self, vec_a: list, vec_b: list) -> dict:
        if len(vec_a) != len(vec_b):
            return {"distancia": -1, "es_match": False}

        diferencias = sum(a != b for a, b in zip(vec_a, vec_b))
        porcentaje = diferencias / len(vec_a) * 100

        return {
            "bits_diferentes": diferencias,
            "porcentaje_diferencia": round(porcentaje, 2),
            "es_match_fuerte": diferencias < 20,
            "es_match_posible": diferencias < 50,
            "similitud": round(1 - (diferencias / len(vec_a)), 4)
        }


# ═══════════════════════════════════════════════════════════════════════════════
# MÓDULO 4: PIPELINE PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

class FaroFingerprint:
    EXTENSIONES_IMAGEN = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"}
    EXTENSIONES_VIDEO  = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".3gp"}

    def __init__(self):
        self.extractor_img  = ExtractorImagen()
        self.extractor_vid  = ExtractorVideo()
        self.generador      = GeneradorHuellaCompuesta()

    def procesar(self, ruta: str) -> HuellaCompuesta:
        ruta = os.path.abspath(ruta)
        ext  = Path(ruta).suffix.lower()

        print(f"FARO Fingerprint - Archivo: {Path(ruta).name}", file=sys.stderr)

        if ext in self.EXTENSIONES_IMAGEN:
            huella_img = self.extractor_img.extraer(ruta)
            return self.generador.generar(huella_imagen=huella_img, ruta=ruta)
        elif ext in self.EXTENSIONES_VIDEO:
            huella_vid = self.extractor_vid.extraer(ruta)
            return self.generador.generar(huella_video=huella_vid, ruta=ruta)
        else:
            raise ValueError(f"Formato no soportado: {ext}")

    def comparar(self, ruta_a: str, ruta_b: str) -> dict:
        huella_a = self.procesar(ruta_a)
        huella_b = self.procesar(ruta_b)

        resultado_vec = self.generador.distancia_vectores(
            huella_a.vector_busqueda,
            huella_b.vector_busqueda
        )

        resultado_img = {}
        if huella_a.huella_imagen and huella_b.huella_imagen:
            img_a = HuellaImagen(**huella_a.huella_imagen)
            img_b = HuellaImagen(**huella_b.huella_imagen)
            resultado_img = self.extractor_img.distancia(img_a, img_b)

        return {
            "archivo_a": Path(ruta_a).name,
            "archivo_b": Path(ruta_b).name,
            "distancia_vector": resultado_vec,
            "distancia_hashes": resultado_img,
            "veredicto": self._veredicto(resultado_vec)
        }

    def catalogar(self, carpeta: str, salida: str = "catalogo_faro.json") -> list:
        catalogo = []
        carpeta_path = Path(carpeta)
        extensiones = self.EXTENSIONES_IMAGEN | self.EXTENSIONES_VIDEO

        archivos = [f for f in carpeta_path.rglob("*") if f.suffix.lower() in extensiones]

        for archivo in archivos:
            try:
                huella = self.procesar(str(archivo))
                catalogo.append(asdict(huella))
            except Exception as e:
                print(f"  [ERROR] {archivo.name}: {e}", file=sys.stderr)

        with open(salida, "w", encoding="utf-8") as f:
            json.dump(catalogo, f, ensure_ascii=False, indent=2)

        return catalogo

    def _veredicto(self, resultado_vec: dict) -> str:
        sim = resultado_vec.get("similitud", 0)
        if sim >= 0.95:   return "MATCH EXACTO"
        elif sim >= 0.80: return "MATCH FUERTE"
        elif sim >= 0.65: return "MATCH POSIBLE"
        else:             return "SIN MATCH"


# ═══════════════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="FARO - Extractor de Huella Digital")
    parser.add_argument("--input",   "-i",  help="Archivo de imagen o video a analizar")
    parser.add_argument("--compare", "-c",  nargs=2, metavar=("A", "B"), help="Comparar dos archivos")
    parser.add_argument("--catalog", "-d",  help="Catalogar archivos de una carpeta")
    parser.add_argument("--output",  "-o",  help="Ruta de salida del JSON")
    parser.add_argument("--stdout",         action="store_true", help="Emite JSON a stdout en lugar de archivo")

    args = parser.parse_args()
    faro = FaroFingerprint()

    if args.compare:
        resultado = faro.comparar(args.compare[0], args.compare[1])
        if args.stdout or not args.output:
            print(json.dumps(resultado, ensure_ascii=False))
        else:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(resultado, f, indent=2, ensure_ascii=False)
        return

    if args.catalog:
        faro.catalogar(args.catalog, args.output or "catalogo_faro.json")
        return

    if args.input:
        huella = faro.procesar(args.input)
        payload = asdict(huella)
        if args.stdout or not args.output:
            print(json.dumps(payload, ensure_ascii=False))
        else:
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2, ensure_ascii=False)
        return

    parser.print_help()


if __name__ == "__main__":
    main()
