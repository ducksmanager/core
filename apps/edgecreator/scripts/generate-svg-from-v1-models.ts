import "./ssr-polyfills";
import "~group-by";

import { JSDOM } from "jsdom";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { SocketClient } from "socket-call-client";
import namespaces from "~edgecreator-services/namespaces";
import type { ClientEvents as BrowseServices } from "~edgecreator-services/browse";
import type { ClientEvents as ImageInfoServices } from "~edgecreator-services/image-info";
import type { ClientEvents as LegacyServices } from "~edgecreator-services/legacy";
import type { ClientEvents as SaveServices } from "~edgecreator-services/save";
import type { ClientEvents as TextServices } from "~edgecreator-services/text";
import type { ClientEvents as UploadServices } from "~edgecreator-services/upload";
import useLegacyDb from "../src/composables/useLegacyDb";
import { optionObjectToArray } from "../src/stores/step";
import type { StepOption } from "../src/stores/step";
import EdgeCanvas from "../src/components/EdgeCanvas.vue";
import { step } from "../src/stores/step";
import { editingStep } from "../src/stores/editingStep";
import { edgecreatorSocketInjectionKey } from "../src/composables/useEdgecreatorSocket";
import { main } from "../src/stores/main";
import fr from "../locales/fr-FR.json";

if (typeof process.loadEnvFile === "function") process.loadEnvFile();

if (!process.env.EDGES_PATH) {
  throw new Error("EDGES_PATH is not set");
}
if (!existsSync(process.env.EDGES_PATH)) {
  throw new Error("EDGES_PATH does not exist");
}
const EDGES_PATH = process.env.EDGES_PATH;

const discoverPngFiles = () => {
  const results: {
    pngPath: string;
    publicationcode: string;
    issuenumber: string;
  }[] = [];

  for (const country of readdirSync(EDGES_PATH, { withFileTypes: true })) {
    if (!country.isDirectory()) continue;
    const genDir = path.join(EDGES_PATH, country.name, "gen");
    if (!existsSync(genDir)) continue;
    for (const file of readdirSync(genDir, { withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith(".png")) continue;
      const basename = file.name.slice(0, -4); // remove .png
      const parts = basename.split(".");
      if (parts.length < 2) continue;
      const magazinecode = parts[0];
      const issuenumber = parts.slice(1).join(".");
      const publicationcode = `${country.name}/${magazinecode}`;
      results.push({
        pngPath: path.join(genDir, file.name),
        publicationcode,
        issuenumber,
      });
    }
  }
  return results;
};

const socket = new SocketClient(process.env.VITE_EDGECREATOR_SOCKET_URL!);
socket.onConnectError = (e: Error) => console.error(e);

const session = {
  getToken: () => Promise.resolve(process.env.EDGECREATOR_TOKEN ?? null),
  clearSession: () => {},
  sessionExists: () => Promise.resolve(false),
};
const legacyNamespace = socket.addNamespace<LegacyServices>(namespaces.LEGACY);
const imageInfoNamespace = socket.addNamespace<ImageInfoServices>(
  namespaces.IMAGE_INFO,
  { session },
);
const browseNamespace = socket.addNamespace<BrowseServices>(namespaces.BROWSE, {
  session,
});
const saveNamespace = socket.addNamespace<SaveServices>(namespaces.SAVE, {
  session,
});
const textNamespace = socket.addNamespace<TextServices>(namespaces.TEXT, {
  session,
});
const uploadNamespace = socket.addNamespace<UploadServices>(namespaces.UPLOAD, {
  session,
});

const componentNameByLegacy: Record<string, string> = {
  Agrafer: "Staple",
  Remplir: "Fill",
  Degrade: "Gradient",
  Polygone: "Polygon",
  Arc_cercle: "ArcCircle",
  TexteMyFonts: "Text",
  Image: "Image",
  Rectangle: "Rectangle",
};

const legacyDb = useLegacyDb();
const getImageInfo = (p: string) => imageInfoNamespace.getImageInfo(p);

const i18n = createI18n({
  legacy: false,
  locale: "en-US",
  fallbackLocale: "en-US",
  messages: {
    "en-US": Object.fromEntries(Object.keys(fr).map((key) => [key, key])),
    fr,
  },
});

const edgecreatorSocket = {
  options: {
    onConnectError: (e: Error) => console.error(e),
    session,
  },
  imageInfo: imageInfoNamespace,
  browse: browseNamespace,
  legacy: legacyNamespace,
  save: saveNamespace,
  text: textNamespace,
  upload: uploadNamespace,
};

const generateSvgForIssue = async (
  publicationcode: string,
  issuenumber: string,
  outputPath: string,
) => {
  const issuecode = `${publicationcode} ${issuenumber}`;
  try {
    const [legacyStepsRaw, legacyDimensionsRaw] = await Promise.all([
      legacyNamespace.getLegacySteps(publicationcode, issuenumber),
      legacyNamespace.getLegacyDimensions(publicationcode, issuenumber),
    ]);

    const dimensionsMap = Object.fromEntries(
      legacyDimensionsRaw.map(({ optionName, optionValue }) => [
        optionName,
        optionValue,
      ]),
    );

    if (!dimensionsMap.Dimension_x || !dimensionsMap.Dimension_y) {
      console.warn(`[${issuecode}] Missing dimensions, skipping`);
      return false;
    }

    const dimensions = {
      width: parseInt(dimensionsMap.Dimension_x, 10),
      height: parseInt(dimensionsMap.Dimension_y, 10),
    };

    const stepsByNumber = legacyStepsRaw.reduce<
      Record<
        number,
        { functionName: string; options: Record<string, string | number> }
      >
    >((acc, { stepNumber, functionName, optionName, optionValue }) => {
      if (stepNumber === -1) return acc;
      if (!acc[stepNumber]) {
        acc[stepNumber] = { functionName, options: {} };
      }
      const num = parseFloat(optionValue);
      acc[stepNumber].options[optionName] = Number.isNaN(num)
        ? optionValue
        : num;
      return acc;
    }, {});

    const stepOptions: StepOption[] = [];
    let stepIndex = 0;
    for (const stepNumber of Object.keys(stepsByNumber)
      .map(Number)
      .sort((a, b) => a - b)) {
      const { functionName, options: legacyOptions } =
        stepsByNumber[stepNumber];
      const componentName = componentNameByLegacy[functionName] ?? functionName;
      if (!componentName) {
        console.warn(
          `[${issuecode}] Unknown component: ${functionName}, skipping`,
        );
        return false;
      }
      const converted = await legacyDb.getOptionsFromDb(
        publicationcode,
        issuenumber,
        stepIndex,
        {
          component: componentName,
          options: legacyOptions,
        } as Parameters<typeof legacyDb.getOptionsFromDb>[3],
        dimensions,
        getImageInfo,
        false,
      );
      if (!converted) {
        console.warn(
          `[${issuecode}] Conversion failed for step ${stepNumber} (${functionName}), skipping`,
        );
        return false;
      }
      const optionsArray = optionObjectToArray(converted);
      for (const { optionName, optionValue } of optionsArray) {
        stepOptions.push({
          stepNumber: stepIndex,
          issuecode,
          optionName,
          optionValue,
        });
      }
      stepIndex += 1;
    }

    const pinia = createPinia();
    const app = createSSRApp({
      setup() {
        main(pinia).issuecodes = [issuecode];
        editingStep(pinia).replaceIssuecode(issuecode);
        step(pinia).setDimensions(dimensions, { issuecodes: [issuecode] });
        step(pinia).overwriteSteps(issuecode, stepOptions);
        return () =>
          h(EdgeCanvas, {
            issuecode,
            dimensions,
            steps: stepOptions,
            contributors: [],
            legacyImport: true,
          });
      },
    });

    app.provide(edgecreatorSocketInjectionKey, edgecreatorSocket);
    app.use(pinia);
    app.use(i18n);

    const html = await renderToString(app);
    const dom = new JSDOM(html);
    const svgEl = dom.window.document.querySelector("svg");
    if (!svgEl) {
      console.warn(`[${issuecode}] No SVG found in render output, skipping`);
      return false;
    }

    for (const node of [...svgEl.querySelectorAll("*")]) {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === dom.window.Node.COMMENT_NODE) child.remove();
      }
    }
    for (const child of [...svgEl.childNodes]) {
      if (child.nodeType === dom.window.Node.COMMENT_NODE) child.remove();
    }

    const viewBox =
      svgEl.getAttribute("viewbox") ?? svgEl.getAttribute("viewBox");
    if (viewBox) {
      svgEl.removeAttribute("viewbox");
      svgEl.removeAttribute("viewBox");
      svgEl.setAttribute("viewBox", viewBox);
    }
    const preserveAspectRatio =
      svgEl.getAttribute("preserveaspectratio") ??
      svgEl.getAttribute("preserveAspectRatio");
    if (preserveAspectRatio) {
      svgEl.removeAttribute("preserveaspectratio");
      svgEl.removeAttribute("preserveAspectRatio");
      svgEl.setAttribute("preserveAspectRatio", preserveAspectRatio);
    }

    const svg = svgEl.outerHTML;
    writeFileSync(outputPath, `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);
    return true;
  } catch (err) {
    console.warn(
      `[${issuecode}] ${err instanceof Error ? err.message : String(err)}, skipping`,
    );
    return false;
  }
};

const pngFiles = discoverPngFiles();

console.log(`Found ${pngFiles.length} PNG files in ${EDGES_PATH}`);

let generated = 0;
let skipped = 0;
for (const { pngPath, publicationcode, issuenumber } of pngFiles) {
  const outputPath = pngPath.replace(/\.png$/i, ".svg");
  const success = await generateSvgForIssue(
    publicationcode,
    issuenumber,
    outputPath,
  );
  if (success) {
    generated++;
    console.log(`Generated ${outputPath}`);
  } else {
    skipped++;
  }
}

console.log(`Done: ${generated} SVG(s) generated, ${skipped} skipped`);
process.exit(0);
