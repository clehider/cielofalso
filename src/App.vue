<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          Mi Aplicación
        </router-link>
      </div>
      <div class="navbar-menu">
        <router-link to="/" class="nav-link" active-class="active">
          <span class="icon"><i class="fas fa-home"></i></span>
          Dashboard
        </router-link>
        <router-link to="/inventario" class="nav-link" active-class="active">
          <span class="icon"><i class="fas fa-box"></i></span>
          Inventario
        </router-link>
        <router-link to="/ventas" class="nav-link" active-class="active">
          <span class="icon"><i class="fas fa-shopping-cart"></i></span>
          Ventas
        </router-link>
        <router-link to="/caja-chica" class="nav-link" active-class="active">
          <span class="icon"><i class="fas fa-cash-register"></i></span>
          Caja Chica
        </router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-direction: column;
}

.navbar-brand {
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
}

.brand-link {
  color: #333;
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #333;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e9ecef;
}

.nav-link.active {
  background-color: #4CAF50;
  color: white;
}

.icon {
  margin-right: 0.5rem;
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #f8f9fa;
}

@media (min-width: 768px) {
  .navbar {
    flex-direction: row;
    align-items: center;
  }

  .navbar-brand {
    margin-bottom: 0;
    margin-right: 2rem;
  }

  .navbar-menu {
    flex-direction: row;
  }
}
</style>
