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
  const {
    edgeCreator: { events: edgeCreatorEvents },
  } = inject(dmSocketInjectionKey)!;

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
    svgChildNodes
      .filter(({ nodeName }) => nodeName === "g")
      .forEach((group, stepNumber) => {
        stepStore.setOptionValues(
          [
            {
              optionName: "component",
              optionValue: group.getAttribute("class")!,
            },
            ...optionObjectToArray(
              JSON.parse(
                group.getElementsByTagName("metadata")[0].textContent!,
              ) as Record<string, OptionValue>,
            ),
          ],
          {
            stepNumber,
            issuecodes: [issuecode],
          },
        );
      });
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
      const { component } = rendersStore.supportedRenders.find(
        (component) => component.originalName === originalComponentName,
      ) ?? { component: null };
      if (component) {
        try {
          stepStore.setOptionValues(
            optionObjectToArray(
              (await getOptionsFromDb(
                issuecode,
                stepNumber,
                {
                  component,
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
            `Invalid step ${originalStepNumber} (${component}) : ${
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

  const loadModel = async (issuecode: string, targetIssuecode: string) => {
    const onlyLoadStepsAndDimensions = issuecode !== targetIssuecode;

    const loadSvg = async (publishedVersion: boolean) => {
      const { svgElement, svgChildNodes } = await loadSvgFromString(
        issuecode,
        new Date().toISOString(),
        publishedVersion,
      );

      loadDimensionsFromSvg(issuecode, svgElement);
      loadStepsFromSvg(issuecode, svgChildNodes);
      if (!onlyLoadStepsAndDimensions) {
        setPhotoUrlsFromSvg(issuecode, svgChildNodes);
        setContributorsFromSvg(issuecode, svgChildNodes);
      }
    };

    try {
      await loadSvg(false);
    } catch (_e) {
      try {
        await loadSvg(true);
      } catch (_e) {
        const edge = (await edgeCreatorEvents.getModel(issuecode))!;
        await edgeCatalogStore.loadPublishedEdgesSteps({
          edgeModelIds: [edge.id],
        });
        const apiSteps = edgeCatalogStore.publishedEdgesSteps[issuecode];
        loadDimensionsFromApi(issuecode, apiSteps);
        await loadStepsFromApi(issuecode, apiSteps, true, (error: string) =>
          mainStore.addWarning(error),
        );

        if (!onlyLoadStepsAndDimensions) {
          await setPhotoUrlsFromApi(issuecode, edge.id);
          await setContributorsFromApi(issuecode, edge.id);
        }
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
  };
};
