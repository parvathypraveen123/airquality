from flask import Flask, request, jsonify
from geopy.geocoders import Nominatim
import numpy as np
import pandas as pd
import joblib
from flask_cors import CORS
import warnings

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # <-- You can limit to localhost in prod

warnings.filterwarnings("ignore")

# Geolocation function
def get_lat_lon_if_india(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location_data = geolocator.geocode(location, exactly_one=True, country_codes="IN")  
    if location_data:
        return [location_data.latitude, location_data.longitude]
    return None

# Pollutant mapping
pollutid = {
    'CO': 0, 'CARBON MONOXIDE': 0,
    'NH3': 1, 'AMMONIA': 1,
    'NO2': 2, 'NITROGEN DIOXIDE': 2,
    'OZONE': 3, 'O3': 3,
    'PM10': 4, 'PARTICULATE MATTER 10': 4,
    'PM2.5': 5, 'PARTICULATE MATTER 2.5': 5,
    'SO2': 6, 'SULFUR DIOXIDE': 6
}

# Load trained model and scaler
model = joblib.load("air_quality_model.pkl")
sc = joblib.load("scaler.pkl")

# AQI categorization
def get_aqi_category(value):
    if value <= 50:
        return "Healthy"
    elif value <= 100:
        return "Satisfactory"
    elif value <= 200:
        return "Unhealthy"
    elif value <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

# Preflight OPTIONS handler + main POST predict route
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        # Handle the preflight request
        response = jsonify({'message': 'CORS preflight passed'})
        response.headers.add("Access-Control-Allow-Origin", "*")  # <-- You can lock to your frontend URL
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    # Main POST request handler
    data = request.json
    location = data.get("location")
    pollut = data.get("pollutant").strip().upper()

    coordinates = get_lat_lon_if_india(location)
    if not coordinates:
        return jsonify({"error": "Location not found in India"}), 400

    if pollut not in pollutid:
        return jsonify({"error": "Invalid pollutant"}), 400

    pollutant_id = pollutid[pollut]
    locat = [coordinates + [pollutant_id]]

    feature_names = ["latitude", "longitude", "pollutant_id"]
    sample_test_df = pd.DataFrame(locat, columns=feature_names)

    # Scale latitude & longitude
    scaled_values = sc.transform(sample_test_df.iloc[:, :2])
    scaled_df = pd.DataFrame(scaled_values, columns=["latitude", "longitude"])
    scaled_df["pollutant_id"] = sample_test_df["pollutant_id"].values

    # Predict AQI levels
    prediction = model.predict(scaled_df).reshape(1, -1)
    att = ["Minimum Pollutant level", "Maximum Pollutant level", "Average Pollutant level"]
    predicted_df = pd.DataFrame(prediction, columns=att)

    min_pollutant = predicted_df["Minimum Pollutant level"].iloc[0]
    max_pollutant = predicted_df["Maximum Pollutant level"].iloc[0]
    avg_pollutant = predicted_df["Average Pollutant level"].iloc[0]

    # Get AQI category for each level
    min_status = get_aqi_category(min_pollutant)
    max_status = get_aqi_category(max_pollutant)
    avg_status = get_aqi_category(avg_pollutant)

    # Determine overall status
    status_priority = ["Healthy", "Satisfactory", "Unhealthy", "Very Unhealthy", "Hazardous"]
    statuses = [min_status, max_status, avg_status]
    worst_status = max(statuses, key=lambda x: status_priority.index(x))

    response = jsonify({
        "Minimum Pollutant Level": format(min_pollutant, ".2f"),
        "Maximum Pollutant Level": format(max_pollutant, ".2f"),
        "Average Pollutant Level": format(avg_pollutant, ".2f"),
        "Minimum Level AQI Status": min_status,
        "Maximum Level AQI Status": max_status,
        "Average Level AQI Status": avg_status,
        "Overall AQI Status": worst_status
    })

    # Add CORS headers again just in case
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200

# Optional: root health check
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Air Quality Prediction API is live!"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
