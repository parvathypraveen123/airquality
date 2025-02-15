import requests
import pickle
import numpy as np
import pandas as pd
from io import StringIO
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor
import joblib

def train_and_save_model():
    url = "https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=579b464db66ec23bdd0000017efe3bfc6faf4ce178a67b58c069460e&format=csv&limit=600"
    headers = {
        "Authorization": "Bearer 579b464db66ec23bdd0000017efe3bfc6faf4ce178a67b58c069460e"
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        csv_data = response.text
        if csv_data.strip():
            df = pd.read_csv(StringIO(csv_data))
        else:
            print("The response data is empty.")
            return
    else:
        print(f"Failed to fetch data. Status code: {response.status_code}")
        return
    
    df.drop(["country", "last_update", "state", "city", "station"], axis=1, inplace=True)
    df[["pollutant_min", "pollutant_max", "pollutant_avg"]] = df[["pollutant_min", "pollutant_max", "pollutant_avg"]].fillna(0)
    
    outliers = ["longitude", "pollutant_min", "pollutant_max", "pollutant_avg"]
    for col in outliers:
        q1 = np.percentile(df[col], 25, method='midpoint')
        q3 = np.percentile(df[col], 75, method='midpoint')
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
    
    le = LabelEncoder()
    df['pollutant_id'] = le.fit_transform(df['pollutant_id'])
    
    sc = StandardScaler()
    x = df.drop(["pollutant_min", "pollutant_max", "pollutant_avg"], axis=1)
    y = df[["pollutant_min", "pollutant_max", "pollutant_avg"]]
    x[['latitude', 'longitude']] = sc.fit_transform(x[['latitude', 'longitude']])
    
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    
    # Define the model
    xgb = MultiOutputRegressor(XGBRegressor())

    # Hyperparameter tuning
    param_grid_xgb = {
        'estimator__n_estimators': [50, 100, 200],  
        'estimator__learning_rate': [0.01, 0.1, 0.2],  
        'estimator__max_depth': [3, 5, 10],  
        'estimator__min_child_weight': [1, 3, 5],  
        'estimator__subsample': [0.7, 0.8, 1.0],  
        'estimator__colsample_bytree': [0.7, 0.8, 1.0],  
        'estimator__gamma': [0, 0.1, 0.2]  
    }

    gcxgb = GridSearchCV(
        estimator=xgb, 
        param_grid=param_grid_xgb, 
        cv=5, 
        n_jobs=-1, 
        verbose=2, 
        scoring='r2'
    )

    gcxgb.fit(x_train, y_train)
    best_gbr = gcxgb.best_estimator_
    y_pred = best_gbr.predict(x_test)

    from sklearn.metrics import mean_squared_error, mean_absolute_error
    print('MSE:', mean_squared_error(y_test, y_pred))
    print('MAE:', mean_absolute_error(y_test, y_pred))

    # Save the model
    with open("air_quality_model.pkl", "wb") as f:
        pickle.dump(best_gbr, f)
    
    print("Model trained, tuned, and saved successfully!")

    # Save the scaler
    joblib.dump(sc, "scaler.pkl")

import schedule
schedule.every().day.at("00:00").do(train_and_save_model)
print("success")
