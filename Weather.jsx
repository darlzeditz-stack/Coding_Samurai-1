import React, { useState, useEffect } from 'react';
import './Weather.css';

const getTempColor = (temp) => {
  if (temp <= 0) return '#00f';
  if (temp > 0 && temp <= 15) return '#0ff';
  if (temp > 15 && temp <= 25) return '#0f0';
  if (temp > 25 && temp <= 35) return '#ff0';
  if (temp > 35) return '#f00';
};

function Weather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgClass, setBgClass] = useState('sunny');
  const [animatedTemp, setAnimatedTemp] = useState(0);

  const API_KEY = 'YOUR_API_KEY'; // Replace with OpenWeatherMap API key

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();
      if (weatherData.cod !== 200) {
        setError(weatherData.message);
        setWeather(null);
        setForecast([]);
        setLoading(false);
        return;
      }
      setWeather(weatherData);

      const main = weatherData.weather[0].main.toLowerCase();
      let newBg = 'sunny';
      if (main.includes('cloud')) newBg = 'cloudy';
      else if (main.includes('rain') || main.includes('drizzle')) newBg = 'rainy';
      else if (main.includes('snow')) newBg = 'snowy';
      setBgClass(newBg);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();
      const dailyForecast = forecastData.list.filter(f => f.dt_txt.includes('12:00:00'));
      setForecast(dailyForecast);
    } catch {
      setError('Failed to fetch weather');
      setWeather(null);
      setForecast([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') fetchWeather(); };

  // Animate temperature
  useEffect(() => {
    if (!weather) return;
    let current = 0;
    const target = Math.round(weather.main.temp);
    const step = target / 50;
    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedTemp(Math.round(current));
    }, 20);
    return () => clearInterval(interval);
  }, [weather]);

  return (
    <div className={`weather-container ${bgClass}`}>
      <div className={`weather-bg sun ${bgClass === 'sunny' ? 'active' : ''}`}></div>
      <div className={`weather-bg clouds ${bgClass === 'cloudy' ? 'active' : ''}`}></div>
      <div className={`weather-bg rain ${bgClass === 'rainy' ? 'active' : ''}`}></div>
      <div className={`weather-bg snow ${bgClass === 'snowy' ? 'active' : ''}`}></div>

      <div className="weather-content">
        <h1>🌤 Weather App</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="current-weather" style={{ backgroundColor: getTempColor(weather.main.temp) }}>
            <div>
              <h2>{weather.name}, {weather.sys.country}</h2>
              <p>{weather.weather[0].description.toUpperCase()}</p>
              <p>🌡 {animatedTemp}°C</p>
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>💨 Wind: {weather.wind.speed} m/s</p>
            </div>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt={weather.weather[0].description} />
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            {forecast.map((f, index) => (
              <div
                key={f.dt}
                className="forecast-card"
                style={{
                  backgroundColor: getTempColor(f.main.temp),
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <p>{new Date(f.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <img src={`https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`} alt={f.weather[0].description} />
                <p>{Math.round(f.main.temp)}°C</p>
                <p>{f.weather[0].main}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;

