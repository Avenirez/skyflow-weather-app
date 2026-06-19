<script>
  import AnimatedBackground from './components/AnimatedBackground.svelte';
  import WeatherCard from './components/WeatherCard.svelte';
  import WeatherDetails from './components/WeatherDetails.svelte';
  import { onMount } from 'svelte';
  import ForecastSection from './components/ForecastSection.svelte';
  import SearchHistory from './components/SearchHistory.svelte';
  import WeatherMap from './components/WeatherMap.svelte';
  import {
    CITIES,
    searchCities,
    generateWeatherData,
    generateForecast,
    generateHourlyForecast,
    formatDateIndonesian,
    fetchCityCoordinates,
    fetchRealWeatherData,
    fetchAirQuality
  } from './lib/weatherData.js';

  // State
  let searchQuery = $state('');
  let searchResults = $state([]);
  let showDropdown = $state(false);
  let useFahrenheit = $state(false);
  let selectedCity = $state(CITIES[0]);
  let weather = $state(generateWeatherData(CITIES[0]));
  let forecast = $state(generateForecast(CITIES[0]));
  let hourly = $state(generateHourlyForecast(CITIES[0]));
  let searchHistory = $state(loadHistory());
  let favorites = $state(loadFavorites());
  let isLoading = $state(false);
  let airQuality = $state(null);

  let todayDate = formatDateIndonesian(new Date());
  let isCityFavorite = $derived(favorites.some(c => c.name === selectedCity.name));

  onMount(() => {
    loadRealDataForCity(selectedCity);
  });

  async function loadRealDataForCity(city) {
    isLoading = true;
    try {
      const realData = await fetchRealWeatherData(city.lat, city.lon, city.name, city.country);
      weather = realData.weatherData;
      forecast = realData.forecast;
      hourly = realData.hourly;
      airQuality = await fetchAirQuality(city.lat, city.lon);
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  // Search handling
  async function handleSearchInput(e) {
    searchQuery = e.target.value;
    if (searchQuery.length > 2) {
      searchResults = await fetchCityCoordinates(searchQuery);
      showDropdown = searchResults.length > 0;
    } else {
      searchResults = [];
      showDropdown = false;
    }
  }

  function selectCity(city) {
    searchQuery = '';
    searchResults = [];
    showDropdown = false;
    selectedCity = city;
    addToHistory(city);
    loadRealDataForCity(city);
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung di browser Anda.");
      return;
    }
    isLoading = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityObj = { name: "Lokasi Anda", country: "Dideteksi otomatis", lat: latitude, lon: longitude };
        selectedCity = cityObj;
        loadRealDataForCity(cityObj);
      },
      (err) => {
        console.error(err);
        alert("Gagal mendeteksi lokasi. Pastikan izin lokasi diberikan.");
        isLoading = false;
      }
    );
  }

  function handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      showDropdown = false;
    }
  }

  function handleBlur() {
    setTimeout(() => { showDropdown = false; }, 200);
  }

  // Unit toggle
  function toggleUnit() {
    useFahrenheit = !useFahrenheit;
  }

  // History management
  function loadHistory() {
    try {
      const saved = localStorage.getItem('skyflow_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('skyflow_history', JSON.stringify(searchHistory));
    } catch { /* ignore */ }
  }

  function addToHistory(city) {
    searchHistory = [city, ...searchHistory.filter((c) => c.name !== city.name)].slice(0, 8);
    saveHistory();
  }

  function removeFromHistory(index) {
    searchHistory = searchHistory.filter((_, i) => i !== index);
    saveHistory();
  }

  function loadFavorites() {
    try {
      const saved = localStorage.getItem('skyflow_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('skyflow_favorites', JSON.stringify(favorites));
    } catch { /* ignore */ }
  }

  function toggleFavorite() {
    const isFav = favorites.some(c => c.name === selectedCity.name);
    if (isFav) {
      favorites = favorites.filter(c => c.name !== selectedCity.name);
    } else {
      favorites = [selectedCity, ...favorites];
    }
    saveFavorites();
  }
</script>

<svelte:head>
  <title>SkyFlow — Prakiraan Cuaca</title>
  <meta name="description" content="SkyFlow - Aplikasi prakiraan cuaca modern dan interaktif dengan visualisasi dinamis." />
</svelte:head>

<AnimatedBackground {weather} />

<div class="app" class:loading={isLoading}>
  <!-- Header / Navbar -->
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <span class="logo-icon">⛅</span>
        <span class="logo-text">SkyFlow</span>
      </div>
      <span class="header-date">{todayDate}</span>
    </div>

    <div class="header-right">
      <button class="unit-toggle" onclick={toggleUnit} aria-label="Ganti unit suhu">
        <span class="unit-option" class:active={!useFahrenheit}>°C</span>
        <span class="unit-divider">/</span>
        <span class="unit-option" class:active={useFahrenheit}>°F</span>
      </button>
    </div>
  </header>

  <!-- Search Bar -->
  <div class="search-container">
    <div class="search-input-wrapper glass-panel">
      <button class="location-btn" onclick={detectLocation} aria-label="Deteksi Lokasi Saya" title="Gunakan Lokasi Saat Ini">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2m0 16v2m10-10h-2M4 12H2"/>
        </svg>
      </button>
      <div class="search-divider"></div>
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        id="city-search"
        placeholder="Cari kota... (contoh: Bandung, Tokyo, London)"
        value={searchQuery}
        oninput={handleSearchInput}
        onkeydown={handleSearchKeydown}
        onblur={handleBlur}
        autocomplete="off"
      />
    </div>

    {#if showDropdown}
      <ul class="search-dropdown glass-panel" role="listbox">
        {#each searchResults as city}
          <li>
            <button class="search-result" onmousedown={() => selectCity(city)} role="option" aria-selected="false">
              <svg class="result-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div class="result-info">
                <span class="result-name">{city.name}</span>
                <span class="result-country">{city.country}</span>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <!-- Main Content -->
  <main class="main-content">
    <div class="main-grid">
      <div class="col-main">
        <WeatherCard {weather} {useFahrenheit} isFavorite={isCityFavorite} onToggleFavorite={toggleFavorite} />
        <WeatherMap lat={selectedCity.lat} lon={selectedCity.lon} name={selectedCity.name} />
        <SearchHistory
          history={searchHistory}
          favorites={favorites}
          onselect={selectCity}
          onremove={removeFromHistory}
          onremoveFavorite={(idx) => { favorites = favorites.filter((_, i) => i !== idx); saveFavorites(); }}
        />
      </div>

      <div class="col-side">
        <WeatherDetails {weather} {useFahrenheit} {airQuality} />
        <ForecastSection {forecast} {hourly} {useFahrenheit} />
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="app-footer">
    <p>SkyFlow &copy; 2026 — Dibuat dengan ❤️ dan Svelte</p>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    transition: opacity 0.3s ease;
  }

  .app.loading { opacity: 0.6; pointer-events: none; }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    margin-bottom: 1.25rem;
  }

  .header-left { display: flex; align-items: center; gap: 1.5rem; }

  .logo { display: flex; align-items: center; gap: 0.5rem; }
  .logo-icon { font-size: 1.75rem; }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-date { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 500; }
  .header-right { display: flex; align-items: center; gap: 1rem; }

  .unit-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    transition: background 0.3s ease;
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  .unit-toggle:hover { background: rgba(255, 255, 255, 0.2); }

  .unit-option { transition: color 0.3s ease, opacity 0.3s ease; opacity: 0.5; }
  .unit-option.active { color: #ffffff; opacity: 1; }
  .unit-divider { opacity: 0.3; }

  .search-container { position: relative; margin-bottom: 1.5rem; z-index: 100; }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    border-radius: 16px;
    transition: border-color 0.3s ease;
  }

  .search-input-wrapper:focus-within { border-color: rgba(255, 255, 255, 0.4); }

  .location-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    opacity: 0.7;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: opacity 0.2s, transform 0.2s;
  }
  .location-btn:hover { opacity: 1; transform: scale(1.1); }
  .search-divider { width: 1px; height: 20px; background: rgba(255, 255, 255, 0.2); margin: 0 0.25rem; }

  .search-icon { width: 20px; height: 20px; opacity: 0.5; flex-shrink: 0; }

  .search-input-wrapper input {
    flex: 1;
    background: transparent;
    font-size: 0.95rem;
    color: #ffffff;
    border: none;
    outline: none;
    font-family: inherit;
  }

  .search-input-wrapper input::placeholder { color: rgba(255, 255, 255, 0.4); }

  .search-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    border-radius: 16px;
    overflow: hidden;
    list-style: none;
    animation: dropDown 0.25s ease;
  }

  @keyframes dropDown {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.85rem 1.25rem;
    text-align: left;
    color: #ffffff;
    background: transparent;
    transition: background 0.2s ease;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  .search-result:hover { background: rgba(255, 255, 255, 0.15); }

  .result-pin { opacity: 0.5; flex-shrink: 0; }
  .result-info { display: flex; flex-direction: column; gap: 0.1rem; }
  .result-name { font-weight: 600; font-size: 0.9rem; }
  .result-country { font-size: 0.75rem; color: var(--color-text-secondary); }

  .main-content { flex: 1; }

  .main-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .col-main { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }
  .col-side { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

  .app-footer {
    text-align: center;
    padding: 2rem 0 1rem;
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  @media (max-width: 900px) {
    .main-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .app { padding: 0.75rem; }
    .header-left { gap: 0.75rem; }
    .header-date { display: none; }
    .logo-text { font-size: 1.25rem; }
  }
</style>
