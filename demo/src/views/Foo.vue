<template>
  <div class="home">
    <h2>我今年:{{$page.state.age}} 岁了</h2>
    <h2>我是:{{$page.state.name}}</h2>
    <h4 @click="$page.commit('changeAge', $page.state.age + 1)">commit changeAge</h4>
    <h4 @click="$page.reset">reset</h4>
    <h4 @click="$page.update({age: $page.state.age + 1})">update age + 1</h4>
    <h4 @click="$page.emit('save', {name: 'dlisme'})">emit save name 'dlisme'</h4>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({})
export default class App extends Vue {}
</script>>

