<script>
  import { toFahrenheit } from '../lib/weatherData.js';
  let { weather, useFahrenheit = false, isFavorite = false, onToggleFavorite } = $props();

  let displayTemp = $derived(useFahrenheit ? toFahrenheit(weather.temperature) : weather.temperature);
  let displayFeels = $derived(useFahrenheit ? toFahrenheit(weather.feelsLike) : weather.feelsLike);
  let unit = $derived(useFahrenheit ? '°F' : '°C');
</script>

<section class="weather-card glass-panel" aria-label="Cuaca saat ini">
  <div class="card-top">
    <div class="location-info">
      <div class="city-name-row">
        <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <h1 class="city-name">{weather.city.name}</h1>
      </div>
      <p class="country-name">{weather.city.country}</p>
    </div>
    <div class="header-actions">
      <button class="favorite-btn" onclick={onToggleFavorite} aria-label={isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit"} title={isFavorite ? "Hapus dari Favorit" : "Simpan Kota"}>
        <svg viewBox="0 0 24 24" fill={isFavorite ? "#facc15" : "none"} stroke={isFavorite ? "#facc15" : "currentColor"} stroke-width="2" width="22" height="22">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
      <div class="condition-badge">
        <span class="pulse-dot"></span>
        <span>Live</span>
      </div>
    </div>
  </div>

  <div class="card-center">
    <div class="weather-icon-wrap">
      <span class="weather-icon">{weather.condition.icon}</span>
    </div>
    <div class="temp-wrap">
      <span class="temp-value">{displayTemp}</span>
      <span class="temp-unit">{unit}</span>
    </div>
  </div>

  <div class="card-bottom">
    <p class="condition-label">{weather.condition.label}</p>
    <p class="feels-like">Terasa seperti {displayFeels}{unit}</p>
  </div>

  <div class="mini-stats">
    <div class="mini-stat">
      <span class="mini-stat-icon">💧</span>
      <span>{weather.humidity}%</span>
    </div>
    <div class="mini-stat">
      <span class="mini-stat-icon">💨</span>
      <span>{weather.windSpeed} km/h</span>
    </div>
    <div class="mini-stat">
      <span class="mini-stat-icon">☀️</span>
      <span>UV {weather.uvIndex}</span>
    </div>
  </div>
</section>

<style>
  .weather-card {
    padding: 2rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    animation: slideUp 0.6s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
  }

  .location-info { text-align: left; }

  .city-name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pin-icon { width: 20px; height: 20px; opacity: 0.8; }

  .city-name {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .country-name {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    margin-top: 0.15rem;
    margin-left: 1.75rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .favorite-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(8px);
  }

  .favorite-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .favorite-btn:active {
    transform: scale(0.95);
  }

  .condition-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.15);
    padding: 0.35rem 0.85rem;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
    backdrop-filter: blur(8px);
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .card-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  .weather-icon {
    font-size: 5rem;
    display: block;
    animation: iconBounce 3s ease-in-out infinite;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  }

  @keyframes iconBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .temp-wrap {
    display: flex;
    align-items: flex-start;
    line-height: 1;
  }

  .temp-value {
    font-size: 6rem;
    font-weight: 800;
    letter-spacing: -0.05em;
    background: linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.6));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .temp-unit {
    font-size: 1.75rem;
    font-weight: 600;
    opacity: 0.7;
    margin-top: 0.8rem;
  }

  .card-bottom { margin-bottom: 1.5rem; }

  .condition-label {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .feels-like {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }

  .mini-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .mini-stat {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .mini-stat-icon { font-size: 1rem; }

  @media (max-width: 480px) {
    .weather-card { padding: 1.5rem; }
    .city-name { font-size: 1.4rem; }
    .weather-icon { font-size: 3.5rem; }
    .temp-value { font-size: 4rem; }
  }
</style>
