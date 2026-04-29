<script>
  import { auth } from '$lib/stores/auth.js';
  
  let username = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let success = '';
  let loading = false;
  let isLoginMode = true;

  function resetForm() {
    username = '';
    password = '';
    confirmPassword = '';
    error = '';
    success = '';
  }

  function toggleMode() {
    isLoginMode = !isLoginMode;
    resetForm();
  }

  async function handleSubmit() {
    if (!username || !password) {
      error = 'Please fill in all fields';
      return;
    }

    if (!isLoginMode) {
      if (!confirmPassword) {
        error = 'Please confirm your password';
        return;
      }
      if (password !== confirmPassword) {
        error = 'Passwords do not match';
        return;
      }
      if (password.length < 6) {
        error = 'Password must be at least 6 characters long';
        return;
      }
      if (username.length < 3) {
        error = 'Username must be at least 3 characters long';
        return;
      }
    }

    loading = true;
    error = '';
    success = '';
    
    const result = isLoginMode 
      ? await auth.login(username, password)
      : await auth.register(username, password);
    
    loading = false;
    
    if (result.success) {
      if (!isLoginMode) {
        success = result.message || 'Account created successfully! You can now log in.';
        resetForm();
        isLoginMode = true;
      }
    } else {
      error = result.error;
    }
  }
</script>

<div class="login-container">
  <div class="login-form">
    <h2>{isLoginMode ? 'Login' : 'Create Account'}</h2>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          id="username"
          type="text"
          bind:value={username}
          placeholder="Enter username"
          disabled={loading}
          minlength={isLoginMode ? undefined : 3}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Enter password"
          disabled={loading}
          minlength={isLoginMode ? undefined : 6}
        />
      </div>
      
      {#if !isLoginMode}
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            placeholder="Confirm password"
            disabled={loading}
            minlength="6"
          />
        </div>
      {/if}
      
      {#if error}
        <div class="error">{error}</div>
      {/if}
      
      {#if success}
        <div class="success">{success}</div>
      {/if}
      
      <button type="submit" disabled={loading}>
        {loading 
          ? (isLoginMode ? 'Logging in...' : 'Creating account...') 
          : (isLoginMode ? 'Login' : 'Create Account')
        }
      </button>
    </form>
    
    <div class="mode-toggle">
      <button type="button" class="link-button" on:click={toggleMode} disabled={loading}>
        {isLoginMode 
          ? "Don't have an account? Sign up" 
          : "Already have an account? Log in"
        }
      </button>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .login-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #45a049;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .link-button {
    background: none;
    color: #4CAF50;
    text-decoration: underline;
    font-size: 0.9rem;
    padding: 0.5rem;
    margin-top: 1rem;
  }

  .link-button:hover:not(:disabled) {
    background: none;
    color: #45a049;
  }

  .error {
    background-color: #ffebee;
    color: #c62828;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .success {
    background-color: #e8f5e8;
    color: #2e7d2e;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    text-align: center;
  }

  .mode-toggle {
    text-align: center;
    margin-top: 1rem;
  }

  .demo-credentials {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f0f8ff;
    border-radius: 4px;
    text-align: center;
  }
</style>