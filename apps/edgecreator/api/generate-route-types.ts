import express from "express";
import { router } from "express-file-routing";
import { readdirSync, readFileSync, writeFileSync } from "fs";

const app = express();

interface Route {
  path: string | RegExp;
  methods: Record<string, boolean>;
}
const routes: Route[] = [];

(async () => {
  app.use("/", await router({ directory: `${process.cwd()}/routes` }));
  app._router.stack.forEach(
    (middleware: {
      route: Route;
      name: string;
      handle: { stack: [{ route: Route }] };
    }) => {
      if (typeof middleware.route?.path === "string") {
        // routes registered directly on the app
        routes.push(middleware.route);
      } else if (middleware.name === "router") {
        // router middleware
        middleware.handle.stack.forEach((handler) => {
          if (typeof handler.route?.path === "string") {
            routes.push(handler.route);
          }
        });
      }
    }
  );

  const imports: string[] = [
    "// noinspection ES6PreferShortImport",
    "",
    'import { ContractWithMethodAndUrl } from "./Call";',
  ];
  imports.push(
    readdirSync("../types")
      .filter((file) => file.endsWith(".ts") && /^[A-Z]/.test(file[0]))
      .map(
        (file) =>
          `import { ${[
            ...readFileSync(`../types/${file}`)
              .toString()
              .matchAll(/(?:(?<=export type )|(?<=export interface ))\w+/g)!,
          ].join(", ")} } from "./${file.replace(/\.ts$/, "")}";`
      )
      .join("\n")
  );
  const types: string[] = [];

  let routeClassList = {} as Record<string, string>;
  routes.forEach((route) => {
    routeClassList = Object.keys(route.methods)
      .filter((method) => ["get", "post", "delete", "put"].includes(method))
      .reduce((acc, method) => {
        const realMethod = method === "delete" ? "del" : method;
        const routePathWithMethod = `${method.toUpperCase()} ${
          route.path as string
        }`;

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
          `export const ${realMethod} =.+?ExpressCall<( *.+?)>[ \\n]*\\) =>`,
          "gms"
        ).exec(routeFile.toString())![1];

        acc[
          routePathWithMethod
        ] = ` extends ContractWithMethodAndUrl<${callType}> {
            static readonly method = "${method}";
            static readonly url = "${route.path as string}";
        }`;
        return acc;
      }, routeClassList);
  });
  writeFileSync(
    "../types/routes.ts",
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
