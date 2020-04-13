import { Module } from "vuex";
import { buildPage } from "./utils";

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
    this.vue.$store.commit(`cushax/${this.name}/$update`, params);

    this.socket.emit("page:sync", {
      update: buildPage(this.vue.$route, this.vue.$store),
    });
  };

  emit = (event: string, data: any): void => {
    if (!this.schema?.state["$event"]?.[event]) {
      return;
    }

    this.socket.emit("page:event", {
      event,
      data,
      page: buildPage(this.vue.$route, this.vue.$store),
    });
  };

  reset = (): void => {
    this.vue.$store.commit(`cushax/${this.name}/$reset`, this.schema?.state);
  };
}
