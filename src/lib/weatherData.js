/**
 * Weatherez - Weather Data Engine
 * Generates realistic simulated weather data for cities worldwide.
 */

// Database kota-kota populer dengan koordinat dan zona waktu
export const CITIES = [
  { name: 'Jakarta', country: 'Indonesia', lat: -6.21, lon: 106.85, tz: 7 },
  { name: 'Bandung', country: 'Indonesia', lat: -6.91, lon: 107.61, tz: 7 },
  { name: 'Surabaya', country: 'Indonesia', lat: -7.25, lon: 112.75, tz: 7 },
  { name: 'Yogyakarta', country: 'Indonesia', lat: -7.80, lon: 110.36, tz: 7 },
  { name: 'Bali', country: 'Indonesia', lat: -8.34, lon: 115.09, tz: 8 },
  { name: 'Medan', country: 'Indonesia', lat: 3.59, lon: 98.67, tz: 7 },
  { name: 'Makassar', country: 'Indonesia', lat: -5.14, lon: 119.42, tz: 8 },
  { name: 'Semarang', country: 'Indonesia', lat: -6.97, lon: 110.42, tz: 7 },
  { name: 'Malang', country: 'Indonesia', lat: -7.98, lon: 112.63, tz: 7 },
  { name: 'Palembang', country: 'Indonesia', lat: -2.99, lon: 104.76, tz: 7 },
  { name: 'Tokyo', country: 'Jepang', lat: 35.68, lon: 139.69, tz: 9 },
  { name: 'Seoul', country: 'Korea Selatan', lat: 37.57, lon: 126.98, tz: 9 },
  { name: 'Singapore', country: 'Singapura', lat: 1.35, lon: 103.82, tz: 8 },
  { name: 'Kuala Lumpur', country: 'Malaysia', lat: 3.14, lon: 101.69, tz: 8 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lon: 100.50, tz: 7 },
  { name: 'London', country: 'Inggris', lat: 51.51, lon: -0.13, tz: 1 },
  { name: 'Paris', country: 'Prancis', lat: 48.86, lon: 2.35, tz: 2 },
  { name: 'New York', country: 'Amerika Serikat', lat: 40.71, lon: -74.01, tz: -4 },
  { name: 'Dubai', country: 'UAE', lat: 25.20, lon: 55.27, tz: 4 },
  { name: 'Sydney', country: 'Australia', lat: -33.87, lon: 151.21, tz: 10 },
];

// Kondisi cuaca dengan ikon dan deskripsi
export const WEATHER_CONDITIONS = {
  sunny: { icon: '☀️', label: 'Cerah', theme: 'sunny' },
  partly_cloudy: { icon: '⛅', label: 'Berawan Sebagian', theme: 'sunny' },
  cloudy: { icon: '☁️', label: 'Mendung', theme: 'cloudy' },
  light_rain: { icon: '🌦️', label: 'Hujan Ringan', theme: 'rainy' },
  rain: { icon: '🌧️', label: 'Hujan', theme: 'rainy' },
  heavy_rain: { icon: '⛈️', label: 'Hujan Lebat', theme: 'rainy' },
  thunderstorm: { icon: '🌩️', label: 'Badai Petir', theme: 'rainy' },
  snow: { icon: '🌨️', label: 'Salju', theme: 'cloudy' },
  fog: { icon: '🌫️', label: 'Berkabut', theme: 'cloudy' },
  clear_night: { icon: '🌙', label: 'Cerah (Malam)', theme: 'night' },
  cloudy_night: { icon: '☁️', label: 'Berawan (Malam)', theme: 'night' },
};

// Seed-based pseudo-random generator for consistent results per city/day
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate realistic weather data for a city
 */
export function generateWeatherData(city) {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const seed = hashCode(city.name) + dayOfYear + now.getFullYear();
  const rand = seededRandom(seed);

  // Base temperature based on latitude (tropical vs temperate)
  const absLat = Math.abs(city.lat);
  let baseTemp;
  if (absLat < 15) baseTemp = 30; // tropical
  else if (absLat < 30) baseTemp = 26;
  else if (absLat < 45) baseTemp = 18;
  else baseTemp = 12;

  // Seasonal variation (Northern/Southern hemisphere)
  const seasonalOffset = city.lat >= 0
    ? Math.sin((dayOfYear - 80) / 365 * 2 * Math.PI) * 8
    : Math.sin((dayOfYear - 80 + 182) / 365 * 2 * Math.PI) * 8;

  const temp = Math.round(baseTemp + seasonalOffset + (rand() - 0.5) * 6);
  const feelsLike = Math.round(temp + (rand() - 0.5) * 4);

  // Local hour
  const utcHour = now.getUTCHours();
  const localHour = (utcHour + city.tz + 24) % 24;
  const isNight = localHour < 6 || localHour >= 19;

  // Weather condition selection
  const conditionRoll = rand();
  let conditionKey;
  if (isNight) {
    conditionKey = conditionRoll < 0.6 ? 'clear_night' : 'cloudy_night';
  } else if (absLat < 15) {
    // Tropical: more rain
    if (conditionRoll < 0.3) conditionKey = 'sunny';
    else if (conditionRoll < 0.5) conditionKey = 'partly_cloudy';
    else if (conditionRoll < 0.65) conditionKey = 'cloudy';
    else if (conditionRoll < 0.8) conditionKey = 'light_rain';
    else if (conditionRoll < 0.9) conditionKey = 'rain';
    else conditionKey = 'heavy_rain';
  } else if (temp < 2) {
    conditionKey = conditionRoll < 0.5 ? 'snow' : 'cloudy';
  } else {
    if (conditionRoll < 0.35) conditionKey = 'sunny';
    else if (conditionRoll < 0.55) conditionKey = 'partly_cloudy';
    else if (conditionRoll < 0.7) conditionKey = 'cloudy';
    else if (conditionRoll < 0.8) conditionKey = 'light_rain';
    else if (conditionRoll < 0.9) conditionKey = 'rain';
    else if (conditionRoll < 0.95) conditionKey = 'fog';
    else conditionKey = 'thunderstorm';
  }

  const condition = WEATHER_CONDITIONS[conditionKey];
  const humidity = Math.round(50 + rand() * 40 + (conditionKey.includes('rain') ? 15 : 0));
  const windSpeed = Math.round(5 + rand() * 25);
  const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const windDir = windDirections[Math.floor(rand() * windDirections.length)];
  const pressure = Math.round(1005 + rand() * 25);
  const visibility = conditionKey === 'fog' ? Math.round(1 + rand() * 3) : Math.round(5 + rand() * 15);
  const uvIndex = isNight ? 0 : Math.round(1 + rand() * (absLat < 30 ? 10 : 7));
  const dewPoint = Math.round(temp - (100 - humidity) / 5);
  const cloudCover = conditionKey === 'sunny' ? Math.round(rand() * 15) : Math.round(40 + rand() * 60);

  return {
    city,
    temperature: temp,
    feelsLike,
    condition,
    conditionKey,
    humidity: Math.min(humidity, 100),
    windSpeed,
    windDir,
    pressure,
    visibility,
    uvIndex,
    dewPoint,
    cloudCover,
    isNight,
    localHour,
    updatedAt: now.toISOString(),
  };
}

/**
 * Generate 7-day forecast for a city
 */
export function generateForecast(city) {
  const now = new Date();
  const forecast = [];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const seed = hashCode(city.name) + dayOfYear + date.getFullYear() + 999;
    const rand = seededRandom(seed);

    const absLat = Math.abs(city.lat);
    let baseTemp;
    if (absLat < 15) baseTemp = 30;
    else if (absLat < 30) baseTemp = 26;
    else if (absLat < 45) baseTemp = 18;
    else baseTemp = 12;

    const seasonalOffset = city.lat >= 0
      ? Math.sin((dayOfYear - 80) / 365 * 2 * Math.PI) * 8
      : Math.sin((dayOfYear - 80 + 182) / 365 * 2 * Math.PI) * 8;

    const tempHigh = Math.round(baseTemp + seasonalOffset + (rand() - 0.3) * 5);
    const tempLow = Math.round(tempHigh - 4 - rand() * 6);

    const conditionRoll = rand();
    let conditionKey;
    if (absLat < 15) {
      if (conditionRoll < 0.3) conditionKey = 'sunny';
      else if (conditionRoll < 0.5) conditionKey = 'partly_cloudy';
      else if (conditionRoll < 0.65) conditionKey = 'cloudy';
      else if (conditionRoll < 0.8) conditionKey = 'light_rain';
      else if (conditionRoll < 0.92) conditionKey = 'rain';
      else conditionKey = 'heavy_rain';
    } else if (tempHigh < 2) {
      conditionKey = conditionRoll < 0.5 ? 'snow' : 'cloudy';
    } else {
      if (conditionRoll < 0.35) conditionKey = 'sunny';
      else if (conditionRoll < 0.55) conditionKey = 'partly_cloudy';
      else if (conditionRoll < 0.7) conditionKey = 'cloudy';
      else if (conditionRoll < 0.85) conditionKey = 'light_rain';
      else conditionKey = 'rain';
    }

    const rainChance = conditionKey.includes('rain') || conditionKey === 'thunderstorm'
      ? Math.round(50 + rand() * 45)
      : conditionKey === 'cloudy'
        ? Math.round(10 + rand() * 25)
        : Math.round(rand() * 15);

    forecast.push({
      date: date.toISOString().split('T')[0],
      dayName: i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : dayNames[date.getDay()],
      tempHigh,
      tempLow,
      condition: WEATHER_CONDITIONS[conditionKey],
      conditionKey,
      rainChance,
    });
  }

  return forecast;
}

/**
 * Generate hourly forecast (next 24 hours)
 */
export function generateHourlyForecast(city) {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const localHour = (utcHour + city.tz + 24) % 24;
  const hourly = [];

  const absLat = Math.abs(city.lat);
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

  let baseTemp;
  if (absLat < 15) baseTemp = 30;
  else if (absLat < 30) baseTemp = 26;
  else if (absLat < 45) baseTemp = 18;
  else baseTemp = 12;

  const seasonalOffset = city.lat >= 0
    ? Math.sin((dayOfYear - 80) / 365 * 2 * Math.PI) * 8
    : Math.sin((dayOfYear - 80 + 182) / 365 * 2 * Math.PI) * 8;

  for (let i = 0; i < 24; i++) {
    const hour = (localHour + i) % 24;
    const seed = hashCode(city.name) + dayOfYear + hour + 5555;
    const rand = seededRandom(seed);

    // Temperature variation throughout the day
    const hourlyOffset = Math.sin((hour - 6) / 24 * 2 * Math.PI) * 4;
    const temp = Math.round(baseTemp + seasonalOffset + hourlyOffset + (rand() - 0.5) * 3);

    const isNightHour = hour < 6 || hour >= 19;
    const condRoll = rand();
    let condKey;
    if (isNightHour) {
      condKey = condRoll < 0.6 ? 'clear_night' : 'cloudy_night';
    } else if (condRoll < 0.35) condKey = 'sunny';
    else if (condRoll < 0.55) condKey = 'partly_cloudy';
    else if (condRoll < 0.7) condKey = 'cloudy';
    else if (condRoll < 0.85) condKey = 'light_rain';
    else condKey = 'rain';

    hourly.push({
      hour: `${String(hour).padStart(2, '0')}:00`,
      temp,
      condition: WEATHER_CONDITIONS[condKey],
      isNow: i === 0,
    });
  }

  return hourly;
}

/**
 * Search cities by query
 */
export function searchCities(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).slice(0, 6);
}

/**
 * Convert Celsius to Fahrenheit
 */
export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Get UV level description
 */
export function getUvLevel(uv) {
  if (uv <= 2) return { label: 'Rendah', color: '#4ade80' };
  if (uv <= 5) return { label: 'Sedang', color: '#facc15' };
  if (uv <= 7) return { label: 'Tinggi', color: '#fb923c' };
  if (uv <= 10) return { label: 'Sangat Tinggi', color: '#f87171' };
  return { label: 'Ekstrem', color: '#a855f7' };
}

/**
 * Get wind description
 */
export function getWindLevel(speed) {
  if (speed < 10) return 'Tenang';
  if (speed < 20) return 'Sepoi-sepoi';
  if (speed < 30) return 'Sedang';
  return 'Kencang';
}

/**
 * Format date to Indonesian locale
 */
export function formatDateIndonesian(date) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const d = new Date(date);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// --- NEW API INTEGRATION ---

/**
 * Peta kode cuaca WMO ke kondisi aplikasi kita
 */
function mapWmoToCondition(code, isDay) {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  // 45, 48: Fog and depositing rime fog
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  // 56, 57: Freezing Drizzle: Light and dense intensity
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  // 66, 67: Freezing Rain: Light and heavy intensity
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  // 77: Snow grains
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  // 85, 86: Snow showers slight and heavy
  // 95: Thunderstorm: Slight or moderate
  // 96, 99: Thunderstorm with slight and heavy hail
  
  if (code === 0 || code === 1) {
    return isDay ? WEATHER_CONDITIONS.sunny : WEATHER_CONDITIONS.clear_night;
  }
  if (code === 2) {
    return isDay ? WEATHER_CONDITIONS.partly_cloudy : WEATHER_CONDITIONS.cloudy_night;
  }
  if (code === 3) {
    return WEATHER_CONDITIONS.cloudy;
  }
  if (code === 45 || code === 48) {
    return WEATHER_CONDITIONS.fog;
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return WEATHER_CONDITIONS.light_rain;
  }
  if ([61, 63, 66, 80].includes(code)) {
    return WEATHER_CONDITIONS.rain;
  }
  if ([65, 67, 81, 82].includes(code)) {
    return WEATHER_CONDITIONS.heavy_rain;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return WEATHER_CONDITIONS.snow;
  }
  if ([95, 96, 99].includes(code)) {
    return WEATHER_CONDITIONS.thunderstorm;
  }
  return WEATHER_CONDITIONS.cloudy;
}

/**
 * Fetch real coordinates and city name using Geocoding API
 */
export async function fetchCityCoordinates(query) {
  try {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data kota");
    const data = await res.json();
    if (!data.results) return [];
    
    return data.results.map(item => ({
      name: item.name,
      country: item.country || item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
      tz: item.timezone || 'auto',
      id: item.id
    }));
  } catch (error) {
    console.error("Error searching cities API:", error);
    // Fallback to local mock search if API fails
    return searchCities(query);
  }
}

/**
 * Fetch Real Weather Data
 */
export async function fetchRealWeatherData(lat, lon, cityName, countryName) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data cuaca");
    const data = await res.json();
    
    const current = data.current;
    const isDay = current.is_day === 1;
    const condition = mapWmoToCondition(current.weather_code, isDay);
    
    // Determine conditionKey safely
    const conditionKey = Object.keys(WEATHER_CONDITIONS).find(key => WEATHER_CONDITIONS[key] === condition) || (isDay ? 'sunny' : 'clear_night');
    
    const windDirections = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const windDir = windDirections[Math.round(((current.wind_direction_10m % 360) / 45)) % 8];

    // Format current weather matching our internal structure
    const weatherData = {
      city: { name: cityName, country: countryName, lat, lon },
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      condition,
      conditionKey,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDir,
      pressure: Math.round(current.surface_pressure),
      visibility: 10, // Open-Meteo doesn't always provide good visibility data in standard API
      uvIndex: 0, // We will get this from the Air Quality API
      dewPoint: Math.round(current.temperature_2m - (100 - current.relative_humidity_2m) / 5), // rough estimation
      cloudCover: current.cloud_cover,
      isNight: !isDay,
      localHour: new Date(current.time).getHours(),
      updatedAt: new Date().toISOString()
    };
    
    // Format daily forecast
    const daily = data.daily;
    const forecast = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const date = new Date(daily.time[i]);
      forecast.push({
        date: daily.time[i],
        dayName: i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : dayNames[date.getDay()],
        tempHigh: Math.round(daily.temperature_2m_max[i]),
        tempLow: Math.round(daily.temperature_2m_min[i]),
        condition: mapWmoToCondition(daily.weather_code[i], true),
        conditionKey: Object.keys(WEATHER_CONDITIONS).find(key => WEATHER_CONDITIONS[key] === mapWmoToCondition(daily.weather_code[i], true)),
        rainChance: daily.precipitation_probability_max[i]
      });
    }
    
    // Format hourly forecast
    const hourlyData = data.hourly;
    const hourly = [];
    const currentHourIndex = hourlyData.time.findIndex(t => new Date(t) >= new Date());
    const startIndex = currentHourIndex >= 0 ? currentHourIndex : 0;
    
    for (let i = 0; i < 24; i++) {
      if (startIndex + i >= hourlyData.time.length) break;
      const idx = startIndex + i;
      const date = new Date(hourlyData.time[idx]);
      const hrIsDay = hourlyData.is_day[idx] === 1;
      const hrCondition = mapWmoToCondition(hourlyData.weather_code[idx], hrIsDay);
      
      hourly.push({
        hour: `${String(date.getHours()).padStart(2, '0')}:00`,
        temp: Math.round(hourlyData.temperature_2m[idx]),
        condition: hrCondition,
        isNow: i === 0
      });
    }
    
    return { weatherData, forecast, hourly };
  } catch (error) {
    console.error("Error fetching real weather data:", error);
    // Fallback
    const fallbackCity = { name: cityName, country: countryName, lat, lon, tz: 7 };
    return {
      weatherData: generateWeatherData(fallbackCity),
      forecast: generateForecast(fallbackCity),
      hourly: generateHourlyForecast(fallbackCity)
    };
  }
}

/**
 * Fetch Air Quality and UV Index Data
 */
export async function fetchAirQuality(lat, lon) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.current;
  } catch (error) {
    console.error("Error fetching air quality:", error);
    return null;
  }
}
