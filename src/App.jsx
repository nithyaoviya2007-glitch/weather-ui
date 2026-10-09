
import { useEffect, useState } from "react";
import "./App.css";

// Replace this with your OpenWeatherMap API key
const API_KEY = "d9b9f816b4f45b5c1680ca68fd99183e";

const WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

function getWeatherIcon(condition) {
  const icons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Smoke: "🌫️",
    Haze: "🌤️",
    Dust: "🌫️",
    Fog: "🌫️",
    Sand: "🌫️",
    Ash: "🌫️",
    Squall: "💨",
    Tornado: "🌪️",
  };

  return icons[condition] || "🌤️";
}

function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);

  return date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDay(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
  });
}

function App() {
  const [city, setCity] = useState("Chennai");
  const [search, setSearch] = useState("");
  const [unit, setUnit] = useState("C");
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [week, setWeek] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      if (
        !API_KEY ||
        API_KEY === "YOUR_OPENWEATHERMAP_API_KEY"
      ) {
        setError("Please add your OpenWeatherMap API key.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const currentResponse = await fetch(
          `${WEATHER_URL}?q=${encodeURIComponent(
            city
          )}&appid=${API_KEY}&units=metric`
        );

        const currentData = await currentResponse.json();

        if (!currentResponse.ok) {
          throw new Error(
            currentData.message || "Unable to fetch weather."
          );
        }

        const forecastResponse = await fetch(
          `${FORECAST_URL}?q=${encodeURIComponent(
            city
          )}&appid=${API_KEY}&units=metric`
        );

        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
          throw new Error(
            forecastData.message || "Unable to fetch forecast."
          );
        }

        const timezone = currentData.timezone || 0;
        const currentTemp = currentData.main.temp;

        setWeather({
          name: currentData.name,
          temp: currentTemp,
          feels: currentData.main.feels_like,
          condition: currentData.weather[0].description
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          humidity: currentData.main.humidity,
          wind: currentData.wind.speed * 3.6,
          visibility:
            (currentData.visibility ?? 0) / 1000,
          pressure: currentData.main.pressure,
          icon: getWeatherIcon(
            currentData.weather[0].main
          ),
          sunrise: formatTime(
            currentData.sys.sunrise,
            timezone
          ),
          sunset: formatTime(
            currentData.sys.sunset,
            timezone
          ),
          timezone,
          high: currentData.main.temp_max,
          low: currentData.main.temp_min,
        });

        const forecastList = forecastData.list || [];

        setHourly(
          [
            {
              time: "Now",
              temp: currentTemp,
              icon: getWeatherIcon(
                currentData.weather[0].main
              ),
            },
            ...forecastList.slice(0, 5).map((item) => ({
              time: new Date(
                (item.dt + timezone) * 1000
              ).toLocaleTimeString("en-US", {
                timeZone: "UTC",
                hour: "numeric",
              }),
              temp: item.main.temp,
              icon: getWeatherIcon(
                item.weather[0].main
              ),
            })),
          ]
        );

        const dailyForecast = {};

        forecastList.forEach((item) => {
          const date = new Date(
            (item.dt + timezone) * 1000
          )
            .toISOString()
            .slice(0, 10);

          if (!dailyForecast[date]) {
            dailyForecast[date] = {
              day: getDay(item.dt, timezone),
              temps: [],
              icons: [],
              timestamps: [],
            };
          }

          dailyForecast[date].temps.push({
            min: item.main.temp_min,
            max: item.main.temp_max,
          });

          dailyForecast[date].icons.push(
            item.weather[0].main
          );

          dailyForecast[date].timestamps.push(item.dt);
        });

        const dailyItems = Object.values(dailyForecast)
          .slice(0, 5)
          .map((day) => {
            const firstWeather = day.icons[0];

            return {
              day: day.day,
              icon: getWeatherIcon(firstWeather),
              high: Math.max(
                ...day.temps.map((temp) => temp.max)
              ),
              low: Math.min(
                ...day.temps.map((temp) => temp.min)
              ),
            };
          });

        setWeek(dailyItems);

        console.log("Live weather:", currentData);
        console.log("Live forecast:", forecastData);
      } catch (err) {
        setError(
          err.message === "Failed to fetch"
            ? "Network error. Check your internet or API key."
            : err.message
        );

        setWeather(null);
        setHourly([]);
        setWeek([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  const temperature = (value) => {
    if (value == null) return "--";

    return unit === "C"
      ? Math.round(value)
      : Math.round((value * 9) / 5 + 32);
  };

  function handleSearch(event) {
    event.preventDefault();

    const cityName = search.trim();

    if (cityName) {
      setCity(cityName);
      setSearch("");
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">☁</span>
          <span>
            Sky<span className="brand-accent">Cast</span>
          </span>
        </a>

        <div className="topbar-right">
          <span className="live-dot" />
          <span className="demo-label">
            LIVE WEATHER DASHBOARD
          </span>

          <button
            className="unit-toggle"
            onClick={() =>
              setUnit(unit === "C" ? "F" : "C")
            }
            aria-label="Toggle temperature units"
          >
            {unit === "C" ? "°C / °F" : "°F / °C"}
          </button>
        </div>
      </header>

      <section className="welcome-row" id="home">
        <div>
          <p className="eyebrow">
            YOUR PERSONAL WEATHER STATION
          </p>

          <h1>
            Weather made <span>beautiful.</span>
          </h1>

          <p className="welcome-text">
            Explore the sky and plan your perfect day.
          </p>
        </div>

        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <span className="search-icon">⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search a city..."
            aria-label="Search a city"
          />

          <button type="submit" disabled={loading}>
            Search
          </button>
        </form>
      </section>

      {error && (
        <p className="error-message">{error}</p>
      )}

      {loading && (
        <p className="welcome-text">
          Loading live weather...
        </p>
      )}

      {weather && (
        <section className="dashboard-grid">
          <article className="panel hero-card">
            <div className="hero-top">
              <div>
                <span className="section-tag">
                  CURRENT WEATHER
                </span>

                <h2>📍 {weather.name}</h2>

                <p className="muted">
                  Live weather conditions
                </p>
              </div>

              <span className="date-chip">LIVE</span>
            </div>

            <div className="hero-main">
              <div>
                <p className="temperature">
                  {temperature(weather.temp)}
                  <sup>°{unit}</sup>
                </p>

                <p className="weather-condition">
                  {weather.condition}
                </p>

                <p className="high-low">
                  H: {temperature(weather.high)}°
                  {" · "}
                  L: {temperature(weather.low)}°
                </p>
              </div>

              <div className="hero-weather-icon">
                {weather.icon}
              </div>
            </div>

            <div className="hero-divider" />

            <div className="hero-summary">
              <div>
                <span>🌡️</span>
                <p>Feels like</p>
                <strong>
                  {temperature(weather.feels)}°{unit}
                </strong>
              </div>

              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>

              <div>
                <span>💨</span>
                <p>Wind</p>
                <strong>
                  {Math.round(weather.wind)} km/h
                </strong>
              </div>
            </div>
          </article>

          <article className="panel highlight-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">
                  ATMOSPHERE
                </span>
                <h3>Today's highlights</h3>
              </div>

              <span className="heading-icon">✦</span>
            </div>

            <div className="metrics-grid">
              <Metric
                icon="💧"
                label="Humidity"
                value={`${weather.humidity}%`}
                note="Moisture in air"
              />

              <Metric
                icon="💨"
                label="Wind speed"
                value={`${Math.round(weather.wind)} km/h`}
                note="Surface wind"
              />

              <Metric
                icon="👁️"
                label="Visibility"
                value={`${weather.visibility} km`}
                note="Viewing distance"
              />

              <Metric
                icon="🌡️"
                label="Pressure"
                value={weather.pressure}
                unit="hPa"
                note="Air pressure"
              />

              <Metric
                icon="🌅"
                label="Sunrise"
                value={weather.sunrise}
                note="Local time"
              />

              <Metric
                icon="🌇"
                label="Sunset"
                value={weather.sunset}
                note="Local time"
              />
            </div>
          </article>

          <article className="panel hourly-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">
                  PLAN YOUR DAY
                </span>
                <h3>Hourly forecast</h3>
              </div>

              <span className="small-note">
                3-hour intervals
              </span>
            </div>

            <div className="hourly-list">
              {hourly.map((item, index) => (
                <div
                  className={`hour-item ${
                    index === 0 ? "hour-active" : ""
                  }`}
                  key={`${item.time}-${index}`}
                >
                  <p>{item.time}</p>
                  <span className="hour-icon">
                    {item.icon}
                  </span>
                  <strong>
                    {temperature(item.temp)}°
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel forecast-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">
                  COMING DAYS
                </span>
                <h3>5-day forecast</h3>
              </div>

              <span className="heading-icon">↗</span>
            </div>

            <div className="week-list">
              {week.map((day, index) => (
                <div className="week-row" key={index}>
                  <span className="week-day">
                    {day.day}
                  </span>

                  <span className="week-icon">
                    {day.icon}
                  </span>

                  <span className="week-low">
                    {temperature(day.low)}°
                  </span>

                  <div className="temperature-track">
                    <div
                      className="temperature-fill"
                      style={{
                        width: `${Math.max(
                          10,
                          Math.min(
                            100,
                            ((day.high - day.low) / 20) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {temperature(day.high)}°
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel sun-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">
                  DAYLIGHT
                </span>
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

            <p className="sun-caption">
              Make the most of your daylight.
            </p>
          </article>
        </section>
      )}

      <footer className="footer">
        <div className="footer-brand">☁ SkyCast</div>

        <p>
          Made with React · Powered by OpenWeatherMap
        </p>

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