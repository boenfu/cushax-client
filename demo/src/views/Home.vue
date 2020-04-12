<template>
  <div class="home">
    <h2>我今年:{{age}} 岁了</h2>
    <h2>我是:{{name}}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  get age(): number | undefined {
    return this.$store.state.cushax?.foo?.age;
  }

  get name(): string | undefined {
    return this.$store.state.cushax?.foo?.name;
  }
}
</script>>

