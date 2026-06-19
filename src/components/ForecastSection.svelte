<script>
  import { toFahrenheit } from '../lib/weatherData.js';
  let { forecast = [], hourly = [], useFahrenheit = false } = $props();

  let activeTab = $state('daily');

  let unit = $derived(useFahrenheit ? '°F' : '°C');

  function tempDisplay(temp) {
    return useFahrenheit ? toFahrenheit(temp) : temp;
  }
</script>

<section class="forecast-section" aria-label="Prakiraan cuaca">
  <div class="forecast-header">
    <h2 class="section-title">Prakiraan Cuaca</h2>
    <div class="tab-switcher">
      <button
        class="tab-btn"
        class:active={activeTab === 'hourly'}
        onclick={() => activeTab = 'hourly'}
      >Per Jam</button>
      <button
        class="tab-btn"
        class:active={activeTab === 'daily'}
        onclick={() => activeTab = 'daily'}
      >7 Hari</button>
    </div>
  </div>

  <div class="daily-forecast" style="display: {activeTab === 'daily' ? 'flex' : 'none'}">
    {#each forecast as day, i}
      <div class="forecast-row glass-panel" style="animation-delay: {i * 0.06}s">
        <span class="forecast-day">{day.dayName}</span>
        <span class="forecast-icon">{day.condition.icon}</span>
        <div class="forecast-rain">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" style="opacity: 0.5">
            <path d="M8 1a5 5 0 0 0-5 5c0 3 5 8 5 8s5-5 5-8a5 5 0 0 0-5-5z"/>
          </svg>
          <span>{day.rainChance}%</span>
        </div>
        <div class="forecast-temp-range">
          <span class="temp-low">{tempDisplay(day.tempLow)}°</span>
          <div class="temp-bar-container">
            <div
              class="temp-bar"
              style="
                left: {((day.tempLow + 10) / 60) * 100}%;
                width: {((day.tempHigh - day.tempLow) / 60) * 100}%;
              "
            ></div>
          </div>
          <span class="temp-high">{tempDisplay(day.tempHigh)}°</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="hourly-forecast" style="display: {activeTab === 'hourly' ? 'flex' : 'none'}">
    {#each hourly as hour, i}
      <div class="hourly-card glass-panel" class:is-now={hour.isNow} style="animation-delay: {i * 0.03}s">
        <span class="hourly-time">{hour.isNow ? 'Saat ini' : hour.hour}</span>
        <span class="hourly-icon">{hour.condition.icon}</span>
        <span class="hourly-temp">{tempDisplay(hour.temp)}{unit}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .forecast-section { /* no animation on wrapper to keep tabs always visible */ }

  .forecast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-title { font-size: 1.1rem; font-weight: 700; opacity: 0.9; }

  .tab-switcher {
    display: flex;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 3px;
  }

  .tab-btn {
    padding: 0.4rem 1rem;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    background: transparent;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    font-family: inherit;
  }

  .tab-btn.active {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  .tab-btn:hover:not(.active) { color: #ffffff; }

  .daily-forecast { display: flex; flex-direction: column; gap: 0.5rem; }

  .forecast-row {
    display: flex;
    align-items: center;
    padding: 0.85rem 1.25rem;
    border-radius: 16px;
    gap: 1rem;
    animation: fadeRow 0.5s ease forwards;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .forecast-row:hover {
    transform: translateX(4px);
    background: var(--glass-bg-hover);
  }

  @keyframes fadeRow {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .forecast-day { width: 65px; font-size: 0.85rem; font-weight: 600; flex-shrink: 0; }
  .forecast-icon { font-size: 1.4rem; flex-shrink: 0; }

  .forecast-rain {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 45px;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .forecast-temp-range {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .temp-low {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    width: 35px;
    text-align: right;
  }

  .temp-high { font-size: 0.85rem; font-weight: 700; width: 35px; }

  .temp-bar-container {
    flex: 1;
    height: 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }

  .temp-bar {
    position: absolute;
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #60a5fa, #f59e0b);
    transition: all 0.6s ease;
  }

  .hourly-forecast {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .hourly-forecast::-webkit-scrollbar { height: 4px; }
  .hourly-forecast::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }

  .hourly-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    padding: 1rem 0.85rem;
    border-radius: 18px;
    min-width: 72px;
    flex-shrink: 0;
    scroll-snap-align: start;
    transition: transform 0.2s ease, background 0.2s ease;
    animation: fadeRow 0.4s ease forwards;
  }

  .hourly-card:hover {
    transform: translateY(-4px);
    background: var(--glass-bg-hover);
  }

  .hourly-card.is-now {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.35);
  }

  .hourly-time { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); }
  .hourly-card.is-now .hourly-time { color: #ffffff; }
  .hourly-icon { font-size: 1.5rem; }
  .hourly-temp { font-size: 0.85rem; font-weight: 700; }

  @media (max-width: 480px) {
    .forecast-row { padding: 0.7rem 1rem; }
    .forecast-temp-range { gap: 0.3rem; }
  }
</style>
