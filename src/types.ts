// @ts-ignore
import Vue from "vue";
import { Page } from "./page";
import { Module } from "vuex";

declare module "vue/types/vue" {
  interface Vue {
    $page: Page<any>;
    $getPage: <
      TSchema extends Module<any, any>,
      TKey extends keyof TSchema["modules"]
    >() => Page<TSchema["modules"][TKey]>;
  }
}
