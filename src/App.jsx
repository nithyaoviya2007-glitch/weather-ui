
import { useState } from "react";
import "./App.css";

const [weather, setWeather] = useState(null);
const [error, setError] = useState("");

const API_KEY = "d9b9f816b4f45b5c1680ca68fd99183e";
async function fetchWeather(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Weather request failed");
    }

    console.log("Live weather:", data);
    setWeather(data);
    setError("");
  } catch (err) {
    setError(err.message);
  }
}
function handleSearch(event) {
  event.preventDefault();

  if (search.trim()) {
    fetchWeather(search.trim());
  }
}
<form onSubmit={handleSearch}>
  <input
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Search a city..."
  />
  <button type="submit">Search</button>
</form>
{weather && (
  <div>
    <h2>{weather.name}</h2>
    <h1>{Math.round(weather.main.temp)}°C</h1>
    <p>{weather.weather[0].description}</p>
    <p>Humidity: {weather.main.humidity}%</p>
  </div>
)}

const weatherData = {
  Chennai: {
    temp: 32, feels: 35, condition: "Mostly Sunny",
    humidity: 65, wind: 12, visibility: 10,
    uv: 8, pressure: 1012, icon: "☀️",
    sunrise: "6:02 AM", sunset: "6:04 PM",
    high: 34, low: 27,
  },
  Bengaluru: {
    temp: 25, feels: 26, condition: "Partly Cloudy",
    humidity: 60, wind: 9, visibility: 9,
    uv: 6, pressure: 1015, icon: "⛅",
    sunrise: "6:10 AM", sunset: "6:02 PM",
    high: 28, low: 20,
  },
  Mumbai: {
    temp: 29, feels: 33, condition: "Light Rain",
    humidity: 84, wind: 15, visibility: 7,
    uv: 5, pressure: 1009, icon: "🌧️",
    sunrise: "6:25 AM", sunset: "6:20 PM",
    high: 31, low: 26,
  },
  Delhi: {
    temp: 30, feels: 32, condition: "Hazy Sunshine",
    humidity: 58, wind: 10, visibility: 6,
    uv: 7, pressure: 1011, icon: "🌤️",
    sunrise: "6:15 AM", sunset: "5:55 PM",
    high: 33, low: 24,
  },
  London: {
    temp: 16, feels: 14, condition: "Cloudy",
    humidity: 78, wind: 18, visibility: 8,
    uv: 2, pressure: 1018, icon: "☁️",
    sunrise: "7:15 AM", sunset: "6:20 PM",
    high: 18, low: 12,
  },
};

const hourly = [
  { time: "Now", icon: "☀️", temp: 32 },
  { time: "11 AM", icon: "🌤️", temp: 33 },
  { time: "12 PM", icon: "☀️", temp: 34 },
  { time: "1 PM", icon: "☀️", temp: 34 },
  { time: "2 PM", icon: "⛅", temp: 32 },
  { time: "3 PM", icon: "🌤️", temp: 31 },
];

const week = [
  { day: "Fri", icon: "☀️", high: 34, low: 27 },
  { day: "Sat", icon: "⛅", high: 32, low: 26 },
  { day: "Sun", icon: "🌦️", high: 30, low: 25 },
  { day: "Mon", icon: "🌧️", high: 29, low: 24 },
  { day: "Tue", icon: "🌤️", high: 33, low: 26 },
];

function App() {
  const [city, setCity] = useState("Chennai");
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  const weather = weatherData[city];

  const temperature = (value) =>
    unit === "C" ? value : Math.round(value * 9 / 5 + 32);

  function handleSearch(event) {
    event.preventDefault();

    const match = Object.keys(weatherData).find(
      (name) => name.toLowerCase() === search.trim().toLowerCase()
    );

    if (match) {
      setCity(match);
      setError("");
      setSearch("");
    } else {
      setError("Try Chennai, Bengaluru, Mumbai, Delhi or London.");
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">☁</span>
          <span>Sky<span className="brand-accent">Cast</span></span>
        </a>

        <div className="topbar-right">
          <span className="live-dot" />
          <span className="demo-label">WEATHER DASHBOARD</span>
          <button
            className="unit-toggle"
            onClick={() => setUnit(unit === "C" ? "F" : "C")}
            aria-label="Toggle temperature units"
          >
            °{unit === "C" ? "C / °F" : "F / °C"}
          </button>
        </div>
      </header>

      <section className="welcome-row" id="home">
        <div>
          <p className="eyebrow">YOUR PERSONAL WEATHER STATION</p>
          <h1>Weather made <span>beautiful.</span></h1>
          <p className="welcome-text">
            Explore the sky and plan your perfect day.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search a city..."
            aria-label="Search a city"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      {error && <p className="error-message">{error}</p>}

      <section className="dashboard-grid">
        <article className="panel hero-card">
          <div className="hero-top">
            <div>
              <span className="section-tag">CURRENT WEATHER</span>
              <h2>📍 {city}</h2>
              <p className="muted">Your selected location</p>
            </div>
            <span className="date-chip">TODAY</span>
          </div>

          <div className="hero-main">
            <div>
              <p className="temperature">
                {temperature(weather.temp)}<sup>°{unit}</sup>
              </p>
              <p className="weather-condition">{weather.condition}</p>
              <p className="high-low">
                H: {temperature(weather.high)}° · L: {temperature(weather.low)}°
              </p>
            </div>
            <div className="hero-weather-icon">{weather.icon}</div>
          </div>

          <div className="hero-divider" />

          <div className="hero-summary">
            <div>
              <span>🌡️</span>
              <p>Feels like</p>
              <strong>{temperature(weather.feels)}°{unit}</strong>
            </div>
            <div>
              <span>💧</span>
              <p>Humidity</p>
              <strong>{weather.humidity}%</strong>
            </div>
            <div>
              <span>💨</span>
              <p>Wind</p>
              <strong>{weather.wind} km/h</strong>
            </div>
          </div>
        </article>

        <article className="panel highlight-card">
          <div className="panel-heading">
            <div>
              <span className="section-tag">ATMOSPHERE</span>
              <h3>Today's highlights</h3>
            </div>
            <span className="heading-icon">✦</span>
          </div>

          <div className="metrics-grid">
            <Metric icon="💧" label="Humidity" value={`${weather.humidity}%`} note="Moisture in air" />
            <Metric icon="💨" label="Wind speed" value={`${weather.wind} km/h`} note="Surface wind" />
            <Metric icon="👁️" label="Visibility" value={`${weather.visibility} km`} note="Viewing distance" />
            <Metric icon="☀️" label="UV index" value={weather.uv} note="UV intensity" />
            <Metric icon="🌡️" label="Pressure" value={`${weather.pressure}`} unit="hPa" note="Air pressure" />
            <Metric icon="🌈" label="Conditions" value="Good" note="Sample assessment" />
          </div>
        </article>

        <article className="panel hourly-card">
          <div className="panel-heading">
            <div>
              <span className="section-tag">PLAN YOUR DAY</span>
              <h3>Hourly forecast</h3>
            </div>
            <span className="small-note">Next few hours</span>
          </div>

          <div className="hourly-list">
            {hourly.map((item, index) => (
              <div className={`hour-item ${index === 0 ? "hour-active" : ""}`} key={item.time}>
                <p>{item.time}</p>
                <span className="hour-icon">{item.icon}</span>
                <strong>{temperature(item.temp)}°</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel forecast-card">
          <div className="panel-heading">
            <div>
              <span className="section-tag">COMING DAYS</span>
              <h3>5-day forecast</h3>
            </div>
            <span className="heading-icon">↗</span>
          </div>

          <div className="week-list">
            {week.map((day) => (
              <div className="week-row" key={day.day}>
                <span className="week-day">{day.day}</span>
                <span className="week-icon">{day.icon}</span>
                <span className="week-low">{temperature(day.low)}°</span>
                <div className="temperature-track">
                  <div
                    className="temperature-fill"
                    style={{ width: `${((day.high - day.low) / 15) * 100}%` }}
                  />
                </div>
                <strong>{temperature(day.high)}°</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel sun-card">
          <div className="panel-heading">
            <div>
              <span className="section-tag">DAYLIGHT</span>
              <h3>Sunrise & sunset</h3>
            </div>
            <span className="sun-symbol">☀</span>
          </div>

          <div className="sun-times">
            <div>
              <span className="sun-icon">🌅</span>
              <p>Sunrise</p>
              <strong>{weather.sunrise}</strong>
            </div>
            <div>
              <span className="sun-icon">🌇</span>
              <p>Sunset</p>
              <strong>{weather.sunset}</strong>
            </div>
          </div>
          <div className="sun-track">
            <span>☀</span>
            <div />
            <span>☾</span>
          </div>
          <p className="sun-caption">Make the most of your daylight.</p>
        </article>
      </section>

      <footer className="footer">
        <div className="footer-brand">☁ SkyCast</div>
        <p>Made with React · Sample weather data for UI demonstration</p>
        <a href="#home">Back to top ↑</a>
      </footer>
    </main>
  );
}

function Metric({ icon, label, value, unit, note }) {
  return (
    <div className="metric-box">
      <div className="metric-top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <p className="metric-value">
        {value} {unit && <small>{unit}</small>}
      </p>
      <p className="metric-note">{note}</p>
    </div>
  );
}

export default App;