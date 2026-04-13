<script>
  import { onMount } from 'svelte';
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

  // Invite member
  let showInvite = false;
  let inviteUsername = '';
  let inviteMessage = '';
  let inviteIsError = false;

  // Shop dropdown
  let shopOpen = false;
  let showNewShop = false;
  let newShopName = '';
  let shopError = '';

  // Pending invites
  let pendingInvites = [];
  let invitesOpen = false;

  onMount(async () => {
    if ($auth.isAuthenticated) await loadInvites();
  });

  async function loadInvites() {
    const res = await fetch('/api/invites');
    if (res.ok) pendingInvites = await res.json();
  }

  async function respondToInvite(id, status) {
    const res = await fetch(`/api/invites/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      pendingInvites = pendingInvites.filter(i => i.id !== id);
      if (status === 'accepted') await nav.refreshHouseholds();
      if (pendingInvites.length === 0) invitesOpen = false;
    }
  }

  function closeAll() {
    householdOpen = false;
    shopOpen = false;
    invitesOpen = false;
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

  async function submitInvite() {
    if (!inviteUsername.trim()) return;
    inviteMessage = '';
    const householdId = $nav.activeHousehold?.id;
    const res = await fetch(`/api/households/${householdId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: inviteUsername.trim() })
    });
    const data = await res.json();
    if (res.ok) {
      inviteMessage = `Invite sent to ${inviteUsername.trim()}.`;
      inviteIsError = false;
      inviteUsername = '';
    } else {
      inviteMessage = data.error || 'Failed to send invite.';
      inviteIsError = true;
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
        on:click={() => { householdOpen = !householdOpen; shopOpen = false; invitesOpen = false; }}
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

          <!-- Invite member -->
          {#if $nav.activeHousehold}
            {#if showInvite}
              <li class="new-item-form">
                <input
                  bind:value={inviteUsername}
                  placeholder="Username"
                  on:keydown={e => e.key === 'Enter' && submitInvite()}
                  autofocus
                />
                <button on:click={submitInvite}>Send</button>
                <button class="cancel" on:click={() => { showInvite = false; inviteUsername = ''; inviteMessage = ''; }}>✕</button>
              </li>
              {#if inviteMessage}
                <li class="feedback" class:error={inviteIsError} class:success={!inviteIsError}>
                  {inviteMessage}
                </li>
              {/if}
            {:else}
              <li>
                <button class="dropdown-item new-btn" on:click={() => showInvite = true}>
                  + Invite member
                </button>
              </li>
            {/if}
            <li class="separator"></li>
          {/if}

          <!-- New household -->
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
          on:click={() => { shopOpen = !shopOpen; householdOpen = false; invitesOpen = false; }}
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

    <!-- Pending invites -->
    {#if pendingInvites.length > 0}
      <div class="dropdown invites-dropdown">
        <button
          class="dropdown-btn invites-btn"
          class:open={invitesOpen}
          on:click={() => { invitesOpen = !invitesOpen; householdOpen = false; shopOpen = false; }}
        >
          Invites ({pendingInvites.length})
        </button>

        {#if invitesOpen}
          <ul class="dropdown-list invites-list">
            {#each pendingInvites as invite}
              <li class="invite-item">
                <div class="invite-info">
                  <strong>{invite.household_name}</strong>
                  <span>from {invite.invited_by_username}</span>
                </div>
                <div class="invite-actions">
                  <button class="accept-btn" on:click={() => respondToInvite(invite.id, 'accepted')}>Accept</button>
                  <button class="reject-btn" on:click={() => respondToInvite(invite.id, 'rejected')}>Reject</button>
                </div>
              </li>
            {/each}
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
    align-items: center;
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

  .invites-btn {
    background-color: #fff3cd;
    border-color: #ffc107;
    color: #856404;
  }

  .invites-btn:hover,
  .invites-btn.open {
    background-color: #ffe69c;
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

  .feedback {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }

  .feedback.error {
    color: #c00;
  }

  .feedback.success {
    color: #4CAF50;
  }

  .error {
    color: #c00;
    font-size: 0.75rem;
    padding: 0 0.5rem;
  }

  /* Invites dropdown */
  .invites-dropdown {
    margin-left: auto;
  }

  .invites-list {
    right: 0;
    left: auto;
    min-width: 260px;
  }

  .invite-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    gap: 0.75rem;
  }

  .invite-item + .invite-item {
    border-top: 1px solid #eee;
  }

  .invite-info {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
  }

  .invite-info span {
    color: #888;
    font-size: 0.78rem;
  }

  .invite-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .accept-btn {
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .reject-btn {
    background: #aaa;
    color: white;
    border: none;
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .app-main {
    padding: 2rem;
  }
</style>
