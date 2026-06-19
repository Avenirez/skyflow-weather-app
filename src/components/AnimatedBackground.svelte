<script>
  let { weather } = $props();
</script>

<div class="animated-bg" data-theme={weather?.condition?.theme || 'sunny'}>
  <!-- Orb glows -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <!-- Rain particles -->
  {#if weather?.conditionKey?.includes('rain') || weather?.conditionKey === 'thunderstorm'}
    <div class="rain-container">
      {#each Array(60) as _, i}
        <div
          class="raindrop"
          style="left: {Math.random() * 100}%; animation-delay: {Math.random() * 2}s; animation-duration: {0.5 + Math.random() * 0.5}s; opacity: {0.3 + Math.random() * 0.5}"
        ></div>
      {/each}
    </div>
  {/if}

  <!-- Cloud shapes -->
  {#if weather?.conditionKey?.includes('cloud') || weather?.conditionKey === 'cloudy' || weather?.conditionKey === 'fog'}
    <div class="clouds-container">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    </div>
  {/if}

  <!-- Lightning flash -->
  {#if weather?.conditionKey === 'thunderstorm' || weather?.conditionKey === 'heavy_rain'}
    <div class="lightning-overlay"></div>
  {/if}

  <!-- Stars for night -->
  {#if weather?.isNight}
    <div class="stars-container">
      {#each Array(40) as _, i}
        <div
          class="star"
          style="left: {Math.random() * 100}%; top: {Math.random() * 60}%; animation-delay: {Math.random() * 4}s; width: {1 + Math.random() * 2}px; height: {1 + Math.random() * 2}px;"
        ></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    overflow: hidden;
    transition: background 1s ease;
  }

  .animated-bg[data-theme="sunny"] {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .animated-bg[data-theme="cloudy"] {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a8c0ff 100%);
  }

  .animated-bg[data-theme="rainy"] {
    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  }

  .animated-bg[data-theme="night"] {
    background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #16213e 100%);
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: float 8s ease-in-out infinite;
  }

  .orb-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
    background: rgba(255, 200, 50, 0.3);
  }

  .animated-bg[data-theme="rainy"] .orb-1 { background: rgba(30, 90, 180, 0.35); }
  .animated-bg[data-theme="night"] .orb-1 { background: rgba(80, 50, 180, 0.3); }

  .orb-2 {
    width: 300px;
    height: 300px;
    bottom: 10%;
    left: -80px;
    background: rgba(120, 200, 255, 0.25);
    animation-delay: -3s;
  }

  .animated-bg[data-theme="rainy"] .orb-2 { background: rgba(20, 60, 120, 0.3); }
  .animated-bg[data-theme="night"] .orb-2 { background: rgba(40, 20, 120, 0.3); }

  .orb-3 {
    width: 250px;
    height: 250px;
    top: 50%;
    left: 50%;
    background: rgba(255, 150, 200, 0.2);
    animation-delay: -5s;
  }

  .animated-bg[data-theme="night"] .orb-3 { background: rgba(60, 30, 150, 0.25); }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }

  .rain-container { position: absolute; inset: 0; overflow: hidden; }

  .raindrop {
    position: absolute;
    top: -10px;
    width: 2px;
    height: 20px;
    background: linear-gradient(to bottom, transparent, rgba(180, 220, 255, 0.6));
    border-radius: 0 0 2px 2px;
    animation: fall linear infinite;
  }

  @keyframes fall {
    0% { transform: translateY(-10px); opacity: 1; }
    100% { transform: translateY(100vh); opacity: 0; }
  }

  .clouds-container { position: absolute; inset: 0; overflow: hidden; }

  .cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
    filter: blur(30px);
    animation: drift linear infinite;
  }

  .cloud-1 { width: 500px; height: 120px; top: 8%; animation-duration: 35s; }
  .cloud-2 { width: 400px; height: 100px; top: 25%; animation-duration: 45s; animation-delay: -10s; }
  .cloud-3 { width: 350px; height: 80px; top: 50%; animation-duration: 40s; animation-delay: -20s; }

  @keyframes drift {
    0% { transform: translateX(-600px); }
    100% { transform: translateX(calc(100vw + 100px)); }
  }

  .lightning-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0);
    animation: lightning 6s infinite;
    pointer-events: none;
  }

  @keyframes lightning {
    0%, 95%, 100% { background: rgba(255, 255, 255, 0); }
    96% { background: rgba(200, 220, 255, 0.15); }
    97% { background: rgba(255, 255, 255, 0); }
    98% { background: rgba(200, 220, 255, 0.1); }
  }

  .stars-container { position: absolute; inset: 0; }

  .star {
    position: absolute;
    background: #ffffff;
    border-radius: 50%;
    animation: twinkle 3s ease-in-out infinite alternate;
  }

  @keyframes twinkle {
    0% { opacity: 0.2; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1.2); }
  }
</style>
