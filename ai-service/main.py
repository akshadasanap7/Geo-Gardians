from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle, os, json
from typing import List

app = FastAPI(title="SafeYatra AI Risk Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

# ── load or create model ──────────────────────────────────────────────────────
def load_model():
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return None

model = load_model()

# ── feature thresholds for rule-based fallback ────────────────────────────────
THRESHOLDS = {
    "locationRisk":      {"low": 0, "medium": 25, "high": 45, "critical": 55},
    "inactivityMinutes": {"low": 0, "medium": 15, "high": 30, "critical": 60},
    "weatherRisk":       {"low": 0, "medium": 10, "high": 20, "critical": 30},
}

class RiskInput(BaseModel):
    locationRisk:      float = 0
    inactivityMinutes: float = 0
    speed:             float = 0
    nightTime:         int   = 0
    weatherRisk:       float = 0

class RiskOutput(BaseModel):
    riskScore: float
    riskLevel: str
    reasons:   List[str]

def build_reasons(inp: RiskInput, score: float) -> List[str]:
    reasons = []
    if inp.locationRisk >= 45:  reasons.append("Tourist is in a danger zone")
    elif inp.locationRisk >= 25: reasons.append("Tourist is in a caution zone")
    if inp.inactivityMinutes >= 60: reasons.append(f"Inactive for {int(inp.inactivityMinutes)} minutes")
    elif inp.inactivityMinutes >= 30: reasons.append(f"Inactive for {int(inp.inactivityMinutes)} minutes")
    if inp.speed < 0.5 and inp.inactivityMinutes > 5: reasons.append("No movement detected")
    if inp.nightTime: reasons.append("Late night hours increase risk")
    if inp.weatherRisk >= 30: reasons.append("Extreme weather condition")
    elif inp.weatherRisk >= 20: reasons.append("Severe weather warning active")
    elif inp.weatherRisk >= 10: reasons.append("Adverse weather conditions")
    if not reasons: reasons.append("Baseline monitoring active")
    return reasons

@app.post("/predict-risk", response_model=RiskOutput)
def predict_risk(inp: RiskInput):
    features = np.array([[inp.locationRisk, inp.inactivityMinutes, inp.speed, inp.nightTime, inp.weatherRisk]])

    if model:
        score = float(model.predict(features)[0])
    else:
        # weighted rule-based fallback
        score = (
            inp.locationRisk * 0.40 +
            min(inp.inactivityMinutes, 60) / 60 * 25 +
            (1 - min(inp.speed, 10) / 10) * 10 +
            inp.nightTime * 12 +
            inp.weatherRisk * 0.35
        )
        score = min(100, score + 10)

    score = round(score, 1)
    level = "CRITICAL" if score >= 80 else "HIGH" if score >= 60 else "MEDIUM" if score >= 35 else "LOW"
    return RiskOutput(riskScore=score, riskLevel=level, reasons=build_reasons(inp, score))

@app.get("/health")
def health():
    return {"ok": True, "model_loaded": model is not None, "service": "SafeYatra AI Risk Engine"}
