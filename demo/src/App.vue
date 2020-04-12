<template>
  <div id="app">
    <img src="./assets/logo.png" @click="toggle" />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  foo = true;

  toggle() {
    this.$router.push(this.foo ? "bar" : "foo");
    this.foo = !this.foo;
  }

  created() {
    (this as any).$initCushax();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
