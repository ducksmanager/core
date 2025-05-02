import { edgeCatalog } from "~/stores/edgeCatalog";
import { main } from "~/stores/main";
import { renders } from "~/stores/renders";
import { optionObjectToArray, step } from "~/stores/step";
import type { EdgeDimensions } from "~/types/EdgeDimensions";
import type { LegacyComponent } from "~/types/LegacyComponent";
import type { OptionNameAndValue } from "~/types/OptionNameAndValue";
import type { OptionValue } from "~/types/OptionValue";
import type { StepOptions } from "~/types/StepOptions";
import { stores as webStores } from "~web";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

export default () => {
  const { getSvgMetadata, loadSvgFromString } = useSvgUtils();

  const { getOptionsFromDb } = useLegacyDb();

  const mainStore = main();
  const stepStore = step();
  const rendersStore = renders();
  const userStore = webStores.users();
  const edgeCatalogStore = edgeCatalog();
  const { edgeCreator: edgeCreatorEvents } = inject(dmSocketInjectionKey)!;

  const loadDimensionsFromSvg = (issuecode: string, svgElement: SVGElement) => {
    stepStore.setDimensions(
      {
        width: parseInt(svgElement.getAttribute("width")!) / 1.5,
        height: parseInt(svgElement.getAttribute("height")!) / 1.5,
      },
      { issuecodes: [issuecode] },
    );
  };
  const loadStepsFromSvg = (issuecode: string, svgChildNodes: SVGElement[]) => {
    stepStore.overwriteSteps(
      issuecode,
      svgChildNodes
        .filter(({ nodeName }) => nodeName === "g")
        .filter((group, stepNumber) => {
          const metadata = group.getElementsByTagName("metadata");
          if (!metadata.length) {
            console.warn("No metadata found for step", stepNumber);
            return false;
          }
          return true;
        })
        .flatMap((group, stepNumber) => [
          {
            optionName: "component",
            optionValue: group.getAttribute("class")!,
            stepNumber,
            issuecode,
          },
          ...optionObjectToArray(
            JSON.parse(
              group.getElementsByTagName("metadata")[0].textContent!,
            ) as Record<string, OptionValue>,
          ).map(({ optionName, optionValue }) => ({
            optionName,
            optionValue,
            stepNumber,
            issuecode,
          })),
        ]),
    );
  };

  const setPhotoUrlsFromSvg = (
    issuecode: string,
    svgChildNodes: SVGElement[],
  ) => {
    for (const photoUrl of getSvgMetadata(svgChildNodes, "photo")) {
      mainStore.photoUrls[issuecode] = photoUrl;
    }
  };

  const setContributorsFromSvg = (
    issuecode: string,
    svgChildNodes: SVGElement[],
  ) => {
    for (const contributionType of ["photographer", "designer"]) {
      for (const username of getSvgMetadata(
        svgChildNodes,
        `contributor-${contributionType}`,
      )) {
        mainStore.addContributor({
          issuecode,
          contributionType:
            contributionType === "designer" ? "createur" : "photographe",
          user: userStore.allUsers!.find((user) => user.username === username)!,
        });
      }
    }
  };

  const loadDimensionsFromApi = (
    issuecode: string,
    stepData: Record<
      string,
      {
        issuecode: string;
        stepNumber: number;
        functionName: string;
        options: StepOptions;
      }
    >,
  ) => {
    const defaultDimensions: EdgeDimensions = { width: 15, height: 200 };
    const dimensions = Object.values(stepData).find(
      ({ stepNumber: originalStepNumber, issuecode: currentIssuecode }) =>
        issuecode === currentIssuecode && originalStepNumber === -1,
    )?.options;

    const dimensionsToLoad = {
      width: dimensions
        ? parseInt(dimensions.Dimension_x as string)
        : defaultDimensions.width,
      height: dimensions
        ? parseInt(dimensions.Dimension_y as string)
        : defaultDimensions.height,
    };
    stepStore.setDimensions(dimensionsToLoad, { issuecodes: [issuecode] });
  };
  const loadStepsFromApi = async (
    issuecode: string,
    apiSteps: Record<
      string,
      {
        stepNumber: number;
        functionName: string;
        options: StepOptions;
      }
    >,
    calculateBase64: boolean,
    onError: (error: string, stepNumber: number) => void,
  ): Promise<OptionNameAndValue[][]> => {
    const dimensions = stepStore.getFilteredDimensions({
      issuecodes: [issuecode],
    });
    if (!dimensions.length) {
      throw new Error("No dimensions");
    }
    const steps: OptionNameAndValue[][] = [];
    let stepNumber = 0;
    for (const {
      stepNumber: originalStepNumber,
      functionName: originalComponentName,
      options: originalOptions,
    } of Object.values(apiSteps).filter(
      ({ stepNumber: originalStepNumber }) => originalStepNumber !== -1,
    )) {
      const componentName = Object.keys(rendersStore.supportedRenders).find(
        (componentName) => {
          const component =
            rendersStore.supportedRenders[
              componentName as keyof typeof rendersStore.supportedRenders
            ];
          return (
            "originalName" in component &&
            originalComponentName === component.originalName
          );
        },
      );
      if (componentName) {
        try {
          stepStore.setOptionValues(
            optionObjectToArray(
              (await getOptionsFromDb(
                issuecode,
                stepNumber,
                {
                  component: componentName,
                  options: originalOptions,
                } as LegacyComponent,
                dimensions[0],
                calculateBase64,
              ))!,
            ),
            {
              issuecodes: [issuecode],
              stepNumber: stepNumber++,
            },
          );
        } catch (e) {
          onError(
            `Invalid step ${originalStepNumber} (${componentName}) : ${
              e as string
            }, step will be ignored.`,
            originalStepNumber,
          );
        }
      } else {
        onError(
          `Unrecognized step name : ${originalComponentName}, step will be ignored.`,
          originalStepNumber,
        );
      }
    }
    return steps;
  };
  const setContributorsFromApi = async (issuecode: string, edgeId: number) => {
    const contributors = await edgeCreatorEvents.getModelContributors(edgeId);
    for (const { contribution, userId } of contributors) {
      mainStore.addContributor({
        issuecode,
        contributionType: contribution,
        user: userStore.allUsers!.find((user) => user.id === userId)!,
      });
    }
  };

  const overwriteModel = (
    targetIssuecode: string,
    {
      svgElement,
      svgChildNodes,
    }: Awaited<ReturnType<typeof loadSvgFromString>>,
  ) => {
    loadDimensionsFromSvg(targetIssuecode, svgElement);
    loadStepsFromSvg(targetIssuecode, svgChildNodes);
    setPhotoUrlsFromSvg(targetIssuecode, svgChildNodes);
    setContributorsFromSvg(targetIssuecode, svgChildNodes);
  };

  const logModelLoadError = (e: unknown) => {
    if (typeof e === "object" && e !== null && "name" in e && "message" in e) {
      console.warn(e.message);
    } else {
      console.warn(e);
    }
  };

  const loadModel = async (issuecode: string) => {
    try {
      console.log("Loading non-published version of", issuecode);
      overwriteModel(issuecode, await loadSvgFromString(issuecode, false));
    } catch (e) {
      logModelLoadError(e);
      try {
        console.log("Loading published version of", issuecode);
        overwriteModel(issuecode, await loadSvgFromString(issuecode, true));
      } catch (e) {
        logModelLoadError(e);
        const edge = (await edgeCreatorEvents.getModel(issuecode))!;
        await edgeCatalogStore.loadPublishedEdgesSteps([edge.id]);
        const apiSteps = edgeCatalogStore.publishedEdgesSteps[issuecode];
        loadDimensionsFromApi(issuecode, apiSteps);
        await loadStepsFromApi(issuecode, apiSteps, true, (error: string) =>
          mainStore.addWarning(error),
        );

        await setPhotoUrlsFromApi(issuecode, edge.id);
        await setContributorsFromApi(issuecode, edge.id);
      }
    }

    if (!stepStore.options.length) {
      throw new Error(`No model found for issue ${issuecode}`);
    }
  };

  const setPhotoUrlsFromApi = async (issuecode: string, edgeId: number) => {
    const photo = await edgeCreatorEvents.getModelMainPhoto(edgeId);
    mainStore.photoUrls[issuecode] = photo.fileName;
  };

  return {
    loadDimensionsFromSvg,
    loadStepsFromSvg,
    setPhotoUrlsFromSvg,
    setContributorsFromSvg,
    loadDimensionsFromApi,
    loadStepsFromApi,
    setContributorsFromApi,
    loadModel,
    setPhotoUrlsFromApi,
    overwriteModel,
  };
};
