export type Call<
  ResBody,
  P = undefined,
  ReqBody = undefined,
  ReqQuery = undefined
> = {
  resBody: ResBody;
  params: P;
  reqBody: ReqBody;
  reqQuery: ReqQuery;
};
