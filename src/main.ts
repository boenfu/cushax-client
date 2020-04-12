import { VueConstructor } from "vue";
import VueRouter, { Route } from "vue-router";
import io from "socket.io-client";

import { schema as testSchema } from "./schema";
import { Store, Module } from "vuex";

export default function (
  schema: Module<any, any> = testSchema,
  socket: SocketIOClient.Socket = io("http://localhost/cushax")
) {
  return {
    install: function (Vue: VueConstructor) {
      let socket = this.socket;

      Vue.prototype.$initCushax = function () {
        let $vue: Vue & { $router: VueRouter } = this;

        if (!($vue instanceof Vue)) {
          throw Error("Not instanceof Vue");
        }

        if (!$vue.$store) {
          throw Error("Not found vuex store");
        }

        if (!$vue.$router) {
          throw Error("Not found vue router");
        }

        let store = $vue.$store;

        let modules = schema.modules;

        for (let key in modules) {
          if (!modules[key]) {
            continue;
          }

          modules[key].namespaced = true;
        }

        store.registerModule("cushax", {
          ...schema,
          namespaced: true,
        });

        socket.on("page:sync", function (
          page: string,
          name: string,
          payload: any
        ) {
          store.commit(`cushax/${page}/${name}`, payload);
        });

        socket.on("commit", function (type: string, payload: any) {
          store.commit(type, payload);
        });

        $vue.$router.beforeEach((to, from, next) => {
          console.log({
            enter: build(to, store),
            leave: build(from, store),
          });

          socket.emit("page:sync", {
            enter: build(to, store),
            leave: build(from, store),
          });

          next();
        });
      };
    },
    socket,
  };
}

function build(route: Route, store: Store<{ cushax: any }>): any | undefined {
  let page = route.meta.cushax || route.name;

  if (!page) {
    return undefined;
  }

  let params = (store as any).cushax?.[page]?.state?.$params ?? {};

  return {
    page,
    payload: {
      query: route.query,
      params: { ...route.params, ...params },
    },
  };
}
