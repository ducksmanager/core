export interface Call<ResBody, Params = Record<string, string> | undefined, ReqBody = unknown, Query = unknown> {
  resBody?: ResBody;
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
}

export interface CallWithoutResBody<Params = Record<string, string> | undefined, ReqBody = unknown, Query = unknown> {
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
}

export abstract class ContractWithMethodAndUrl<T extends Call<unknown>> {
  constructor(t?: Omit<T, 'resBody'>) {
    if (t) {
      this.call = { params: t.params, query: t.query, reqBody: t.reqBody };
    }
  }
  public getMethod = (): string => (this.constructor as typeof ContractWithMethodAndUrl).method;
  public getUrl = (): string => (this.constructor as typeof ContractWithMethodAndUrl).url;

  static readonly method: 'get' | 'post' | 'put' | 'delete';
  static readonly url: string;
  call?: CallWithoutResBody;

  resBody!: T['resBody'];
}
