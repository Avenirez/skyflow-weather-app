<script>
  import { getUvLevel, getWindLevel, toFahrenheit } from '../lib/weatherData.js';
  let { weather, useFahrenheit = false, airQuality = null } = $props();

  // Prefer actual UV from API if available
  let uvVal = $derived(airQuality?.uv_index !== undefined ? Math.round(airQuality.uv_index) : weather.uvIndex);
  let uvInfo = $derived(getUvLevel(uvVal));
  let windLabel = $derived(getWindLevel(weather.windSpeed));
  let dewPointDisplay = $derived(useFahrenheit ? toFahrenheit(weather.dewPoint) : weather.dewPoint);
  let dewUnit = $derived(useFahrenheit ? '°F' : '°C');

  const windRotation = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

  // AQI Logic
  function getAqiInfo(aqi) {
    if (!aqi) return { label: 'Tidak tersedia', color: '#94a3b8' };
    if (aqi <= 20) return { label: 'Sangat Baik', color: '#4ade80' };
    if (aqi <= 40) return { label: 'Baik', color: '#86efac' };
    if (aqi <= 60) return { label: 'Sedang', color: '#facc15' };
    if (aqi <= 80) return { label: 'Buruk', color: '#fb923c' };
    if (aqi <= 100) return { label: 'Sangat Buruk', color: '#f87171' };
    return { label: 'Berbahaya', color: '#991b1b' };
  }
  let aqiInfo = $derived(getAqiInfo(airQuality?.european_aqi));

  // Extreme Weather Alert Logic
  let extremeAlerts = $derived.by(() => {
    const alerts = [];
    if (weather.windSpeed > 40) alerts.push("Angin Kencang");
    if (uvVal >= 8) alerts.push("UV Ekstrem");
    if (airQuality?.european_aqi >= 80) alerts.push("Kualitas Udara Buruk");
    if (weather.conditionKey === 'thunderstorm' || weather.conditionKey === 'heavy_rain') alerts.push("Hujan Badai/Lebat");
    return alerts;
  });
</script>

<section class="weather-details" aria-label="Detail cuaca">
  <div class="header-with-alert">
    <h2 class="section-title">Detail Cuaca</h2>
    {#if extremeAlerts.length > 0}
      <div class="extreme-alert">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">Peringatan: {extremeAlerts.join(", ")}</span>
      </div>
    {/if}
  </div>
  <div class="details-grid">

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">💧</span>
        <span class="detail-label">Kelembapan</span>
      </div>
      <div class="detail-value">{weather.humidity}%</div>
      <div class="detail-bar-container">
        <div class="detail-bar" style="width: {weather.humidity}%; background: linear-gradient(90deg, #3b82f6, #60a5fa)"></div>
      </div>
      <p class="detail-desc">Titik embun: {dewPointDisplay}{dewUnit}</p>
    </div>

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">💨</span>
        <span class="detail-label">Angin</span>
      </div>
      <div class="detail-value">{weather.windSpeed} <small>km/h</small></div>
      <div class="wind-direction">
        <svg class="compass" viewBox="0 0 40 40" style="transform: rotate({windRotation[weather.windDir] || 0}deg)">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          <polygon points="20,4 16,22 20,18 24,22" fill="rgba(255,255,255,0.8)"/>
        </svg>
        <span class="wind-dir-label">{weather.windDir}</span>
      </div>
      <p class="detail-desc">{windLabel}</p>
    </div>

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">☀️</span>
        <span class="detail-label">Indeks UV</span>
      </div>
      <div class="detail-value" style="color: {uvInfo.color}">{uvVal}</div>
      <div class="uv-scale">
        {#each [1,2,3,4,5,6,7,8,9,10,11] as level}
          <div
            class="uv-dot"
            class:active={uvVal >= level}
            style="background: {uvVal >= level ? uvInfo.color : 'rgba(255,255,255,0.15)'}"
          ></div>
        {/each}
      </div>
      <p class="detail-desc">{uvInfo.label}</p>
    </div>

    {#if airQuality}
      <div class="detail-card glass-panel aqi-card">
        <div class="detail-header">
          <span class="detail-icon">🍃</span>
          <span class="detail-label">Kualitas Udara (AQI)</span>
        </div>
        <div class="detail-value" style="color: {aqiInfo.color}">{Math.round(airQuality.european_aqi)}</div>
        <div class="aqi-metrics">
          <span title="PM2.5">PM2.5: {airQuality.pm2_5}</span>
          <span title="PM10">PM10: {airQuality.pm10}</span>
        </div>
        <p class="detail-desc">{aqiInfo.label}</p>
      </div>
    {/if}

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">🌡️</span>
        <span class="detail-label">Tekanan Udara</span>
      </div>
      <div class="detail-value">{weather.pressure} <small>hPa</small></div>
      <div class="pressure-indicator">
        <div class="pressure-range">
          <span>Rendah</span>
          <span>Normal</span>
          <span>Tinggi</span>
        </div>
        <div class="detail-bar-container">
          <div class="detail-bar" style="width: {Math.min(((weather.pressure - 990) / 40) * 100, 100)}%; background: linear-gradient(90deg, #a78bfa, #818cf8)"></div>
        </div>
      </div>
      <p class="detail-desc">{weather.pressure > 1020 ? 'Tekanan tinggi' : weather.pressure < 1005 ? 'Tekanan rendah' : 'Tekanan normal'}</p>
    </div>

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">👁️</span>
        <span class="detail-label">Jarak Pandang</span>
      </div>
      <div class="detail-value">{weather.visibility} <small>km</small></div>
      <div class="detail-bar-container">
        <div class="detail-bar" style="width: {Math.min((weather.visibility / 20) * 100, 100)}%; background: linear-gradient(90deg, #34d399, #6ee7b7)"></div>
      </div>
      <p class="detail-desc">{weather.visibility >= 10 ? 'Jarak pandang baik' : weather.visibility >= 5 ? 'Jarak pandang sedang' : 'Jarak pandang buruk'}</p>
    </div>

    <div class="detail-card glass-panel">
      <div class="detail-header">
        <span class="detail-icon">☁️</span>
        <span class="detail-label">Tutupan Awan</span>
      </div>
      <div class="detail-value">{weather.cloudCover}%</div>
      <div class="detail-bar-container">
        <div class="detail-bar" style="width: {weather.cloudCover}%; background: linear-gradient(90deg, #94a3b8, #cbd5e1)"></div>
      </div>
      <p class="detail-desc">{weather.cloudCover < 25 ? 'Langit jernih' : weather.cloudCover < 60 ? 'Berawan sebagian' : 'Langit tertutup awan'}</p>
    </div>

  </div>
</section>

<style>
  .weather-details { animation: slideUp 0.6s ease 0.2s both; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; opacity: 0.9; }

  .header-with-alert { display: flex; flex-direction: column; }
  
  .extreme-alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: #fca5a5;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
    animation: pulseAlert 2s infinite;
  }
  
  @keyframes pulseAlert {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }

  .aqi-metrics {
    display: flex;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .aqi-metrics span {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .detail-card {
    padding: 1.25rem;
    border-radius: 18px;
    transition: transform 0.3s ease, background 0.3s ease;
  }

  .detail-card:hover {
    transform: translateY(-4px);
    background: var(--glass-bg-hover);
  }

  .detail-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
  .detail-icon { font-size: 1.15rem; }

  .detail-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .detail-value {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
    letter-spacing: -0.03em;
  }

  .detail-value small { font-size: 0.85rem; font-weight: 500; opacity: 0.7; }

  .detail-bar-container {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .detail-bar { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
  .detail-desc { font-size: 0.75rem; color: var(--color-text-secondary); }

  .wind-direction { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .compass { width: 40px; height: 40px; transition: transform 0.5s ease; }
  .wind-dir-label { font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); }

  .uv-scale { display: flex; gap: 3px; margin-bottom: 0.75rem; }

  .uv-dot {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    transition: background 0.4s ease;
  }

  .pressure-range {
    display: flex;
    justify-content: space-between;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 0.35rem;
  }

  @media (max-width: 480px) {
    .details-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
    .detail-card { padding: 1rem; }
    .detail-value { font-size: 1.5rem; }
  }
</style>
