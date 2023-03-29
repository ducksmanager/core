import usePermissions from "~/composables/usePermissions";
import { api } from "~/stores/api";
import { coa } from "~/stores/coa";
import { collection } from "~/stores/collection";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { users } from "~/stores/users";
import { call } from "~/util/axios";
import { EdgeModel } from "~dm_types/EdgeModel";
import {
  GET__edgecreator__model,
  GET__edgecreator__model__editedbyother__all,
  GET__edgecreator__model__unassigned__all,
} from "~dm_types/routes";
import { GET__fs__browseEdges } from "~types/routes";

const { getSvgMetadata, loadSvgFromString } = useSvgUtils();

const edgeCatalogStore = edgeCatalog();

type Edge = {
  country: string;
  magazine: string;
  issuenumber: string;
  designers: string[];
  photographers: string[];
};

export type EdgeWithVersionAndStatus = Edge & {
  status: string | null;
  v3: boolean;
  published?: string | null;
};

const isCatalogLoaded = ref(false);

export default () => {
  const edgeCategories = [
    {
      status: "ongoing",
      l10n: "Ongoing edges",
      apiCall: GET__edgecreator__model,
      svgCheckFn: (edge: Edge, currentUser: string) =>
        edge.designers.includes(currentUser),
    },
    {
      status: "ongoing by another user",
      l10n: "Ongoing edges handled by other users",
      apiCall: GET__edgecreator__model__editedbyother__all,
      svgCheckFn: (edge: Edge) => edge.designers.length,
    },
    {
      status: "pending",
      l10n: "Pending edges",
      apiCall: GET__edgecreator__model__unassigned__all,
      svgCheckFn: () => true,
    },
  ];

  const edgesByStatus = computed(() => {
    const edgesByStatus: {
      [status: string]: {
        [publicationcode: string]: EdgeWithVersionAndStatus[];
      };
    } = Object.values(edgeCategories).reduce(
      (acc, { status }) => ({
        ...acc,
        [status]: {},
      }),
      {}
    );
    if (!edgeCatalogStore.currentEdges) {
      return edgesByStatus;
    }
    return Object.values(edgeCatalogStore.currentEdges).reduce(
      (acc: typeof edgesByStatus, edge) => {
        const publicationcode = `${edge.country}/${edge.magazine}`;
        if (!acc[edge.status!][publicationcode]) {
          acc[edge.status!][publicationcode] = [];
        }
        acc[edge.status!][publicationcode].push(edge);
        return acc;
      },
      edgesByStatus
    );
  });

  const getEdgeFromApi = (
    { country, magazine, issuenumber, contributors, photos }: EdgeModel,
    status: string
  ) => {
    const issuecode = `${country}/${magazine} ${issuenumber}`;
    const getContributorsOfType = (contributionType: string) =>
      (contributors || [])
        .filter(({ contribution }) => contribution === contributionType)
        .map(
          ({ userId }) =>
            users().allUsers!.find(({ id }) => id === userId)!.username
        );
    const photo = photos?.find(({ isMainPhoto }) => isMainPhoto);
    return {
      country,
      magazine,
      issuenumber,
      issuecode,
      v3: false,
      designers: getContributorsOfType("createur"),
      photographers: getContributorsOfType("photographe"),
      photo: photo?.elementImage.fileName,
      status,
    };
  };

  const getEdgeFromSvg = (edge: Edge): EdgeWithVersionAndStatus => ({
    ...edge,
    v3: true,
    status: edgeCategories.reduce(
      (acc: string | null, { status, svgCheckFn }) =>
        acc || (svgCheckFn(edge, collection().user!.username!) ? status : null),
      null
    ),
  });

  const canEditEdge = (status: string) =>
    usePermissions().hasRole("Admin") || status !== "ongoing by another user";

  const getEdgeStatus = ({
    country,
    magazine,
    issuenumber,
  }: {
    country: string;
    magazine: string;
    issuenumber: string;
  }) => {
    let isPublished = false;
    const publicationcode = `${country}/${magazine}`;
    const publishedEdgesForPublication =
      edgeCatalogStore.publishedEdges[publicationcode] || {};
    if (publishedEdgesForPublication[issuenumber]) {
      isPublished = true;
    }
    const issuecode = `${publicationcode} ${issuenumber}`;

    return (
      edgeCatalogStore.currentEdges[issuecode] || {
        status: isPublished ? "Published" : "none",
      }
    ).status;
  };

  const loadCatalog = async (withDetails: boolean) => {
    if (isCatalogLoaded.value) {
      return;
    }

    let currentEdges: typeof edgeCatalogStore.currentEdges = {};
    const publishedSvgEdges: typeof edgeCatalogStore.publishedEdges = {};

    for (const { status, apiCall } of edgeCategories) {
      const data = (await call(api().dmApi, new apiCall())).data;
      currentEdges = data.reduce((acc, edgeData) => {
        const edge = getEdgeFromApi(edgeData, status);
        return { ...acc, [edge.issuecode]: edge };
      }, currentEdges);
    }

    const edges = (await call(api().edgeCreatorApi, new GET__fs__browseEdges()))
      .data;
    for (const edgeStatus in edges) {
      for (const fileName of edges[edgeStatus as "current" | "published"]) {
        const [, country, magazine, issuenumber] = fileName.match(
          /([^/]+)\/gen\/_?([^.]+)\.(.+).svg$/
        )!;
        // if ([country, magazine, issuenumber].includes(undefined)) {
        //   console.error(`Invalid SVG file name : ${fileName}`);
        //   continue;
        // }
        const publicationcode = `${country}/${magazine}`;
        const issuecode = `${publicationcode} ${issuenumber}`;
        try {
          if (edgeStatus === "published") {
            if (!publishedSvgEdges[publicationcode]) {
              publishedSvgEdges[publicationcode] = {};
            }
            publishedSvgEdges[publicationcode][issuenumber] = {
              issuenumber,
              v3: true,
            };
          } else if (withDetails) {
            const { svgChildNodes } = await loadSvgFromString(
              country,
              magazine,
              issuenumber,
              edgeStatus === "published"
            );
            const designers = getSvgMetadata(
              svgChildNodes,
              "contributor-designer"
            );
            const photographers = getSvgMetadata(
              svgChildNodes,
              "contributor-photographer"
            );

            currentEdges[issuecode] = getEdgeFromSvg({
              country,
              magazine,
              issuenumber,
              designers,
              photographers,
            });
          } else {
            currentEdges[issuecode] = getEdgeFromSvg({
              country,
              magazine,
              issuenumber,
              designers: [],
              photographers: [],
            });
          }
        } catch (e) {
          console.error(`No SVG found : ${country}/${magazine} ${issuenumber}`);
        }
      }
    }

    if (Object.keys(currentEdges).length) {
      await coa().fetchPublicationNames([
        ...new Set(
          Object.values(currentEdges).map(
            ({ country, magazine }) => `${country}/${magazine}`
          )
        ),
      ]);

      for (const edgeIssueCode of Object.keys(currentEdges)) {
        currentEdges[edgeIssueCode].published = getEdgeStatus(
          currentEdges[edgeIssueCode]
        );
      }

      edgeCatalogStore.addCurrentEdges(currentEdges);
    }

    edgeCatalogStore.addPublishedEdges(publishedSvgEdges);

    isCatalogLoaded.value = true;
  };

  return {
    edgesByStatus,
    edgeCategories,
    getEdgeFromApi,
    getEdgeFromSvg,
    canEditEdge,
    getEdgeStatus,
    loadCatalog,
    isCatalogLoaded,
  };
};
