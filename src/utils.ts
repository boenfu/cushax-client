import { Route } from "vue-router";
import { Store, Module } from "vuex";
import { VueConstructor } from "vue";

export function buildPage(
  route: Route,
  store: Store<{ cushax: any }>
): any | undefined {
  let page = matchPage(route);

  if (!page) {
    return undefined;
  }

  let params = store.state.cushax?.[page]?.$params ?? {};

  return {
    page,
    payload: {
      query: route.query,
      params: { ...params, ...route.params },
    },
  };
}

export function matchPage(route: Route): string | undefined {
  return route.meta.cushax || route.name;
}

export function existPage(
  schema: Module<any, any>,
  page: string = ""
): page is string {
  return !!schema.modules?.[page];
}

export function verifyInstance(vue: Vue, Vue: VueConstructor): void {
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
