<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/weekkdj">weekkdj</router-link>
      <router-link to="/weekrsi">weekrsi</router-link>
      <router-link to="/monthrsi">monthrsi</router-link>
      <router-link to="/monthkdj">monthkdj</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
