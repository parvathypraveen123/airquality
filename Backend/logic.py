from geopy.geocoders import Nominatim
import numpy as np
import pandas as pd
import joblib


def get_lat_lon_if_india(location):
    geolocator = Nominatim(user_agent="geo_locator")
    location_data = geolocator.geocode(location, exactly_one=True, country_codes="IN")  
    
    if location_data:
        return list((location_data.latitude, location_data.longitude))
    else:
        return None

locat=input("Enter the location:")

coordinates = get_lat_lon_if_india(locat)

if coordinates:
    locat = coordinates  # Keep as a list
else:
    print("Location not found in India.")


pollutid = {
    'CO': 0, 'CARBON MONOXIDE': 0,
    'NH3': 1, 'AMMONIA': 1,
    'NO2': 2, 'NITROGEN DIOXIDE': 2,
    'OZONE': 3, 'O3': 3,
    'PM10': 4, 'PARTICULATE MATTER 10': 4,
    'PM2.5': 5, 'PARTICULATE MATTER 2.5': 5,
    'SO2': 6, 'SULFUR DIOXIDE': 6
}

pollut = input("Enter the pollutant: ").strip().upper()  # Convert input to uppercase

if pollut in pollutid:
    pollutant_id = int(pollutid[pollut])  # Ensure it's an integer
    locat.append(pollutant_id)

else:
    print("Can't find the pollutant.")
locat=[locat]

feature_names = ["latitude", "longitude", "pollutant_id"]
sample_test_df = pd.DataFrame(locat, columns=feature_names)


# Load the trained model
model = joblib.load("air_quality_model.pkl")

# Load the scaler if feature scaling was used
sc = joblib.load("scaler.pkl")


# Scale only the first two columns (latitude, longitude)
scaled_values = sc.transform(sample_test_df.iloc[:, :2])

# Convert scaled values to DataFrame
scaled_df = pd.DataFrame(scaled_values, columns=["latitude", "longitude"])

# Add pollutant_id back to the DataFrame
scaled_df["pollutant_id"] = sample_test_df["pollutant_id"].values



man=model.predict(scaled_df)
man.shape
att = ["Minimum Pollutant level", "Maximum Pollutant level", "Average Pollutant level"]
man = man.reshape(1, -1)
predicted = pd.DataFrame(man, columns=att)
avg_pollutant = predicted["Average Pollutant level"].iloc[0]

predicted=predicted.to_string(index=False)
print(predicted)

if avg_pollutant<50:
    print("Your AQI level is Healthy.")
elif 51<=avg_pollutant<=100:
    print("Your AQI level is Satisfactory. Be aware.")
elif avg_pollutant>100:
    print("Your AQI level is Unhealthy.")