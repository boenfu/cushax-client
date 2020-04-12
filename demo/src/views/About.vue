<template>
  <div class="home">
    <h2>我有:{{length}} cm 高</h2>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {
  get length(): number | undefined {
    return this.$store.state.cushax?.bar?.length;
  }
}
</script>>

