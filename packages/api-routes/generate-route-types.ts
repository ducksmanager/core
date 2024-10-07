import express from "express";
import { router } from "express-file-routing";
import { readdirSync, readFileSync, writeFileSync } from "fs";

const app = express();
(async () => {
  app.use("/", await router({ directory: process.cwd() + "/../api/routes" }));

  type Route = {
    path: string | RegExp;
    methods: { [method: string]: boolean };
  };
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
    "// noinspection ES6PreferShortImport",
    "",
    'import { Prisma } from "~prisma-schemas/client_dm";',
    'import { ContractWithMethodAndUrl } from "~axios-helper";',
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
          ].join(", ")} } from "~dm-types/${file.replace(/\.ts$/, "")}";`
      )
      .join("\n")
  );
  imports.push(
    readdirSync("../prisma-schemas/schemas")
      .filter((file) => /\.prisma$/.test(file))
      .map(
        (file) =>
          `import { ${[
            ...readFileSync(`../prisma-schemas/schemas/${file}`)
              .toString()
              .matchAll(/(?:(?<=model )|(?<=enum ))[^ ]+/g)!,
          ].join(", ")} } from "~prisma-schemas/client_${file.replaceAll(
            /(\.prisma)|(schema_)/g,
            ""
          )}";`
      )
      .join("\n")
  );
  const types: string[] = [];

  let routeClassList = {} as { [routePathWithMethod: string]: string };
  routes.forEach((route) => {
    routeClassList = Object.keys(route.methods)
      .filter((method) => ["get", "post", "delete", "put"].includes(method))
      .reduce((acc, method) => {
        const realMethod = method === "delete" ? "del" : method;
        const routePathWithMethod = `${method.toUpperCase()} ${route.path}`;

        let routeFile;
        const routeBasePath = `../api/routes/${(route.path as string).replace(
          /^\//,
          ""
        )}`;
        try {
          routeFile = readFileSync(`${routeBasePath}/index.ts`);
        } catch (e) {
          routeFile = readFileSync(`${routeBasePath}.ts`);
        }
        const callType = new RegExp(
          `export const ${realMethod} =.+?ExpressCall<( *.+?)>[ \\n]*\\) =>`,
          "gms"
        ).exec(routeFile.toString())![1];

        acc[
          routePathWithMethod
        ] = ` extends ContractWithMethodAndUrl<${callType}> {
            static readonly method = "${method}";
            static readonly url = "${route.path}";
        }`;
        return acc;
      }, routeClassList);
  });
  writeFileSync(
    "index.ts",
    [
      imports.join("\n"),
      types.join("\n"),
      Object.entries(routeClassList)
        .map(
          ([routePathWithMethod, callback]) =>
            `export class ${routePathWithMethod
              .replaceAll("/", "__")
              .replaceAll(/ /g, "")
              .replaceAll(/:/g, "$")
              .replaceAll(/-/g, "_")} ${callback}`
        )
        .join("\n"),
    ].join("\n")
  );
})();
