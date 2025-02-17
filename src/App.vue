<template>
  <div id="app">
    <nav>
      <router-link to="/">Dashboard</router-link> |
      <router-link to="/inventario">Inventario</router-link> |
      <router-link to="/ventas">Ventas</router-link> |
      <router-link to="/caja-chica">Caja Chica</router-link> |
      <router-link to="/gastos">Gastos</router-link>
    </nav>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
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
  color: #2c3e50;
}

nav {
  padding: 30px;
  background-color: #34495e;
}

nav a {
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a.router-link-exact-active {
  background-color: #42b983;
}

nav a:hover {
  background-color: #42b983;
}
</style>
