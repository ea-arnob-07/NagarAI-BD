from __future__ import annotations

from collections import OrderedDict
from dataclasses import dataclass
from typing import Any, Iterable

import numpy as np
from sklearn.base import BaseEstimator
from sklearn.calibration import CalibratedClassifierCV
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_selection import SelectKBest, chi2
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import f1_score
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC


MODEL_NAMES = OrderedDict(
    [
        ("word_logistic", "Word Logistic Regression"),
        ("char_linear_svc", "Calibrated Character SVM"),
        ("word_multinomial_nb", "Word Multinomial NB"),
        ("char_complement_nb", "Character Complement NB"),
        ("hybrid_sgd", "Hybrid SGD Log-Loss"),
        ("svd_random_forest", "SVD Random Forest"),
    ]
)


def normalize_text(value: str) -> str:
    """Normalize spacing and a few common Bangla/Banglish variants."""
    value = " ".join(str(value).lower().strip().split())
    replacements = {
        "rastay": "rasta",
        "gorto": "gortho",
        "pani": "water pani",
        "moyla": "waste moyla",
        "durgondho": "smell durgondho",
        "current nai": "electricity outage",
        "haspatal": "hospital",
        "oshudh": "medicine",
        "khabar": "food",
        "vejal": "adulterated",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return value


def _word_vectorizer() -> TfidfVectorizer:
    return TfidfVectorizer(
        preprocessor=normalize_text,
        analyzer="word",
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.98,
        sublinear_tf=True,
        strip_accents=None,
    )


def _char_vectorizer() -> TfidfVectorizer:
    return TfidfVectorizer(
        preprocessor=normalize_text,
        analyzer="char_wb",
        ngram_range=(3, 5),
        min_df=1,
        max_features=35_000,
        sublinear_tf=True,
    )


def _hybrid_features() -> FeatureUnion:
    return FeatureUnion(
        [
            ("word", _word_vectorizer()),
            ("char", _char_vectorizer()),
        ]
    )


def build_models(random_state: int = 42, calibration_cv: int = 3) -> OrderedDict[str, BaseEstimator]:
    """Return six deliberately diverse, independently trained classifiers."""
    return OrderedDict(
        [
            (
                "word_logistic",
                Pipeline(
                    [
                        ("tfidf", _word_vectorizer()),
                        (
                            "classifier",
                            LogisticRegression(
                                max_iter=2_500,
                                class_weight="balanced",
                                C=3.0,
                                random_state=random_state,
                            ),
                        ),
                    ]
                ),
            ),
            (
                "char_linear_svc",
                Pipeline(
                    [
                        ("tfidf", _char_vectorizer()),
                        (
                            "classifier",
                            CalibratedClassifierCV(
                                estimator=LinearSVC(
                                    C=1.2,
                                    class_weight="balanced",
                                    random_state=random_state,
                                ),
                                cv=calibration_cv,
                                method="sigmoid",
                            ),
                        ),
                    ]
                ),
            ),
            (
                "word_multinomial_nb",
                Pipeline(
                    [
                        ("tfidf", _word_vectorizer()),
                        ("classifier", MultinomialNB(alpha=0.35)),
                    ]
                ),
            ),
            (
                "char_complement_nb",
                Pipeline(
                    [
                        ("tfidf", _char_vectorizer()),
                        ("select", SelectKBest(chi2, k="all")),
                        ("classifier", ComplementNB(alpha=0.45, norm=True)),
                    ]
                ),
            ),
            (
                "hybrid_sgd",
                Pipeline(
                    [
                        ("features", _hybrid_features()),
                        (
                            "classifier",
                            SGDClassifier(
                                loss="log_loss",
                                penalty="elasticnet",
                                alpha=2e-5,
                                l1_ratio=0.08,
                                max_iter=2_500,
                                class_weight="balanced",
                                random_state=random_state,
                            ),
                        ),
                    ]
                ),
            ),
            (
                "svd_random_forest",
                Pipeline(
                    [
                        ("features", _hybrid_features()),
                        ("svd", TruncatedSVD(n_components=24, random_state=random_state)),
                        (
                            "classifier",
                            RandomForestClassifier(
                                n_estimators=320,
                                max_depth=14,
                                min_samples_leaf=1,
                                class_weight="balanced_subsample",
                                n_jobs=-1,
                                random_state=random_state,
                            ),
                        ),
                    ]
                ),
            ),
        ]
    )


@dataclass
class Vote:
    model_id: str
    model_name: str
    label: str
    confidence: float
    probabilities: dict[str, float]


class SixModelTextEnsemble:
    """Validation-weighted soft-voting ensemble with transparent per-model votes."""

    def __init__(self, random_state: int = 42, calibration_cv: int = 3):
        self.random_state = random_state
        self.calibration_cv = calibration_cv
        self.models = build_models(random_state, calibration_cv)
        self.classes_: np.ndarray | None = None
        self.weights_: dict[str, float] = {}
        self.validation_f1_: dict[str, float] = {}

    def fit(
        self,
        train_texts: Iterable[str],
        train_labels: Iterable[str],
        validation_texts: Iterable[str],
        validation_labels: Iterable[str],
    ) -> "SixModelTextEnsemble":
        x_train = list(train_texts)
        y_train = np.asarray(list(train_labels), dtype=str)
        x_validation = list(validation_texts)
        y_validation = np.asarray(list(validation_labels), dtype=str)
        self.classes_ = np.unique(y_train)

        raw_weights: dict[str, float] = {}
        for model_id, model in self.models.items():
            model.fit(x_train, y_train)
            prediction = model.predict(x_validation)
            score = float(f1_score(y_validation, prediction, average="macro", zero_division=0))
            self.validation_f1_[model_id] = score
            raw_weights[model_id] = max(score, 0.05)

        total = sum(raw_weights.values())
        self.weights_ = {key: value / total for key, value in raw_weights.items()}
        return self

    def _check_fitted(self) -> None:
        if self.classes_ is None or not self.weights_:
            raise RuntimeError("Ensemble is not fitted. Run the training command first.")

    def _aligned_probabilities(self, model: BaseEstimator, texts: list[str]) -> np.ndarray:
        self._check_fitted()
        model_probabilities = np.asarray(model.predict_proba(texts), dtype=float)
        model_classes = np.asarray(model.classes_, dtype=str)
        output = np.zeros((len(texts), len(self.classes_)), dtype=float)
        for index, label in enumerate(self.classes_):
            matches = np.where(model_classes == label)[0]
            if matches.size:
                output[:, index] = model_probabilities[:, matches[0]]
        row_sums = output.sum(axis=1, keepdims=True)
        return np.divide(output, row_sums, out=np.zeros_like(output), where=row_sums != 0)

    def predict_proba(self, texts: Iterable[str]) -> np.ndarray:
        items = list(texts)
        self._check_fitted()
        combined = np.zeros((len(items), len(self.classes_)), dtype=float)
        for model_id, model in self.models.items():
            combined += self._aligned_probabilities(model, items) * self.weights_[model_id]
        return combined

    def predict(self, texts: Iterable[str]) -> np.ndarray:
        probabilities = self.predict_proba(texts)
        return self.classes_[np.argmax(probabilities, axis=1)]

    def explain_one(self, text: str) -> dict[str, Any]:
        probabilities = self.predict_proba([text])[0]
        winner_index = int(np.argmax(probabilities))
        winner_label = str(self.classes_[winner_index])
        votes: list[Vote] = []

        for model_id, model in self.models.items():
            individual = self._aligned_probabilities(model, [text])[0]
            model_winner = int(np.argmax(individual))
            votes.append(
                Vote(
                    model_id=model_id,
                    model_name=MODEL_NAMES[model_id],
                    label=str(self.classes_[model_winner]),
                    confidence=float(individual[model_winner]),
                    probabilities={
                        str(label): float(individual[index])
                        for index, label in enumerate(self.classes_)
                    },
                )
            )

        agreeing = sum(vote.label == winner_label for vote in votes)
        return {
            "label": winner_label,
            "confidence": float(probabilities[winner_index]),
            "agreement": agreeing / len(votes),
            "probabilities": {
                str(label): float(probabilities[index])
                for index, label in enumerate(self.classes_)
            },
            "votes": [vote.__dict__ for vote in votes],
            "weights": self.weights_,
            "review_required": bool(
                probabilities[winner_index] < 0.48 or agreeing < 4
            ),
        }
