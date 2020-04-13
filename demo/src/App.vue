<template>
  <div id="app">
    <h2>我是 {{user}}</h2>

    <img src="./assets/logo.png" @click="toggle" />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  foo = true;

  get user(): any {

    return this.$store.state.cushax?.user;
  }

  toggle() {
    this.$router.push(this.foo ? "/bar" : "/foo/333");
    this.foo = !this.foo;
  }

  created() {
    console.log((this as any).$page);
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
