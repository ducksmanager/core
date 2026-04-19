#!/usr/bin/env python

from paddle import utils
utils.run_check()
from paddleocr import PaddleOCR
from http.server import BaseHTTPRequestHandler, HTTPServer
import base64
import json
import os
import tempfile
from urllib.parse import parse_qs, urlparse

import numpy as np

_DATA_DIR = os.path.dirname(os.path.abspath(__file__))


def _load_json(filename: str):
    path = os.path.join(_DATA_DIR, filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _build_language_to_recognition_model(rules: dict) -> tuple[str, dict[str, str]]:
    """Apply group lists first, then per-code overrides (same as former if/chain order)."""
    default = rules["default_recognition_model"]
    by_code: dict[str, str] = {}
    for model, codes in rules["recognition_model_to_language_codes"].items():
        for c in codes:
            by_code[c.strip()] = model
    for code, model in rules["language_code_to_model"].items():
        by_code[code.strip()] = model
    return default, by_code

_RECOGNITION_RULES = _load_json("recognition_model_rules.json")
_RECOGNITION_DEFAULT, _LANGUAGE_TO_RECOGNITION_MODEL = _build_language_to_recognition_model(
    _RECOGNITION_RULES
)


def recognition_model_for_language_code(code: str) -> str:
    """Map inducks language codes (see language_codes_by_country.json) to a Paddle rec model."""
    return _LANGUAGE_TO_RECOGNITION_MODEL.get(code.strip(), _RECOGNITION_DEFAULT)


def is_language_code_supported(code: str) -> bool:
    """True only for language codes listed in recognition_model_rules.json (groups or per-code overrides)."""
    c = (code or "").strip()
    return bool(c) and c in _LANGUAGE_TO_RECOGNITION_MODEL


# One PaddleOCR instance per recognition model (many language codes share latin / cyrillic / …).
_OCR_BY_REC_MODEL: dict[str, PaddleOCR] = {}


def get_ocr_engine(language_code: str) -> PaddleOCR:
    """Return a cached PaddleOCR for the given inducks language code (e.g. `fr`, `ru`, `zh-hans`)."""
    lang = language_code.strip()
    rec = recognition_model_for_language_code(lang)
    if rec not in _OCR_BY_REC_MODEL:
        _OCR_BY_REC_MODEL[rec] = PaddleOCR(
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name=rec,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
        )
    return _OCR_BY_REC_MODEL[rec]

def convert_numpy_to_python(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_to_python(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_to_python(item) for item in obj]
    return obj

class PaddleOCRRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/supported":
            self.send_error(404)
            return
        qs = parse_qs(parsed.query)
        raw = (qs.get("languagecode") or [None])[0]
        if raw is None:
            body = json.dumps({"error": "missing languagecode query parameter"}).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        supported = is_language_code_supported(raw)
        body = json.dumps(supported).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(self.rfile.read(content_length))
        url = post_data['url'].replace('upload/', 'upload/c_limit,h_4000,w_4000/')
        language = post_data['language']
        want_annotated = bool(post_data.get('annotated'))

        try:
            ocr = get_ocr_engine(language)
        except ValueError as err:
            body = json.dumps({"error": str(err)}).encode("utf-8")
            self.send_response(400)
            self.send_header("Content-type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        os.remove("tmp.jpg") if os.path.exists("tmp.jpg") else None
        predict_out = ocr.predict(url)
        result = predict_out[0] if predict_out else None

        converted_data = []
        
        # Print result as JSON string
        if result is not None:
          # Extract texts and scores from the result structure
          texts = result['rec_texts']
          scores = result['rec_scores']
          boxes = result['rec_boxes']

          for i in range(len(texts)):
              if texts[i]:  # Only include non-empty texts
                  # Format box coordinates as [x1, y1, x2, y2]
                  box = boxes[i]
                  # The box is a 1D array of 4 values: [x1,y1,x2,y2]
                  formatted_box = [
                      int(box[0]),  # x1
                      int(box[1]),  # y1
                      int(box[2]),  # x2
                      int(box[3])   # y2
                  ]
                  converted_item = {
                      "box": formatted_box,
                      "text": texts[i],
                      "confidence": float(scores[i])  # Convert numpy float to Python float
                  }
                  converted_data.append(converted_item)

        if want_annotated:
            annotated_b64 = None
            annotated_mime = None
            if result is not None and hasattr(result, 'save_to_img'):
                with tempfile.TemporaryDirectory() as tmpd:
                    result.save_to_img(tmpd)
                    for name in sorted(os.listdir(tmpd)):
                        if name.lower().endswith(('.jpg', '.jpeg', '.png')):
                            path = os.path.join(tmpd, name)
                            with open(path, 'rb') as img_f:
                                annotated_b64 = base64.standard_b64encode(
                                    img_f.read()
                                ).decode('ascii')
                            annotated_mime = (
                                'image/png' if name.lower().endswith('.png') else 'image/jpeg'
                            )
                            break
            payload = {
                'ocr': converted_data,
                'annotated_image_base64': annotated_b64,
                'annotated_image_mime': annotated_mime,
            }
        else:
            payload = converted_data

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

if __name__ == '__main__':
    host = '0.0.0.0'
    port = 8081
    server_address = (host, port)

    httpd = HTTPServer(server_address, PaddleOCRRequestHandler)
    print(f"Starting server on {host}:{port}...")
    httpd.serve_forever()