// @ts-ignore
import Vue from "vue";
import { Page } from "./page";
import { Module } from "vuex";
import { Cushax } from "./cushax";

declare module "vue/types/vue" {
  interface Vue {
    // cushax
    $cushax: Cushax<any>;
    $getCushax: <TSchema extends Module<any, any>>() => Cushax<TSchema>;

    // page
    $page: Page<any>;
    $getPage: <
      TSchema extends Module<any, any>,
      TKey extends keyof TSchema["modules"]
    >() => Page<TSchema["modules"][TKey]>;

    // hook
    $pageEntered?: () => void;
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
