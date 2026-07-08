from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


ARTIFACT_PATH = Path(os.getenv("NAGARAI_MODEL_PATH", "artifacts/nagarai_ensemble.joblib"))
REVIEW_THRESHOLD = float(os.getenv("NAGARAI_REVIEW_THRESHOLD", "0.48"))

app = FastAPI(
    title="NagarAI Ensemble API",
    version="1.0.0",
    description="Human-reviewed civic complaint category, severity and duplicate decision support.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

_bundle: dict[str, Any] | None = None


class PredictRequest(BaseModel):
    text: str = Field(min_length=8, max_length=2_000)


class SimilarityRequest(BaseModel):
    text: str = Field(min_length=8, max_length=2_000)
    candidates: list[str] = Field(min_length=1, max_length=500)


def get_bundle() -> dict[str, Any]:
    global _bundle
    if _bundle is None:
        if not ARTIFACT_PATH.exists():
            raise HTTPException(
                status_code=503,
                detail="Model artifact is missing. Run python -m nagarai_ml.train first.",
            )
        _bundle = joblib.load(ARTIFACT_PATH)
    return _bundle


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ready" if ARTIFACT_PATH.exists() else "training_required",
        "artifact": ARTIFACT_PATH.name,
    }


@app.get("/models")
def models() -> dict[str, Any]:
    bundle = get_bundle()
    return {
        "version": bundle["version"],
        "trained_from": bundle["trained_from"],
        "row_count": bundle["row_count"],
        "category_weights": bundle["category"].weights_,
        "severity_weights": bundle["severity"].weights_,
    }


@app.post("/predict")
def predict(request: PredictRequest) -> dict[str, Any]:
    bundle = get_bundle()
    category = bundle["category"].explain_one(request.text)
    severity = bundle["severity"].explain_one(request.text)
    review_required = bool(
        category["review_required"]
        or severity["review_required"]
        or category["confidence"] < REVIEW_THRESHOLD
        or severity["confidence"] < REVIEW_THRESHOLD
    )
    return {
        "category": category,
        "severity": severity,
        "review_required": review_required,
        "disclaimer": "Decision support only. A human reviewer owns the final action.",
    }


@app.post("/similarity")
def similarity(request: SimilarityRequest) -> dict[str, Any]:
    texts = [request.text, *request.candidates]
    matrix = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5)).fit_transform(texts)
    scores = cosine_similarity(matrix[0:1], matrix[1:]).ravel()
    best_index = int(scores.argmax())
    return {
        "best_index": best_index,
        "best_score": float(scores[best_index]),
        "is_possible_duplicate": bool(scores[best_index] >= 0.62),
        "scores": [float(score) for score in scores],
    }
