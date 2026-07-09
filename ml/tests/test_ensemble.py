from __future__ import annotations

import unittest
import sys
from pathlib import Path

import joblib


ML_ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ML_ROOT))


class TrainedEnsembleSmokeTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        artifact = Path(__file__).parents[1] / "artifacts" / "nagarai_ensemble.joblib"
        cls.bundle = joblib.load(artifact)

    def test_six_category_models_are_present(self) -> None:
        self.assertEqual(len(self.bundle["category"].models), 6)
        self.assertAlmostEqual(sum(self.bundle["category"].weights_.values()), 1.0, places=6)

    def test_six_severity_models_are_present(self) -> None:
        self.assertEqual(len(self.bundle["severity"].models), 6)
        self.assertAlmostEqual(sum(self.bundle["severity"].weights_.values()), 1.0, places=6)

    def test_bilingual_category_predictions(self) -> None:
        model = self.bundle["category"]
        examples = {
            "স্কুলের সামনে ড্রেন উপচে পানি জমেছে": "water",
            "Transformer theke spark hocche": "electricity",
            "The road has a dangerous pothole": "road_transport",
            "বাজারে পচা খাবার বিক্রি হচ্ছে": "food",
        }
        for text, expected in examples.items():
            with self.subTest(text=text):
                self.assertEqual(model.explain_one(text)["label"], expected)


if __name__ == "__main__":
    unittest.main()
