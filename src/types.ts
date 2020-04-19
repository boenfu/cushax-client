// @ts-ignore
import Vue from "vue";
import { Page } from "./page";
import { Module } from "vuex";
import { Cushax } from "./cushax";

declare module "vue/types/vue" {
  interface Vue {
    $cushax: Cushax<any>;
    $getCushax: <TSchema extends Module<any, any>>() => Page<TSchema>;
    $page: Page<any>;
    $getPage: <
      TSchema extends Module<any, any>,
      TKey extends keyof TSchema["modules"]
    >() => Page<TSchema["modules"][TKey]>;
  }
}

export type ObjectPropertyToPair<
  TObject,
  TKey extends keyof TObject,
  TPKey
> = TPKey extends keyof TObject[TKey] ? [TPKey, TObject[TKey][TPKey]] : never;

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
