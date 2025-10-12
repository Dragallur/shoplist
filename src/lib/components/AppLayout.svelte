<script>
  import { auth } from '$lib/stores/auth.js';

  function handleLogout() {
    auth.logout();
  }
</script>

<div class="app-container">
  <header class="app-header">
    <h1>My SvelteKit App</h1>
    <div class="user-info">
      <span>Welcome, {$auth.user?.username}!</span>
      <button class="logout-btn" on:click={handleLogout}>Logout</button>
    </div>
  </header>
  
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

  .app-main {
    padding: 2rem;
  }
</style>