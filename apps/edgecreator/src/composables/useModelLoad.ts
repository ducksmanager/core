import { api } from "~/stores/api";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { users } from "~/stores/users";
import { LegacyComponent } from "~/types/LegacyComponent";
import {
  GET__edgecreator__contributors__$modelId,
  GET__edgecreator__model__$countrycode__$magazinecode__$issuenumber,
  GET__edgecreator__model__$modelId__photo__main,
} from "~dm_types/routes";

import { call } from "../../axios-helper";
import type { EdgeDimensions } from "./useDimensions";

const mainStore = main();
const rendersStore = renders();
const userStore = users();
const edgeCatalogStore = edgeCatalog();

const { getSvgMetadata, loadSvgFromString } = useSvgUtils();

const { getOptionsFromDb } = useLegacyDb();

const { setDimensions } = useDimensions();
const { setSteps } = useStepList();

export default () => {
  const getDimensionsFromSvg = (svgElement: SVGElement) => ({
    width: parseInt(svgElement.getAttribute("width")!) / 1.5,
    height: parseInt(svgElement.getAttribute("height")!) / 1.5,
  });
  const getStepsFromSvg = (svgChildNodes: SVGElement[]) =>
    svgChildNodes
      .filter(({ nodeName }) => nodeName === "g")
      .map((group) => ({
        component: group.getAttribute("class"),
        options: JSON.parse(
          (group.getElementsByTagName("metadata")[0] || { textContent: "{}" })
            .textContent!
        ),
      }));

  const setPhotoUrlsFromSvg = (
    issuenumber: string,
    svgChildNodes: SVGElement[]
  ) => {
    for (const photoUrl of getSvgMetadata(svgChildNodes, "photo")) {
      mainStore.photoUrls[issuenumber] = photoUrl;
    }
  };

  const setContributorsFromSvg = (
    issuenumber: string,
    svgChildNodes: SVGElement[]
  ) => {
    for (const contributionType of ["photographer", "designer"]) {
      for (const username of getSvgMetadata(
        svgChildNodes,
        `contributor-${contributionType}`
      )) {
        mainStore.addContributor({
          issuenumber,
          contributionType: `${contributionType}s` as
            | "photographers"
            | "designers",
          user: userStore.allUsers!.find((user) => user.username === username)!,
        });
      }
    }
  };

  const getDimensionsFromApi = (
    stepData: {
      [stepNumber: string]: {
        issuenumber: string;
        stepNumber: number;
        functionName: string;
        options: { [optionName: string]: string };
      };
    },
    defaultDimensions: EdgeDimensions | null = { width: 15, height: 200 }
  ): { width: number; height: number } | null => {
    const dimensions = Object.values(stepData).find(
      ({ stepNumber: originalStepNumber }) => originalStepNumber === -1
    );
    if (dimensions) {
      return {
        width: parseInt(dimensions.options.Dimension_x),
        height: parseInt(dimensions.options.Dimension_y),
      };
    }
    return defaultDimensions;
  };
  const getStepsFromApi = async (
    publicationcode: string,
    issuenumber: string,
    apiSteps: {
      [optionName: string]: {
        stepNumber: number;
        functionName: string;
        options: { [optionName: string]: any };
      };
    },
    dimensions: { width: number; height: number },
    calculateBase64: boolean,
    onError: (error: string, stepNumber: number) => void
  ) =>
    (
      await Promise.all(
        Object.values(apiSteps)
          .filter(
            ({ stepNumber: originalStepNumber }) => originalStepNumber !== -1
          )
          .map(
            async ({
              stepNumber: originalStepNumber,
              functionName: originalComponentName,
              options: originalOptions,
            }) => {
              const { component } = rendersStore.supportedRenders.find(
                (component) => component.originalName === originalComponentName
              ) || { component: null };
              if (component) {
                try {
                  return {
                    component,
                    options: await getOptionsFromDb(
                      publicationcode,
                      issuenumber,
                      originalStepNumber,
                      {
                        component,
                        options: originalOptions,
                      } as LegacyComponent,
                      dimensions,
                      calculateBase64
                    ),
                  };
                } catch (e) {
                  onError(
                    `Invalid step ${originalStepNumber} (${component}) : ${e}, step will be ignored.`,
                    originalStepNumber
                  );
                  return null;
                }
              } else {
                onError(
                  `Unrecognized step name : ${originalComponentName}, step will be ignored.`,
                  originalStepNumber
                );
                return null;
              }
            }
          )
      )
    ).filter((step) => !!step);
  const setContributorsFromApi = async (
    issuenumber: string,
    edgeId: number
  ) => {
    const contributors = (
      await call(
        api().dmApi,
        new GET__edgecreator__contributors__$modelId({
          params: {
            modelId: String(edgeId),
          },
        })
      )
    ).data;
    for (const { contribution, userId } of contributors) {
      mainStore.addContributor({
        issuenumber,
        contributionType:
          contribution === "photographe" ? "photographers" : "designers",
        user: userStore.allUsers!.find((user) => user.id === userId)!,
      });
    }
  };

  const loadModel = async (
    countrycode: string,
    magazinecode: string,
    issuenumber: string,
    targetIssuenumber: string
  ) => {
    const onlyLoadStepsAndDimensions = issuenumber !== targetIssuenumber;
    let loadedSteps: any;
    let dimensions: { width: number; height: number };

    const loadSvg = async (publishedVersion: boolean) => {
      const { svgElement, svgChildNodes } = await loadSvgFromString(
        countrycode,
        magazinecode,
        issuenumber,
        publishedVersion
      );

      dimensions = getDimensionsFromSvg(svgElement);
      loadedSteps = getStepsFromSvg(svgChildNodes);
      if (!onlyLoadStepsAndDimensions) {
        setPhotoUrlsFromSvg(issuenumber, svgChildNodes);
        setContributorsFromSvg(issuenumber, svgChildNodes);
      }
    };

    try {
      await loadSvg(false);
    } catch {
      try {
        await loadSvg(true);
      } catch {
        const publicationcode = `${countrycode}/${magazinecode}`;
        const edge = (
          await call(
            api().dmApi,
            new GET__edgecreator__model__$countrycode__$magazinecode__$issuenumber(
              {
                params: {
                  countrycode,
                  magazinecode,
                  issuenumber,
                },
              }
            )
          )
        ).data;
        if (edge) {
          await edgeCatalogStore.getPublishedEdgesSteps({
            publicationcode,
            edgeModelIds: [edge.id],
          });
          const apiSteps =
            edgeCatalogStore.publishedEdgesSteps[publicationcode][issuenumber];
          dimensions = getDimensionsFromApi(apiSteps)!;
          loadedSteps = await getStepsFromApi(
            publicationcode,
            issuenumber,
            apiSteps,
            dimensions,
            true,
            (error: string) => mainStore.addWarning(error)
          );

          if (!onlyLoadStepsAndDimensions) {
            await setPhotoUrlsFromApi(issuenumber, edge.id);
            await setContributorsFromApi(issuenumber, edge.id);
          }
        } else {
          await loadSvg(true);
        }
      }
    }
    if (loadedSteps) {
      setDimensions(dimensions!, targetIssuenumber);
      setSteps(targetIssuenumber, loadedSteps!);
    } else {
      throw new Error("No model found for issue " + issuenumber);
    }
  };

  const setPhotoUrlsFromApi = async (issuenumber: string, edgeId: number) => {
    const photo = (
      await call(
        api().dmApi,
        new GET__edgecreator__model__$modelId__photo__main({
          params: {
            modelId: String(edgeId),
          },
        })
      )
    ).data;
    if (photo) {
      mainStore.photoUrls[issuenumber] = photo.fileName;
    }
  };

  return {
    getDimensionsFromSvg,
    getStepsFromSvg,
    setPhotoUrlsFromSvg,
    setContributorsFromSvg,
    getDimensionsFromApi,
    getStepsFromApi,
    setContributorsFromApi,
    loadModel,
    setPhotoUrlsFromApi,
  };
};
