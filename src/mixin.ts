import { Route } from "vue-router";
import { matchPage, existPage } from "./utils";
import { Page } from "./page";
import { Module } from "vuex";
import { ICushax } from "./main";
import { Cushax } from "./cushax";

export default function (
  cushaxObject: ICushax,
  schema: Module<any, any>,
  socket: SocketIOClient.Socket
) {
  return {
    beforeMount(): void {
      let $vue = this as any;

      if (!cushaxObject.installed) {
        $vue.$init_cushax();
        cushaxObject.installed = true;
      }

      let route: Route = $vue.$route;
      let pageName = matchPage(route);

      let cushax = new Cushax(socket, $vue, cushaxObject);

      let page = existPage(schema, pageName)
        ? new Page(pageName, schema, socket, $vue)
        : undefined;

      for (let component of $vue.$root.$children) {
        component.$cushax = cushax;
        component.$getCushax = () => cushax as any;
      }

      for (let { instances } of route?.matched ?? []) {
        for (let instance of Object.values(instances)) {
          instance.$cushax = cushax;
          instance.$getCushax = () => cushax as any;

          instance.$page = page!;
          instance.$getPage = () => page as any;
        }
      }
    },
  };
}
