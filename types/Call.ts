export type Call<
  ResBody,
  Params = Record<string, string> | undefined,
  ReqBody = unknown,
  Query = unknown
> = {
  resBody?: ResBody;
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
};

export type CallWithoutResBody<
  Params = Record<string, string> | undefined,
  ReqBody = unknown,
  Query = unknown
> = {
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
};

export abstract class ContractWithMethodAndUrl<T extends Call<unknown>> {
  protected constructor(t: T) {
    this.call = { params: t.params, query: t.query, reqBody: t.reqBody };
  }
  static readonly method: "get" | "post" | "put" | "delete";
  static readonly url: string;
  call!: CallWithoutResBody;

  resBody!: T["resBody"];
}
