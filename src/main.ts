import io from "socket.io-client";

import { VueConstructor } from "vue";
import { Store, Module } from "vuex";
import VueRouter from "vue-router";

import { Schema as _Schema } from "cushax-schema";

import { buildPage, verifyInstance } from "./utils";
import mixinBuilder from "./mixin";
import { registerModule } from "./register";

import "./types";

export const Schema = _Schema;

export type SocketOptions = string | { host: string; port: number };

export interface ICushax {
  installed: boolean;
  mounted: boolean;
  verified: boolean;
  install: (Vue: VueConstructor) => void;
  socket: SocketIOClient.Socket;
  options?: CushaxOptions;
}

export interface CushaxOptions {
  /**
   *  https://vuex.vuejs.org/api/#registermodule
   */
  preserveState?: boolean;
}

export default function (
  schema: Module<any, any>,
  socketOptions: SocketOptions = "http://localhost",
  options?: CushaxOptions
): ICushax {
  let url =
    (typeof socketOptions === "object"
      ? `${socketOptions.host}:${socketOptions.port}`
      : socketOptions) + "/cushax";

  let socket = io(url);

  return {
    installed: false,
    verified: false,
    install: function (Vue: VueConstructor) {
      let cushax = this;

      Vue.prototype.$init_cushax = function () {
        let $vue: Vue = this;

        verifyInstance($vue, Vue);

        let store = $vue.$store;
        let router = $vue.$router;
        let socket = cushax.socket;
        let preserveState = options?.preserveState;

        registerModule(store, schema, preserveState);

        overseeAuth(socket, cushax, schema);
        overseeSocket(socket, store, schema);
        overseeRoute(router, store, socket);
      };

      // mixin

      Vue.mixin(mixinBuilder(cushax, schema, socket));
    },
    socket,
    options,
    mounted: false,
  };
}

function overseeAuth(
  socket: SocketIOClient.Socket,
  cushax: ICushax,
  schema: Module<any, any>
) {
  if (typeof schema.state?.$auth === "undefined") {
    cushax.verified = true;
    return;
  }

  socket.on("auth", (verified: boolean) => {
    cushax.verified = !!verified;
  });
}

function overseeRoute(
  router: VueRouter,
  store: Store<any>,
  socket: SocketIOClient.Socket
): void {
  router.beforeEach((to, from, next) => {
    socket.emit("page:sync", {
      enter: buildPage(to, store),
      leave: buildPage(from, store),
    });

    next();
  });
}

function overseeSocket(
  socket: SocketIOClient.Socket,
  store: Store<any>,
  schema: Module<any, any>
): void {
  // page commit
  socket.on("page:sync", function (page: string, name: string, payload: any) {
    store.commit(`cushax/${page}/${name}`, payload);
  });

  // root commit
  socket.on("commit", function (name: string, payload: any) {
    store.commit(`cushax/${name}`, payload);
  });

  // reset
  socket.on("*", function (pages: string[]) {
    for (let page of pages) {
      let module = schema.modules?.[page];

      if (!module) {
        continue;
      }

      store.commit(`cushax/${page}/$reset`, module.state);
    }
  });
}
