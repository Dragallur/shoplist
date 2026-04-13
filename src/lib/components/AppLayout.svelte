<script>
  import { auth } from '$lib/stores/auth.js';
  import { nav } from '$lib/stores/navigation.js';
  import { page } from '$app/stores';

  $: if ($auth.isAuthenticated && $page.data.householdId) {
    nav.syncFromPage($page.data.shopId, $page.data.householdId);
  }
  $: if (!$auth.isAuthenticated) nav.reset();

  function handleLogout() {
    auth.logout();
  }

  // Household dropdown
  let householdOpen = false;
  let showNewHousehold = false;
  let newHouseholdName = '';
  let householdError = '';

  // Shop dropdown
  let shopOpen = false;
  let showNewShop = false;
  let newShopName = '';
  let shopError = '';

  function closeAll() {
    householdOpen = false;
    shopOpen = false;
  }

  async function submitNewHousehold() {
    if (!newHouseholdName.trim()) return;
    householdError = '';
    try {
      const res = await fetch('/api/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHouseholdName.trim() })
      });
      if (!res.ok) throw new Error();
      const { household, defaultShop } = await res.json();
      nav.addHousehold(household, defaultShop);
      newHouseholdName = '';
      showNewHousehold = false;
      householdOpen = false;
    } catch {
      householdError = 'Failed to create household.';
    }
  }

  async function submitNewShop() {
    if (!newShopName.trim()) return;
    shopError = '';
    try {
      const householdId = $nav.activeHousehold?.id;
      const res = await fetch(`/api/households/${householdId}/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShopName.trim() })
      });
      if (!res.ok) throw new Error();
      const shop = await res.json();
      nav.addShop(shop);
      newShopName = '';
      showNewShop = false;
      shopOpen = false;
    } catch {
      shopError = 'Failed to create shop.';
    }
  }
</script>

<svelte:window on:click={closeAll} />

<div class="app-container">
  <header class="app-header">
    <h1>Shoplist</h1>
    <div class="user-info">
      <span>Welcome, {$auth.user?.username}!</span>
      <button class="logout-btn" on:click={handleLogout}>Logout</button>
    </div>
  </header>

  <nav class="app-nav" on:click|stopPropagation>
    <!-- Household dropdown -->
    <div class="dropdown">
      <button
        class="dropdown-btn"
        class:open={householdOpen}
        on:click={() => { householdOpen = !householdOpen; shopOpen = false; }}
      >
        {$nav.activeHousehold?.name ?? 'Select household'}
        <span class="chevron">▾</span>
      </button>

      {#if householdOpen}
        <ul class="dropdown-list">
          {#each $nav.households as h}
            <li>
              <button
                class="dropdown-item"
                class:active={h.id === $nav.activeHousehold?.id}
                on:click={() => { nav.selectHousehold(h); householdOpen = false; }}
              >
                {h.name}
              </button>
            </li>
          {/each}

          <li class="separator"></li>

          {#if showNewHousehold}
            <li class="new-item-form">
              <input
                bind:value={newHouseholdName}
                placeholder="Household name"
                on:keydown={e => e.key === 'Enter' && submitNewHousehold()}
                autofocus
              />
              <button on:click={submitNewHousehold}>Add</button>
              <button class="cancel" on:click={() => { showNewHousehold = false; newHouseholdName = ''; householdError = ''; }}>✕</button>
              {#if householdError}<span class="error">{householdError}</span>{/if}
            </li>
          {:else}
            <li>
              <button class="dropdown-item new-btn" on:click={() => showNewHousehold = true}>
                + New household
              </button>
            </li>
          {/if}
        </ul>
      {/if}
    </div>

    <!-- Shop dropdown -->
    {#if $nav.activeHousehold}
      <div class="dropdown">
        <button
          class="dropdown-btn"
          class:open={shopOpen}
          on:click={() => { shopOpen = !shopOpen; householdOpen = false; }}
        >
          {$nav.activeShop?.name ?? 'Select shop'}
          <span class="chevron">▾</span>
        </button>

        {#if shopOpen}
          <ul class="dropdown-list">
            {#each $nav.shops as s}
              <li>
                <button
                  class="dropdown-item"
                  class:active={s.id === $nav.activeShop?.id}
                  on:click={() => { nav.selectShop(s); shopOpen = false; }}
                >
                  {s.name}
                </button>
              </li>
            {/each}

            <li class="separator"></li>

            {#if showNewShop}
              <li class="new-item-form">
                <input
                  bind:value={newShopName}
                  placeholder="Shop name"
                  on:keydown={e => e.key === 'Enter' && submitNewShop()}
                  autofocus
                />
                <button on:click={submitNewShop}>Add</button>
                <button class="cancel" on:click={() => { showNewShop = false; newShopName = ''; shopError = ''; }}>✕</button>
                {#if shopError}<span class="error">{shopError}</span>{/if}
              </li>
            {:else}
              <li>
                <button class="dropdown-item new-btn" on:click={() => showNewShop = true}>
                  + New shop
                </button>
              </li>
            {/if}
          </ul>
        {/if}
      </div>
    {/if}
  </nav>

  <main class="app-main">
    <slot />
  </main>
</div>

<style>
  .app-container {
    min-height: 100vh;
    background-color: #f9f9f9;
  }

  .app-header {
    background-color: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .app-header h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  /* Nav bar */
  .app-nav {
    background-color: #fff;
    border-bottom: 1px solid #e0e0e0;
    padding: 0.5rem 2rem;
    display: flex;
    gap: 0.5rem;
  }

  /* Dropdowns */
  .dropdown {
    position: relative;
  }

  .dropdown-btn {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    transition: background-color 0.15s;
  }

  .dropdown-btn:hover,
  .dropdown-btn.open {
    background-color: #e8e8e8;
  }

  .chevron {
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    list-style: none;
    margin: 0;
    padding: 0.25rem 0;
    min-width: 180px;
    z-index: 100;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .dropdown-item:hover {
    background-color: #f5f5f5;
  }

  .dropdown-item.active {
    font-weight: 600;
    color: #4CAF50;
  }

  .new-btn {
    color: #4CAF50;
  }

  .separator {
    border-top: 1px solid #eee;
    margin: 0.25rem 0;
  }

  .new-item-form {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.4rem 0.75rem;
  }

  .new-item-form input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 3px;
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
    min-width: 0;
  }

  .new-item-form button {
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .new-item-form button.cancel {
    background: #aaa;
  }

  .error {
    color: #c00;
    font-size: 0.75rem;
    padding: 0 0.5rem;
  }

  .app-main {
    padding: 2rem;
  }
</style>
