// WeatherWidget.jsx — fetches live weather using the free Open-Meteo API (no key needed).
// The user enters a city name; we geocode it first, then fetch the forecast.
import React, { useState, useEffect } from 'react'

// WMO weather codes → human-readable descriptions and emojis.
const WMO_CODES = {
  0: { desc: 'Clear sky', emoji: '☀️' },
  1: { desc: 'Mainly clear', emoji: '🌤' },
  2: { desc: 'Partly cloudy', emoji: '⛅' },
  3: { desc: 'Overcast', emoji: '☁️' },
  45: { desc: 'Foggy', emoji: '🌫' },
  48: { desc: 'Icy fog', emoji: '🌫' },
  51: { desc: 'Light drizzle', emoji: '🌦' },
  53: { desc: 'Drizzle', emoji: '🌦' },
  55: { desc: 'Heavy drizzle', emoji: '🌧' },
  61: { desc: 'Light rain', emoji: '🌧' },
  63: { desc: 'Rain', emoji: '🌧' },
  65: { desc: 'Heavy rain', emoji: '🌧' },
  71: { desc: 'Light snow', emoji: '🌨' },
  73: { desc: 'Snow', emoji: '❄️' },
  75: { desc: 'Heavy snow', emoji: '❄️' },
  80: { desc: 'Rain showers', emoji: '🌦' },
  95: { desc: 'Thunderstorm', emoji: '⛈' },
}

export default function WeatherWidget({ config, onChange }) {
  const [city, setCity] = useState(config.city || '')
  const [weather, setWeather] = useState(config.weather || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch weather on mount if a city is already saved.
  useEffect(() => {
    if (config.city && !config.weather) fetchWeather(config.city)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchWeather(cityName) {
    setLoading(true)
    setError(null)

    try {
      // Step 1: geocode the city name to get lat/lon.
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      )
      const geoData = await geoRes.json()

      if (!geoData.results || geoData.results.length === 0) {
        setError('City not found. Try a different spelling.')
        setLoading(false)
        return
      }

      const { latitude, longitude, name, country } = geoData.results[0]

      // Step 2: fetch current weather for those coordinates.
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
      )
      const weatherData = await weatherRes.json()
      const cw = weatherData.current_weather

      const result = {
        temp: Math.round(cw.temperature),
        code: cw.weathercode,
        city: `${name}, ${country}`,
      }

      setWeather(result)
      // Save the city and last-fetched weather to config so it persists.
      onChange({ city: cityName, weather: result })
    } catch (err) {
      setError('Could not fetch weather. Check your connection.')
    }

    setLoading(false)
  }

  function handleSearch(e) {
    e.preventDefault()
    if (city.trim()) fetchWeather(city.trim())
  }

  const wmo = weather ? (WMO_CODES[weather.code] || { desc: 'Unknown', emoji: '🌡' }) : null

  return (
    <div>
      <form className="weather-city-form" onSubmit={handleSearch}>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Enter a city…"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
          {loading ? '…' : 'Go'}
        </button>
      </form>

      {error && <p style={{ color: '#e53e3e', fontSize: '0.85rem' }}>{error}</p>}

      {weather && wmo && (
        <div className="weather-display">
          <div style={{ fontSize: '3rem' }}>{wmo.emoji}</div>
          <div className="weather-temp">{weather.temp}°F</div>
          <div className="weather-desc">{wmo.desc}</div>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '0.4rem' }}>{weather.city}</div>
        </div>
      )}

      {!weather && !loading && !error && (
        <p style={{ color: '#a0aec0', fontSize: '0.85rem', textAlign: 'center' }}>
          Enter a city above to see the weather.
        </p>
      )}
    </div>
  )
}
