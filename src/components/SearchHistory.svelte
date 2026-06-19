<script>
  let { history = [], favorites = [], onselect, onremove, onremoveFavorite } = $props();
  let activeTab = $state('history'); // 'history' or 'favorites'
</script>

{#if history.length > 0 || favorites.length > 0}
  <section class="search-history" aria-label="Riwayat dan Favorit">
    <div class="tabs">
      <button class="tab-btn" class:active={activeTab === 'history'} onclick={() => activeTab = 'history'}>
        Terakhir Dicari
      </button>
      <button class="tab-btn" class:active={activeTab === 'favorites'} onclick={() => activeTab = 'favorites'}>
        Kota Favorit ⭐
      </button>
    </div>

    {#if activeTab === 'history' && history.length > 0}
      <div class="history-chips">
        {#each history as city, i}
          <div
            class="history-chip glass-panel"
            onclick={() => onselect?.(city)}
            onkeydown={(e) => e.key === 'Enter' && onselect?.(city)}
            role="button"
            tabindex="0"
            style="animation-delay: {i * 0.05}s"
          >
            <svg class="chip-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="chip-name">{city.name}</span>
            <span class="chip-country">{city.country}</span>
            <span
              class="chip-remove"
              onclick={(e) => { e.stopPropagation(); onremove?.(i); }}
              onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onremove?.(i); } }}
              role="button"
              tabindex="0"
              aria-label="Hapus {city.name}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </span>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'history'}
      <p class="empty-state">Belum ada riwayat pencarian.</p>
    {/if}

    {#if activeTab === 'favorites' && favorites.length > 0}
      <div class="history-chips">
        {#each favorites as city, i}
          <div
            class="history-chip glass-panel fav-chip"
            onclick={() => onselect?.(city)}
            onkeydown={(e) => e.key === 'Enter' && onselect?.(city)}
            role="button"
            tabindex="0"
            style="animation-delay: {i * 0.05}s"
          >
            <svg class="chip-pin" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" stroke-width="2" width="14" height="14">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span class="chip-name">{city.name}</span>
            <span class="chip-country">{city.country}</span>
            <span
              class="chip-remove"
              onclick={(e) => { e.stopPropagation(); onremoveFavorite?.(i); }}
              onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onremoveFavorite?.(i); } }}
              role="button"
              tabindex="0"
              aria-label="Hapus {city.name}"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </span>
          </div>
        {/each}
      </div>
    {:else if activeTab === 'favorites'}
      <p class="empty-state">Belum ada kota favorit yang disimpan.</p>
    {/if}
  </section>
{/if}

<style>
  .search-history { animation: slideUp 0.6s ease 0.4s both; margin-top: 1rem; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
  }

  .tab-btn {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    transition: color 0.3s, transform 0.3s;
    font-family: inherit;
    position: relative;
  }

  .tab-btn:hover { color: #ffffff; }

  .tab-btn.active { color: #ffffff; }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -0.6rem;
    left: 0;
    width: 100%;
    height: 3px;
    background: #60a5fa;
    border-radius: 3px;
  }

  .history-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .history-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.85rem;
    border-radius: 50px;
    font-size: 0.8rem;
    color: var(--color-text-primary);
    transition: all 0.3s ease;
    animation: fadeIn 0.4s ease both;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .history-chip:hover {
    background: var(--glass-bg-hover);
    transform: translateY(-2px);
  }

  .fav-chip {
    background: rgba(250, 204, 21, 0.1);
    border: 1px solid rgba(250, 204, 21, 0.2);
  }
  .fav-chip:hover {
    background: rgba(250, 204, 21, 0.2);
  }

  .chip-pin { opacity: 0.6; }
  .fav-chip .chip-pin { opacity: 1; }

  .chip-name { font-weight: 600; }
  .chip-country { color: var(--color-text-secondary); font-size: 0.75rem; }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-secondary);
    margin-left: 0.25rem;
    transition: all 0.2s ease;
    padding: 0;
    cursor: pointer;
  }

  .chip-remove:hover {
    background: rgba(239, 68, 68, 0.5);
    color: #ffffff;
  }

  .empty-state {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    font-style: italic;
    opacity: 0.8;
    padding: 1rem 0;
  }
</style>
