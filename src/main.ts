import io from "socket.io-client";

import { VueConstructor } from "vue";
import { Store, Module } from "vuex";
import VueRouter from "vue-router";

import { Schema as _Schema } from "cushax-schema";

import { buildPage, verifyInstance } from "./utils";
import mixinBuilder from "./mixin";
import { registerModule } from "./register";

import "./types";
import { wrapSocket } from "./socket";

export const Schema = _Schema;

export type SocketOptions =
  | string
  | (SocketIOClient.ConnectOpts & { host: string });

export interface PageInstanceDict {
  [key: string]: Vue | undefined;
}

type PageInstanceDictProxy = PageInstanceDict & {
  _entered: {
    [key: string]: any;
  };
  _updated: {
    [key: string]: any;
  };
};

export interface ICushax {
  installed: boolean;
  mounted: boolean;
  verified: boolean;
  install: (Vue: VueConstructor) => void;
  socket: SocketIOClient.Socket;
  pageInstanceDict: PageInstanceDict;
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
  socketOptions: SocketOptions,
  options?: CushaxOptions
): ICushax {
  let url!: string;
  let socketIOClientOptions: SocketIOClient.ConnectOpts | undefined;

  if (typeof socketOptions === "object") {
    let { host, ...options } = socketOptions;

    url = host;
    socketIOClientOptions = options;
  } else {
    url = socketOptions;
  }

  let socket = io(url + "/cushax", socketIOClientOptions);

  wrapSocket(socket);

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
        overseeSocket(socket, cushax, store, schema);
        overseeRoute(router, store, socket);
      };

      // mixin

      Vue.mixin(mixinBuilder(cushax, schema, socket));
    },
    socket,
    options,
    mounted: false,
    pageInstanceDict: getPageInstanceDict(),
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
  cushax: ICushax,
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

  // page hook
  socket.on("page:entered", function (name: string) {
    cushax.pageInstanceDict[name]?.$pageEntered?.();
  });

  socket.on("page:updated", function (name: string) {
    cushax.pageInstanceDict[name]?.$pageUpdated?.();
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

function getPageInstanceDict(): PageInstanceDictProxy {
  let proxy = new Proxy<PageInstanceDict>(
    {},
    {
      get(
        dict: PageInstanceDict,
        key: string,
        receiver: PageInstanceDictProxy
      ): Partial<Vue> {
        let instance = dict[key];

        if (instance) {
          return instance;
        }

        // proxy hook when instance not ready
        return {
          $pageEntered() {
            receiver["_entered"][key] = true;
          },
          $pageUpdated() {
            receiver["_updated"][key] = true;
          },
        };
      },
      set(
        dict: PageInstanceDict,
        key: string,
        instance: Vue,
        receiver: PageInstanceDictProxy
      ) {
        dict[key] = instance;

        if (receiver["_entered"][key]) {
          delete receiver["_entered"][key];
          instance?.$pageEntered?.();
        }

        if (receiver["_updated"][key]) {
          delete receiver["_updated"][key];
          instance?.$pageUpdated?.();
        }

        return true;
      },
    }
  ) as PageInstanceDictProxy;

  proxy._entered = {};
  proxy._updated = {};

  return proxy;
}
