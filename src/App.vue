<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          Mi Aplicación
        </router-link>
      </div>
      
      <button class="navbar-toggler" 
              @click="isMenuOpen = !isMenuOpen"
              :class="{ 'is-active': isMenuOpen }">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>

      <div class="navbar-menu" :class="{ 'is-open': isMenuOpen }">
        <router-link 
          v-for="route in routes" 
          :key="route.path"
          :to="route.path"
          class="nav-link"
          :class="{ 'active': currentRoute === route.path }"
          @click="isMenuOpen = false">
          {{ route.name }}
        </router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const isMenuOpen = ref(false)
    const route = useRoute()
    
    const routes = [
      { path: '/', name: 'Dashboard' },
      { path: '/inventario', name: 'Inventario' },
      { path: '/ventas', name: 'Ventas' },
      { path: '/caja-chica', name: 'Caja Chica' },
      { path: '/clientes', name: 'Clientes' }
    ]

    const currentRoute = computed(() => route.path)

    return {
      isMenuOpen,
      routes,
      currentRoute
    }
  }
}
</script>

<style>
/* Mantener los estilos existentes del navbar */
.navbar {
  background-color: #4a69bd;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-toggler {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-bar {
  width: 100%;
  height: 2px;
  background-color: white;
  transition: all 0.3s;
}

.main-content {
  flex: 1;
  padding: 1rem;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .navbar-toggler {
    display: flex;
  }

  .navbar-menu {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    margin-top: 1rem;
  }

  .navbar-menu.is-open {
    display: flex;
  }

  .nav-link {
    padding: 0.75rem 1rem;
  }

  .navbar-toggler.is-active .icon-bar:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .navbar-toggler.is-active .icon-bar:nth-child(2) {
    opacity: 0;
  }

  .navbar-toggler.is-active .icon-bar:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}
</style>
