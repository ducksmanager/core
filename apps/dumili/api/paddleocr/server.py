#!/usr/bin/env python

from paddle import utils
utils.run_check()
from paddleocr import PaddleOCR

import base64
import json
import os
import tempfile
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

import uvicorn

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


class OcrRequest(BaseModel):
    url: str
    language: str
    annotated: bool = False


class OcrResult(BaseModel):
    box: tuple[int, int, int, int]
    text: str
    confidence: float


class OcrAnnotatedResponse(BaseModel):
    ocr: list[OcrResult]
    annotated_image_base64: Optional[str]
    annotated_image_mime: Optional[str]


app = FastAPI()


@app.get("/supported", response_model=bool)
def supported(languagecode: str = Query(...)):
    return is_language_code_supported(languagecode)


@app.post("/", response_model=OcrAnnotatedResponse | list[OcrResult])
def run_ocr(req: OcrRequest):
    url = req.url.replace("upload/", "upload/c_limit,h_4000,w_4000/")

    try:
        ocr = get_ocr_engine(req.language)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    if os.path.exists("tmp.jpg"):
        os.remove("tmp.jpg")

    predict_out = ocr.predict(url)
    result = predict_out[0] if predict_out else None

    items: list[OcrResult] = []
    if result is not None:
        texts = result["rec_texts"]
        scores = result["rec_scores"]
        boxes = result["rec_boxes"]
        for i in range(len(texts)):
            if texts[i]:
                box = boxes[i]
                items.append(OcrResult(
                    box=(int(box[0]), int(box[1]), int(box[2]), int(box[3])),
                    text=texts[i],
                    confidence=float(scores[i]),
                ))

    if req.annotated:
        annotated_b64 = None
        annotated_mime = None
        if result is not None and hasattr(result, "save_to_img"):
            with tempfile.TemporaryDirectory() as tmpd:
                result.save_to_img(tmpd)
                for name in sorted(os.listdir(tmpd)):
                    if name.lower().endswith((".jpg", ".jpeg", ".png")):
                        path = os.path.join(tmpd, name)
                        with open(path, "rb") as img_f:
                            annotated_b64 = base64.standard_b64encode(img_f.read()).decode("ascii")
                        annotated_mime = "image/png" if name.lower().endswith(".png") else "image/jpeg"
                        break
        return OcrAnnotatedResponse(ocr=items, annotated_image_base64=annotated_b64, annotated_image_mime=annotated_mime)

    return items


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
