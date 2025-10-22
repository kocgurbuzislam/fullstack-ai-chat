from fastapi import FastAPI, Response
from pydantic import BaseModel
from functools import lru_cache
import traceback

app = FastAPI(title="Sentiment API (3-class)")

class Inp(BaseModel):
    text: str

@lru_cache
def get_clf():
    # 3 sınıflı model: NEGATIVE / NEUTRAL / POSITIVE
    # CardiffNLP Twitter RoBERTa sentiment
    from transformers import pipeline
    return pipeline(
        "sentiment-analysis",
        model="cardiffnlp/twitter-roberta-base-sentiment",
        top_k=None
    )

LABEL_MAP = {
    "LABEL_0": "NEGATIVE",
    "LABEL_1": "NEUTRAL",
    "LABEL_2": "POSITIVE",
    # Bazı pipeline sürümleri doğrudan metin etiket döndürebilir:
    "NEGATIVE": "NEGATIVE",
    "NEUTRAL":  "NEUTRAL",
    "POSITIVE": "POSITIVE",
}

def analyze_text_safe(text: str):
    if not text or not text.strip():
        return {"label": "NEUTRAL", "score": 0.0}

    clf = get_clf()
    out = clf(text[:512])

    # out tipine göre normalize et:
    # - Standart: [{'label': 'LABEL_2', 'score': 0.98}]
    # - Bazı sürümlerde: [[{'label': 'LABEL_0', 'score': ...}, ...]]
    # - Çoklu cümlede: list of dict (biz tek string veriyoruz)
    if isinstance(out, list):
        first = out[0]
        if isinstance(first, dict):
            cand = first                      # tek en iyi sonuç
        elif isinstance(first, list):
            # top_k kullanılmışsa tüm sınıflar gelir -> en yüksek skoru seç
            cand = max(first, key=lambda d: d.get("score", 0.0))
        else:
            raise ValueError(f"Unexpected output type: {type(first)}")
    else:
        # çok nadir ama yine de emniyet
        cand = out

    raw_label = str(cand.get("label", "")).upper()
    label = LABEL_MAP.get(raw_label, "NEUTRAL")
    score = float(cand.get("score", 0.0))

    return {"label": label, "score": score}

@app.get("/")
def health():
    return {"ok": True}

@app.post("/analyze")
def analyze(inp: Inp, response: Response):
    try:
        return analyze_text_safe(inp.text)
    except Exception as e:
        # 500 yerine debug için 200 + error dönüyoruz
        response.status_code = 200
        return {
            "label": "NEUTRAL",
            "score": 0.0,
            "error": str(e),
            "trace": traceback.format_exc()[:1000],
        }
