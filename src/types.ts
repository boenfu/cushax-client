// @ts-ignore
import Vue from "vue";
import { Page } from "./page";

declare module "vue/types/vue" {
  interface Vue {
    $page: Page<any>;
  }
}
