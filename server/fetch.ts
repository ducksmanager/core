import axios from "axios";

export const runQuery = (
  query: string,
  db: string,
  parameters: { [string]: never } = {}
) => {
  const requestParameters = new URLSearchParams();
  requestParameters.append("query", query.trim());
  requestParameters.append("parameters", JSON.stringify(parameters));
  requestParameters.append("db", db);
  return fetch("/rawsql", "rawsql", requestParameters, "POST");
};

export const fetch = async (
  path: string,
  role: string,
  parameters: { [string]: never } = {},
  method = "GET"
) =>
  await axios
    .request({
      url: `${process.env.BACKEND_URL}${path}`,
      auth: {
        username: role,
        password: process.env[`ROLE_PASSWORD_${role.toUpperCase()}`],
      },
      data: parameters,
      method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
        "x-dm-version": "1.0",
        // ...getUserCredentials(useRequestHeaders(["cookie"])),
      },
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });
