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
    installed: false,
    install: function (Vue: VueConstructor) {
      let cushax = this;

      Vue.prototype.$init_cushax = function () {
        let $vue: Vue = this;

        verifyInstance($vue, Vue);

        let store = $vue.$store;
        let router = $vue.$router;
        let socket = cushax.socket;

        registerModule(store, schema);
        overseeSocket(socket, store, schema);
        overseeRoute(router, store, socket);
      };

      Vue.mixin({
        beforeMount(): void {
          let $vue = this as any;

          if (!cushax.installed) {
            $vue.$init_cushax();
            cushax.installed = true;
          }

          let route: Route = $vue.$route;
          let pageName = matchPage(route);

          if (pageName) {
            let page = new Page(pageName, schema, socket, $vue);

            for (let { instances } of route.matched) {
              for (let instance of Object.values(instances)) {
                (instance as any).$page = page;
              }
            }
          }
        },
      });
    },
    socket,
  };
}

export class Page<TSchema extends Module<any, any>> {
  get state(): TSchema["state"] {
    return this.vue.$store.state.cushax?.[this.name];
  }

  private get schema(): Module<any, any> | undefined {
    return this.cushax.modules?.[this.name];
  }

  constructor(
    private name: string,
    private cushax: Module<string, string>,
    private socket: SocketIOClient.Socket,
    private vue: Vue
  ) {}

  commit = (name: string, payload: any): void => {
    this.vue.$store.commit(`cushax/${this.name}/${name}`, payload);
  };

  update = (params: any): void => {
    console.log(params);

    this.vue.$store.commit(`cushax/${this.name}/$update`, params);

    this.socket.emit("page:sync", {
      update: buildPage(this.vue.$route, this.vue.$store),
    });
  };

  emit = (name: string, payload: any): void => {
    if (!this.schema?.state["$event"]?.[name]) {
      return;
    }

    this.socket.emit(
      "page:event",
      buildPage(this.vue.$route, this.vue.$store),
      payload
    );
  };

  reset = (): void => {
    console.log(this);

    this.vue.$store.commit(`cushax/${this.name}/$reset`, this.schema?.state);
  };
}

function verifyInstance(vue: Vue, Vue: VueConstructor): void {
  if (!(vue instanceof Vue)) {
    throw Error("Not instanceof Vue");
  }

  if (!vue.$store) {
    throw Error("Not found property $store, make sure vuex installed");
  }

  if (!vue.$router) {
    throw Error("Not found property $router, make sure vue-router installed");
  }
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

function registerModule(store: Store<any>, schema: Module<any, any>) {
  let modules = schema.modules;

  for (let key in modules) {
    if (!modules[key]) {
      continue;
    }

    modules[key].namespaced = true;

    if (!modules[key].mutations) {
      modules[key].mutations = {};
    }

    modules[key].mutations!["$reset"] = function (state, defaultState) {
      Object.assign(state, defaultState);
    };

    modules[key].mutations!["$update"] = function (state, params) {
      state.$params = { ...state.$params, ...params };
    };
  }

  store.registerModule("cushax", {
    ...schema,
    namespaced: true,
  });
}

function buildPage(
  route: Route,
  store: Store<{ cushax: any }>
): any | undefined {
  let page = matchPage(route);

  if (!page) {
    return undefined;
  }

  let params = store.state.cushax?.[page]?.$params ?? {};

  console.log("没关系", params);

  return {
    page,
    payload: {
      query: route.query,
      params: { ...params, ...route.params },
    },
  };
}

function matchPage(route: Route): string | undefined {
  return route.meta.cushax || route.name;
}
