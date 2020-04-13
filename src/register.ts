import { Store, Module } from "vuex";

export function registerModule(store: Store<any>, schema: Module<any, any>) {
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
