<script>
  import { onMount, onDestroy } from 'svelte';

  let { lat, lon, name } = $props();
  
  let mapElement;
  // Use $state.raw() — Svelte 5's $state() wraps objects in deep proxies
  // which breaks Leaflet's internal methods (setView, setLatLng, etc.)
  let map = $state.raw(null);
  let marker = $state.raw(null);

  // Reactively update map when coordinates change
  $effect(() => {
    if (map && lat !== undefined && lon !== undefined) {
      map.setView([lat, lon], 10);
      map.invalidateSize();
      if (marker) {
        marker.setLatLng([lat, lon]);
        marker.setPopupContent(`<b>${name}</b>`).openPopup();
      } else {
        const m = L.marker([lat, lon]).addTo(map);
        m.bindPopup(`<b>${name}</b>`).openPopup();
        marker = m;
      }
    }
  });

  onMount(() => {
    // Initialize map with initial coordinates
    const leafletMap = L.map(mapElement).setView([lat || 0, lon || 0], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);

    // Create initial marker
    if (lat !== undefined && lon !== undefined) {
      const m = L.marker([lat, lon]).addTo(leafletMap);
      m.bindPopup(`<b>${name}</b>`).openPopup();
      marker = m;
    }
    
    // Fix map sizing issues within flex/grid containers
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 200);

    // Assign to reactive variable AFTER full setup — this triggers $effect for future updates
    map = leafletMap;
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="weather-map-wrapper">
  <h3 class="section-title">Peta Lokasi</h3>
  <div class="map-container" bind:this={mapElement}></div>
</div>

<style>
  .weather-map-wrapper {
    margin-top: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    margin-top: 0;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .map-container {
    width: 100%;
    height: 250px;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(0,0,0,0.1); /* Placeholder before tiles load */
    z-index: 1; /* Keep leaflet controls below custom overlapping elements */
  }

  /* Make sure leaflet controls match the theme */
  :global(.leaflet-popup-content-wrapper) {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    color: #333;
    font-family: 'Inter', sans-serif;
  }
  :global(.leaflet-popup-tip) {
    background: rgba(255, 255, 255, 0.85);
  }
</style>
