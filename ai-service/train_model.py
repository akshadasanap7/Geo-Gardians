"""
Train the SafeYatra risk prediction model.
Run: python train_model.py
"""
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

np.random.seed(42)
N = 5000

location_risk      = np.random.choice([0, 25, 45, 55], N, p=[0.5, 0.25, 0.15, 0.10])
inactivity_minutes = np.random.exponential(15, N).clip(0, 120)
speed              = np.random.exponential(3, N).clip(0, 20)
night_time         = np.random.choice([0, 1], N, p=[0.7, 0.3])
weather_risk       = np.random.choice([0, 5, 15, 25, 30, 35], N, p=[0.4, 0.2, 0.15, 0.1, 0.1, 0.05])

# ground-truth score formula
score = (
    location_risk * 0.40 +
    np.minimum(inactivity_minutes, 60) / 60 * 25 +
    (1 - np.minimum(speed, 10) / 10) * 10 +
    night_time * 12 +
    weather_risk * 0.35 +
    np.random.normal(0, 3, N)   # noise
).clip(0, 100)

X = np.column_stack([location_risk, inactivity_minutes, speed, night_time, weather_risk])
y = score

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"MAE: {mean_absolute_error(y_test, preds):.2f}")

with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ model.pkl saved")
