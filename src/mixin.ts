import { Route } from "vue-router";
import { matchPage, existPage, buildPage } from "./utils";
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

      let cushax = new Cushax(socket, $vue, cushaxObject);

      $vue.$cushax = cushax;
      $vue.$getCushax = () => cushax as any;

      for (let { instances } of route?.matched ?? []) {
        for (let instance of Object.values(instances)) {
          if (!instance || !((instance as any)._uid === $vue._uid)) {
            continue;
          }

          // hack first loaded page
          if (!cushaxObject.mounted) {
            cushaxObject.mounted = true;

            setTimeout(() => {
              socket.emit("page:sync", {
                enter: buildPage(route, instance.$store),
              });
            });
          }

          let pageName = matchPage(route);

          let page = existPage(schema, pageName)
            ? new Page(pageName, schema, socket, $vue)
            : undefined;

          instance.$page = page!;
          instance.$getPage = () => page as any;
        }
      }
    },
  };
}
