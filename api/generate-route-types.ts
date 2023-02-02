import express from "express";
import { router } from "express-file-routing";
import { readdirSync, readFileSync, writeFileSync } from "fs";

const app = express();
app.use("/", router());

type Route = { path: string | RegExp; methods: { [method: string]: boolean } };
const routes: Route[] = [];
app._router.stack.forEach(
  (middleware: {
    route: Route;
    name: string;
    handle: { stack: [{ route: Route }] };
  }) => {
    if (middleware.route && typeof middleware.route.path === "string") {
      // routes registered directly on the app
      routes.push(middleware.route);
    } else if (middleware.name === "router") {
      // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route && typeof handler.route.path === "string") {
          routes.push(handler.route);
        }
      });
    }
  }
);

const imports: string[] = [
  'import { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";',
  'import { AxiosCacheInstance, CacheRequestConfig } from "axios-cache-interceptor";',
  'import { Prisma } from "~prisma_clients/client_dm";',
  'import { call } from "~types/Call";',
];
imports.push(
  readdirSync("../types")
    .filter((file) => /\.ts$/.test(file) && /^[A-Z]/.test(file[0]))
    .map(
      (file) =>
        `import { ${[
          ...readFileSync(`../types/${file}`)
            .toString()
            .matchAll(/(?:(?<=export type )|(?<=export interface ))\w+/g)!,
        ].join(", ")} } from "~types/${file.replace(/\.ts$/, "")}";`
    )
    .join("\n")
);
imports.push(
  readdirSync("prisma")
    .filter((file) => /\.prisma$/.test(file))
    .map(
      (file) =>
        `import { ${[
          ...readFileSync(`prisma/${file}`)
            .toString()
            .matchAll(/(?:(?<=model )|(?<=enum ))[^ ]+/g)!,
        ].join(", ")} } from "~prisma_clients/client_${file.replaceAll(
          /(\.prisma)|(schema_)/g,
          ""
        )}";`
    )
    .join("\n")
);
let types: string[] = [];

const routeList = {} as { [routePathWithMethod: string]: string };
routes.forEach((route) => {
  types = types.concat(
    Object.keys(route.methods)
      .filter((method) => ["get", "post", "delete", "put"].includes(method))
      .map((method) => {
        const routePathWithMethod = `${method.toUpperCase()} ${route.path}`;

        const routePath = `${(route.path as string)
          .replaceAll("/:", "__")
          .replaceAll(/[/-]/g, "_")
          .toUpperCase()}`;

        const typeName = `${method.toUpperCase()}_CALL${routePath}`;
        let routeFile;
        const routeBasePath = `routes/${(route.path as string).replace(
          /^\//,
          ""
        )}`;
        try {
          routeFile = readFileSync(`${routeBasePath}/index.ts`);
        } catch (e) {
          routeFile = readFileSync(`${routeBasePath}.ts`);
        }
        const callType = new RegExp(
          `export const ${
            method === "delete" ? "del" : method
          } =.+?Express(Call< *.+?>)[ \\n]*\\) =>`,
          "gms"
        ).exec(routeFile.toString())![1];

        routeList[routePathWithMethod] = `
            (
              axios: AxiosInstance | AxiosCacheInstance,
              config?: TypedConfig<${typeName}>
            ) => call<${typeName}>("${method}", "${route.path}", axios, config);
        `;
        return `export type ${typeName} = ${callType}`;
      })
  );
});
writeFileSync(
  "../types/routes.ts",
  [
    imports.join("\n"),
    types.join("\n"),
    Object.entries(routeList)
      .map(
        ([routePathWithMethod, callback]) =>
          `export const ${routePathWithMethod
            .replaceAll("/", "__")
            .replaceAll(/ /g, "")
            .replaceAll(/:/g, "$")
            .replaceAll(/-/g, "_")} = ${callback};`
      )
      .join("\n"),
  ].join("\n")
);
