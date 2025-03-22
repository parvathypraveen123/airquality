// =============================
// Create particles for animation
// =============================
document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles-container');
    const numberOfParticles = 50;
    
    for (let i = 0; i < numberOfParticles; i++) {
        createParticle();
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 15 + 5;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.background = `rgba(173, 216, 230, ${Math.random() * 0.4 + 0.1})`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }
});

// =============================
// Form submission handling (API Call)
// =============================
document.getElementById('prediction-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const location = document.getElementById('location').value.trim();
    const pollutant = document.getElementById('pollutant').value;

    if (!location || !pollutant) {
        alert("Please enter both location and pollutant.");
        return;
    }

    const pollutantMapping = {
        "pm25": "PM2.5",
        "pm10": "PM10",
        "o3": "O3",
        "no2": "NO2",
        "so2": "SO2",
        "co": "CO"
    };

    const mappedPollutant = pollutantMapping[pollutant.toLowerCase()];

    fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            location: location,
            pollutant: mappedPollutant
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`Error: ${data.error}`);
            return;
        }

        updateUIWithResults({
            minAQI: parseFloat(data["Minimum Pollutant Level"]),
            maxAQI: parseFloat(data["Maximum Pollutant Level"]),
            avgAQI: parseFloat(data["Average Pollutant Level"]),
            minStatus: data["Minimum Level AQI Status"],
            maxStatus: data["Maximum Level AQI Status"],
            avgStatus: data["Average Level AQI Status"],
            overallStatus: data["Overall AQI Status"]
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to get prediction. Please try again later.');
    });
});

function updateUIWithResults(result) {
    const { minAQI, maxAQI, avgAQI, minStatus, maxStatus, avgStatus, overallStatus } = result;

    // Update values in UI
    document.getElementById('location-display').textContent = document.getElementById('location').value;

    // Min/Max/Avg AQI values and statuses
    document.getElementById('min-aqi').textContent = minAQI.toFixed(2);
    document.getElementById('min-status').textContent = minStatus;

    document.getElementById('max-aqi').textContent = maxAQI.toFixed(2);
    document.getElementById('max-status').textContent = maxStatus;

    document.getElementById('avg-aqi').textContent = avgAQI.toFixed(2);
    document.getElementById('avg-status').textContent = avgStatus;

    // Description based on Overall Status
    let description = "";
    let recommendations = [];
    let position = "0%";

    switch (overallStatus) {
        case "Healthy":
            description = "Good - Air quality is satisfactory, and air pollution poses little or no risk.";
            recommendations = [
                "You can enjoy outdoor activities.",
                "The air quality is ideal for most individuals."
            ];
            position = "8%";
            break;
        case "Satisfactory":
            description = "Moderate - Air quality is acceptable, but some pollutants may be a concern for sensitive individuals.";
            recommendations = [
                "Unusually sensitive people should consider reducing prolonged outdoor exertion.",
                "It's a good day for most people to be outside."
            ];
            position = "25%";
            break;
        case "Unhealthy":
            description = "Unhealthy - May cause health effects for everyone, with more serious effects for sensitive groups.";
            recommendations = [
                "Sensitive groups should avoid prolonged outdoor exertion.",
                "Everyone else should reduce outdoor activity."
            ];
            position = "59%";
            break;
        case "Very Unhealthy":
            description = "Very Unhealthy - Health alert: The risk of health effects is increased for everyone.";
            recommendations = [
                "Everyone should avoid prolonged or heavy exertion outdoors.",
                "Stay indoors as much as possible."
            ];
            position = "76%";
            break;
        case "Hazardous":
            description = "Hazardous - Emergency conditions. Everyone is more likely to be affected.";
            recommendations = [
                "Everyone should avoid all outdoor activity.",
                "Remain indoors and keep windows closed."
            ];
            position = "92%";
            break;
        default:
            description = "Unknown status. Data might not be accurate.";
            recommendations = [
                "Please check your inputs or try again later."
            ];
            position = "0%";
    }

    document.getElementById('aqi-description').textContent = description;
    document.getElementById('scale-marker').style.left = position;

    // Update recommendations
    const recList = document.getElementById('recommendations');
    recList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recList.appendChild(li);
    });

    const resultSection = document.getElementById('result-section');
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}
