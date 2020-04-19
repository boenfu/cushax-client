import { Route } from "vue-router";
import { matchPage, existPage } from "./utils";
import { Page } from "./page";
import { Module } from "vuex";
import { ICushax } from "./main";
import { Cushax } from "./cushax";

export default function (
  cushax: ICushax,
  schema: Module<any, any>,
  socket: SocketIOClient.Socket
) {
  return {
    beforeMount(): void {
      let $vue = this as any;

      if (!cushax.installed) {
        $vue.$init_cushax();
        cushax.installed = true;
      }

      let route: Route = $vue.$route;
      let pageName = matchPage(route);

      if (existPage(schema, pageName)) {
        let page = new Page(pageName, schema, socket, $vue);
        let cushax = new Cushax(socket, $vue);

        for (let { instances } of route.matched) {
          for (let instance of Object.values(instances)) {
            instance.$page = page;
            instance.$getPage = () => page as any;

            instance.$cushax = cushax;
            instance.$getCushax = () => cushax as any;
          }
        }
      }
    },
  };
}
