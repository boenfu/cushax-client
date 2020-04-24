import { Module } from "vuex";
import { ObjectPropertyToPair, UnionToIntersection } from "./types";
import { ICushax } from "./main";

type CushaxCommitType<
  TSchema extends Module<any, any>,
  TPair = ObjectPropertyToPair<TSchema, "mutations", keyof TSchema["mutations"]>
> = UnionToIntersection<
  TPair extends [infer TName, infer TFunction]
    ? TFunction extends (state: any, payload: infer TPayload) => any
      ? (name: TName, payload: TPayload) => void
      : never
    : never
>;

type CushaxAuthType<TSchema extends Module<any, any>> = (
  data: Partial<TSchema["state"]["$auth"]>
) => void;

export class Cushax<TModule extends Module<any, any>> {
  get state(): TModule["state"] {
    return this.vue.$store.state.cushax;
  }

  get verified(): boolean {
    return this.cushax.verified;
  }

  constructor(
    public socket: SocketIOClient.Socket,
    private vue: Vue,
    private cushax: ICushax
  ) {}

  commit = ((name: string, payload: any): void => {
    this.vue.$store.commit(`cushax/${name}`, payload);
  }) as CushaxCommitType<TModule>;

  auth = ((data: any): void => {
    this.socket.emit("auth", data);
  }) as CushaxAuthType<TModule>;
}
