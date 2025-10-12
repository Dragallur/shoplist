<script>
  import { onMount } from 'svelte';
  import "../lib/styles/global.css";
  import { auth } from '$lib/stores/auth.js';
  import LoginForm from '$lib/components/LoginForm.svelte';
  import AppLayout from '$lib/components/AppLayout.svelte';

  onMount(() => {
    auth.init();
  });
</script>

{#if $auth.loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
{:else if $auth.isAuthenticated}
  <AppLayout>
    <slot />
  </AppLayout>
{:else}
  <LoginForm />
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4CAF50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>