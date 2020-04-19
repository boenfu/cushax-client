import { Module } from "vuex";
import { buildPage } from "./utils";
import { ObjectPropertyToPair, UnionToIntersection } from "./types";

type PageCommitType<
  TSchema extends Module<any, any>,
  TPair = ObjectPropertyToPair<TSchema, "mutations", keyof TSchema["mutations"]>
> = UnionToIntersection<
  TPair extends [infer TName, infer TFunction]
    ? TFunction extends (state: any, payload: infer TPayload) => any
      ? (name: TName, payload: TPayload) => void
      : never
    : never
>;

type PageUpdateType<
  TSchema extends Module<any, any>,
  TD = Pick<TSchema["state"], "$params">
> = UnionToIntersection<TD> extends { $params: infer P }
  ? (params: Partial<P>) => void
  : never;

type PageEmitType<
  TSchema extends Module<any, any>,
  TD = Pick<TSchema["state"], "$event">
> = UnionToIntersection<TD> extends { $event: infer E }
  ? <TKey extends keyof E>(params: TKey, data: E[TKey]) => void
  : never;

export class Page<TModule extends Module<any, any>> {
  get state(): TModule["state"] {
    return this.vue.$store.state.cushax?.[this.name];
  }

  private get schema(): TModule | undefined {
    return this.cushax.modules?.[this.name];
  }

  constructor(
    private name: string,
    private cushax: any,
    private socket: SocketIOClient.Socket,
    private vue: Vue
  ) {}

  commit = ((name: string, payload: any): void => {
    this.vue.$store.commit(`cushax/${this.name}/${name}`, payload);
  }) as PageCommitType<TModule>;

  update = ((params: any): void => {
    this.vue.$store.commit(`cushax/${this.name}/$update`, params);

    this.socket.emit("page:sync", {
      update: buildPage(this.vue.$route, this.vue.$store),
    });
  }) as PageUpdateType<TModule>;

  emit = ((event: string, data: any): void => {
    try {
      if (!(event in this.schema?.state["$event"])) {
        return;
      }
    } catch {
      return;
    }

    this.socket.emit("page:event", {
      event,
      data,
      page: buildPage(this.vue.$route, this.vue.$store),
    });
  }) as PageEmitType<TModule>;

  reset = (): void => {
    this.vue.$store.commit(`cushax/${this.name}/$reset`, this.schema?.state);
  };
}
