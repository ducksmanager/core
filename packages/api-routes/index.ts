// noinspection ES6PreferShortImport

import { ContractWithMethodAndUrl } from "~axios-helper";
import { AuthorsDetails } from "~dm-types/AuthorsDetails";
import { AuthorWithUserRating } from "~dm-types/AuthorWithUserRating";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { BookcaseEdge } from "~dm-types/BookcaseEdge";
import { CollectionUpdateMultipleIssues,CollectionUpdateSingleIssue } from "~dm-types/CollectionUpdate";
import { CoverSearchResults } from "~dm-types/CoverSearchResults";
import { EdgeModel } from "~dm-types/EdgeModel";
import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import { EditSubscription } from "~dm-types/EditSubscription";
import { Event } from "~dm-types/Event";
import { ImageElement } from "~dm-types/ImageElement";
import { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import {  } from "~dm-types/IssueSuggestionList";
import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import { MedalPoints } from "~dm-types/MedalPoints";
import { ModelSteps } from "~dm-types/ModelSteps";
import { PublicationTitles } from "~dm-types/PublicationTitles";
import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import { SimpleEntry } from "~dm-types/SimpleEntry";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { SimplePopularity } from "~dm-types/SimplePopularity";
import { SimpleUserWithQuickStats } from "~dm-types/SimpleUserWithQuickStats";
import { StorySearchResults } from "~dm-types/StorySearchResults";
import { SuggestionsWithDetails } from "~dm-types/SuggestionsWithDetails";
import { TransactionResults } from "~dm-types/TransactionResults";
import { UserForAccountForm } from "~dm-types/UserForAccountForm";
import { WantedEdge } from "~dm-types/WantedEdge";
import { inducks_issue, inducks_issuequotation } from "~prisma-clients/client_coa";
import { bookstoreComment, edge, issue, purchase, requestedIssue, subscription,user, userOptionType, userPermission } from "~prisma-clients/client_dm";
import { edgeContributor, edgeModel,elementImage } from "~prisma-clients/client_edgecreator";

export class GET__bookstores  extends ContractWithMethodAndUrl<{ resBody: SimpleBookstore[] }> {
            static readonly method = "get";
            static readonly url = "/bookstores";
        }
export class PUT__bookstores  extends ContractWithMethodAndUrl<{
      resBody: bookstoreComment;
      reqBody: { id?: string; bookstore: SimpleBookstore };
    }> {
            static readonly method = "put";
            static readonly url = "/bookstores";
        }
export class GET__csrf  extends ContractWithMethodAndUrl<{ resBody: { csrfToken: string } }> {
            static readonly method = "get";
            static readonly url = "/csrf";
        }
export class POST__demo  extends ContractWithMethodAndUrl<{ resBody: { token: string } }> {
            static readonly method = "post";
            static readonly url = "/demo";
        }
export class GET__events  extends ContractWithMethodAndUrl<{ resBody: Event[] }> {
            static readonly method = "get";
            static readonly url = "/events";
        }
export class POST__feedback  extends ContractWithMethodAndUrl<{
      reqBody: {
        feedback: string;
      };
    }> {
            static readonly method = "post";
            static readonly url = "/feedback";
        }
export class POST__login  extends ContractWithMethodAndUrl<{
      resBody: { token: string };
      reqBody: { username: string; password: string };
    }> {
            static readonly method = "post";
            static readonly url = "/login";
        }
export class POST__auth__change_password  extends ContractWithMethodAndUrl<{
      resBody: { token: string };
      reqBody: { password: string; password2: string; token: string };
    }> {
            static readonly method = "post";
            static readonly url = "/auth/change-password";
        }
export class GET__auth__forgot  extends ContractWithMethodAndUrl<{ query: { token: string } }> {
            static readonly method = "get";
            static readonly url = "/auth/forgot";
        }
export class POST__auth__forgot  extends ContractWithMethodAndUrl<{
      resBody: { token: string };
      reqBody: { email: string };
    }> {
            static readonly method = "post";
            static readonly url = "/auth/forgot";
        }
export class POST__bookcase__options  extends ContractWithMethodAndUrl<{
      resBody: { status: string };
      reqBody: {
        textures: { bookcase: string; bookshelf: string };
        showAllCopies: boolean;
      };
    }> {
            static readonly method = "post";
            static readonly url = "/bookcase/options";
        }
export class POST__bookcase__sort  extends ContractWithMethodAndUrl<{
      resBody: { max: number } | undefined;
      reqBody: { sorts: string[] };
    }> {
            static readonly method = "post";
            static readonly url = "/bookcase/sort";
        }
export class POST__bookstores__approve  extends ContractWithMethodAndUrl<{ reqBody: { id: number } }> {
            static readonly method = "post";
            static readonly url = "/bookstores/approve";
        }
export class POST__collection__empty  extends ContractWithMethodAndUrl<Record<string, never>> {
            static readonly method = "post";
            static readonly url = "/collection/empty";
        }
export class GET__collection__issues  extends ContractWithMethodAndUrl<{ resBody: issue[] }> {
            static readonly method = "get";
            static readonly url = "/collection/issues";
        }
export class POST__collection__lastvisit  extends ContractWithMethodAndUrl<{ resBody: { previousVisit: Date | null } }> {
            static readonly method = "post";
            static readonly url = "/collection/lastvisit";
        }
export class GET__collection__notification_token  extends ContractWithMethodAndUrl<{
    resBody: { token: string };
    query: { user_id: string };
  }> {
            static readonly method = "get";
            static readonly url = "/collection/notification_token";
        }
export class GET__collection__on_sale_by_others  extends ContractWithMethodAndUrl<{
    resBody: Record<string, IssueWithPublicationcode[]>;
  }> {
            static readonly method = "get";
            static readonly url = "/collection/on-sale-by-others";
        }
export class GET__collection__points  extends ContractWithMethodAndUrl<{ resBody: MedalPoints }> {
            static readonly method = "get";
            static readonly url = "/collection/points";
        }
export class GET__collection__popular  extends ContractWithMethodAndUrl<{ resBody: SimplePopularity[] }> {
            static readonly method = "get";
            static readonly url = "/collection/popular";
        }
export class GET__collection__purchases  extends ContractWithMethodAndUrl<{
    resBody: (Omit<purchase, "date"> & {
      date: string;
    })[];
  }> {
            static readonly method = "get";
            static readonly url = "/collection/purchases";
        }
export class PUT__collection__purchases  extends ContractWithMethodAndUrl<{
      reqBody: { date: string; description: string };
    }> {
            static readonly method = "put";
            static readonly url = "/collection/purchases";
        }
export class GET__collection__subscriptions  extends ContractWithMethodAndUrl<{
    resBody: (Omit<subscription, "startDate" | "endDate"> & {
      publicationcode: string;
      startDate: string;
      endDate: string;
    })[];
  }> {
            static readonly method = "get";
            static readonly url = "/collection/subscriptions";
        }
export class PUT__collection__subscriptions  extends ContractWithMethodAndUrl<{ reqBody: { subscription: EditSubscription } }> {
            static readonly method = "put";
            static readonly url = "/collection/subscriptions";
        }
export class GET__collection__user_privileges  extends ContractWithMethodAndUrl<{ resBody: userPermission[] }> {
            static readonly method = "get";
            static readonly url = "/collection/user-privileges";
        }
export class DELETE__collection__user  extends ContractWithMethodAndUrl<Record<string, never>> {
            static readonly method = "delete";
            static readonly url = "/collection/user";
        }
export class GET__collection__user  extends ContractWithMethodAndUrl<{ resBody: Omit<user, "password"> }> {
            static readonly method = "get";
            static readonly url = "/collection/user";
        }
export class POST__collection__user  extends ContractWithMethodAndUrl<{
      resBody: {
        hasRequestedPresentationSentenceUpdate: boolean;
      };
      reqBody: UserForAccountForm;
    }> {
            static readonly method = "post";
            static readonly url = "/collection/user";
        }
export class PUT__collection__user  extends ContractWithMethodAndUrl<{
      resBody: { token: string };
      reqBody: {
        username: string;
        password: string;
        email: string;
      } & Record<string, unknown>;
    }> {
            static readonly method = "put";
            static readonly url = "/collection/user";
        }
export class POST__cover_id__search  extends ContractWithMethodAndUrl<{
      reqBody: { base64: string };
      resBody: CoverSearchResults;
    }> {
            static readonly method = "post";
            static readonly url = "/cover-id/search";
        }
export class PUT__edgecreator__edgesprites  extends ContractWithMethodAndUrl<Record<string, never>> {
            static readonly method = "put";
            static readonly url = "/edgecreator/edgesprites";
        }
export class GET__edgecreator__model  extends ContractWithMethodAndUrl<{ resBody: EdgeModel[] }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model";
        }
export class PUT__edgecreator__multiple_edge_photo  extends ContractWithMethodAndUrl<{
      resBody: {
        photo: { id: number };
      };
      reqBody: {
        hash: string;
        filename: string;
      };
    }> {
            static readonly method = "put";
            static readonly url = "/edgecreator/multiple-edge-photo";
        }
export class PUT__edgecreator__submit  extends ContractWithMethodAndUrl<{
      resBody: {
        edgeModel: { url: string };
      };
      reqBody: {
        publicationcode: string;
        issuenumber: string;
      };
    }> {
            static readonly method = "put";
            static readonly url = "/edgecreator/submit";
        }
export class GET__status__db  extends ContractWithMethodAndUrl<{ resBody: { status: string } }> {
            static readonly method = "get";
            static readonly url = "/status/db";
        }
export class GET__status__pastec  extends ContractWithMethodAndUrl<{ resBody: { status: string | number } }> {
            static readonly method = "get";
            static readonly url = "/status/pastec";
        }
export class GET__status__pastecsearch  extends ContractWithMethodAndUrl<{ resBody: { status: string | number } }> {
            static readonly method = "get";
            static readonly url = "/status/pastecsearch";
        }
export class GET__bookcase__$username  extends ContractWithMethodAndUrl<{
    resBody: BookcaseEdge[];
    params: { username: string };
  }> {
            static readonly method = "get";
            static readonly url = "/bookcase/:username";
        }
export class POST__coa__issues__decompose  extends ContractWithMethodAndUrl<{
      resBody: Record<string, inducks_issue>;
      reqBody: { issueCodes: string };
    }> {
            static readonly method = "post";
            static readonly url = "/coa/issues/decompose";
        }
export class POST__coa__list__publications  extends ContractWithMethodAndUrl<{
      resBody: PublicationTitles;
      reqBody: { publicationCodes: string[] };
    }> {
            static readonly method = "post";
            static readonly url = "/coa/list/publications";
        }
export class GET__coa__quotations__issueCodes  extends ContractWithMethodAndUrl<{
    resBody: inducks_issuequotation[];
    query: { issueCodes: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/quotations/issueCodes";
        }
export class GET__coa__quotations__publications  extends ContractWithMethodAndUrl<{
    resBody: inducks_issuequotation[];
    query: { publicationCodes: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/quotations/publications";
        }
export class POST__coa__stories__search  extends ContractWithMethodAndUrl<{
      resBody: { results: StorySearchResults };
      reqBody: { keywords: string };
    }> {
            static readonly method = "post";
            static readonly url = "/coa/stories/search";
        }
export class DELETE__collection__authors__watched  extends ContractWithMethodAndUrl<{ reqBody: { personcode: string } }> {
            static readonly method = "delete";
            static readonly url = "/collection/authors/watched";
        }
export class GET__collection__authors__watched  extends ContractWithMethodAndUrl<{ resBody: AuthorWithUserRating[] }> {
            static readonly method = "get";
            static readonly url = "/collection/authors/watched";
        }
export class POST__collection__authors__watched  extends ContractWithMethodAndUrl<{
      reqBody: { personcode: string; notation: number };
    }> {
            static readonly method = "post";
            static readonly url = "/collection/authors/watched";
        }
export class PUT__collection__authors__watched  extends ContractWithMethodAndUrl<{ reqBody: { personcode: string } }> {
            static readonly method = "put";
            static readonly url = "/collection/authors/watched";
        }
export class GET__collection__edges__lastPublished  extends ContractWithMethodAndUrl<{ resBody: EdgeWithStringCreationDate[] }> {
            static readonly method = "get";
            static readonly url = "/collection/edges/lastPublished";
        }
export class POST__collection__issues__multiple  extends ContractWithMethodAndUrl<{
      resBody: TransactionResults;
      reqBody: CollectionUpdateMultipleIssues;
    }> {
            static readonly method = "post";
            static readonly url = "/collection/issues/multiple";
        }
export class POST__collection__issues__single  extends ContractWithMethodAndUrl<{
      resBody: TransactionResults;
      reqBody: CollectionUpdateSingleIssue;
    }> {
            static readonly method = "post";
            static readonly url = "/collection/issues/single";
        }
export class DELETE__collection__on_sale_by_others__requests  extends ContractWithMethodAndUrl<{ reqBody: { issueId: number } }> {
            static readonly method = "delete";
            static readonly url = "/collection/on-sale-by-others/requests";
        }
export class PUT__collection__on_sale_by_others__requests  extends ContractWithMethodAndUrl<{ reqBody: { issueIds: number[] } }> {
            static readonly method = "put";
            static readonly url = "/collection/on-sale-by-others/requests";
        }
export class GET__collection__stats__watchedauthorsstorycount  extends ContractWithMethodAndUrl<{ resBody: AuthorsDetails }> {
            static readonly method = "get";
            static readonly url = "/collection/stats/watchedauthorsstorycount";
        }
export class GET__collection_public__$username  extends ContractWithMethodAndUrl<{ params: { username: string }, resBody: issue[] }> {
            static readonly method = "get";
            static readonly url = "/collection-public/:username";
        }
export class GET__edgecreator__multiple_edge_photo__check_today_limit  extends ContractWithMethodAndUrl<{
      resBody: {
        uploadedFilesToday: string[];
      };
    }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/multiple-edge-photo/check-today-limit";
        }
export class PUT__edgecreator__multiple_edge_photo__v2  extends ContractWithMethodAndUrl<{
      resBody: {
        edgeModel: { url: string };
      };
      reqBody: {
        publicationcode: string;
        issuenumber: string;
      };
    }> {
            static readonly method = "put";
            static readonly url = "/edgecreator/multiple-edge-photo/v2";
        }
export class GET__edges__published__data  extends ContractWithMethodAndUrl<{
    resBody: Pick<edge, "publicationcode" | "issuenumber">[];
  }> {
            static readonly method = "get";
            static readonly url = "/edges/published/data";
        }
export class GET__edges__wanted__data  extends ContractWithMethodAndUrl<{ resBody: WantedEdge[] }> {
            static readonly method = "get";
            static readonly url = "/edges/wanted/data";
        }
export class GET__global_stats__bookcase__contributors  extends ContractWithMethodAndUrl<{ resBody: BookcaseContributor[] }> {
            static readonly method = "get";
            static readonly url = "/global-stats/bookcase/contributors";
        }
export class GET__global_stats__user__count  extends ContractWithMethodAndUrl<{ resBody: { count: number } }> {
            static readonly method = "get";
            static readonly url = "/global-stats/user/count";
        }
export class GET__global_stats__user__list  extends ContractWithMethodAndUrl<{ resBody: Pick<user, "id" | "username">[] }> {
            static readonly method = "get";
            static readonly url = "/global-stats/user/list";
        }
export class POST__presentation_text__$decision  extends ContractWithMethodAndUrl<{
      params: { decision: string };
      reqBody: { sentence: string; userId: string };
    }> {
            static readonly method = "post";
            static readonly url = "/presentation-text/:decision";
        }
export class GET__bookcase__$username__options  extends ContractWithMethodAndUrl<{
    resBody: {
      textures: {
        bookcase: string;
        bookshelf: string;
      };
      showAllCopies: boolean;
    };
    params: { username: string };
  }> {
            static readonly method = "get";
            static readonly url = "/bookcase/:username/options";
        }
export class GET__bookcase__$username__sort  extends ContractWithMethodAndUrl<{
    resBody: string[];
    params: { username: string };
  }> {
            static readonly method = "get";
            static readonly url = "/bookcase/:username/sort";
        }
export class GET__coa__authorsfullnames__$authors  extends ContractWithMethodAndUrl<{
    resBody: { [_personcode: string]: string };
    params: { authors: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/authorsfullnames/:authors";
        }
export class GET__coa__list__issues__by_publication_codes  extends ContractWithMethodAndUrl<{
    resBody: SimpleIssue[];
    query: { publicationCodes: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/by-publication-codes";
        }
export class GET__coa__list__issues__by_storycode  extends ContractWithMethodAndUrl<{
    resBody: SimpleIssue[];
    query: { storycode: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/by-storycode";
        }
export class GET__coa__list__issues__count  extends ContractWithMethodAndUrl<{ resBody: Record<string, number> }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/count";
        }
export class GET__coa__list__issues__details  extends ContractWithMethodAndUrl<{
    resBody: {
      releaseDate: string;
      entries: SimpleEntry[];
    };
    query: { publicationcode: string; issuenumber: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/details";
        }
export class GET__coa__list__issues__recent  extends ContractWithMethodAndUrl<{ resBody: inducks_issue[] }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/recent";
        }
export class GET__coa__list__issues__withDetails  extends ContractWithMethodAndUrl<{
    resBody: { [_issuenumber: string]: IssueCoverDetails[] };
    query: { publicationCodes: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/withDetails";
        }
export class GET__coa__list__issues__withTitle  extends ContractWithMethodAndUrl<{
    resBody: {
      issuenumber: string;
      title: string | null;
    }[];
    query: { publicationcode: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issues/withTitle";
        }
export class POST__coa__stories__search__withIssues  extends ContractWithMethodAndUrl<{
      resBody: StorySearchResults;
      reqBody: { keywords: string };
    }> {
            static readonly method = "post";
            static readonly url = "/coa/stories/search/withIssues";
        }
export class GET__collection__options__$optionName  extends ContractWithMethodAndUrl<{
    resBody: string[];
    params: { optionName: userOptionType };
  }> {
            static readonly method = "get";
            static readonly url = "/collection/options/:optionName";
        }
export class POST__collection__options__$optionName  extends ContractWithMethodAndUrl<{
      params: { optionName: string };
      reqBody: { values: string[] };
    }> {
            static readonly method = "post";
            static readonly url = "/collection/options/:optionName";
        }
export class DELETE__collection__purchases__$id  extends ContractWithMethodAndUrl<{ params: { id: string } }> {
            static readonly method = "delete";
            static readonly url = "/collection/purchases/:id";
        }
export class DELETE__collection__subscriptions__$id  extends ContractWithMethodAndUrl<{ params: { id: string } }> {
            static readonly method = "delete";
            static readonly url = "/collection/subscriptions/:id";
        }
export class POST__collection__subscriptions__$id  extends ContractWithMethodAndUrl<{
      params: { id: string };
      reqBody: { subscription: EditSubscription };
    }> {
            static readonly method = "post";
            static readonly url = "/collection/subscriptions/:id";
        }
export class GET__cover_id__download__$coverId  extends ContractWithMethodAndUrl<{ params: { coverId: string } }> {
            static readonly method = "get";
            static readonly url = "/cover-id/download/:coverId";
        }
export class GET__edgecreator__contributors__$modelId  extends ContractWithMethodAndUrl<{
    resBody: edgeContributor[];
    params: { modelId: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/contributors/:modelId";
        }
export class GET__edgecreator__model__editedbyother__all  extends ContractWithMethodAndUrl<{ resBody: EdgeModel[] }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model/editedbyother/all";
        }
export class GET__edgecreator__model__unassigned__all  extends ContractWithMethodAndUrl<{ resBody: EdgeModel[] }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model/unassigned/all";
        }
export class GET__global_stats__user__$userIds  extends ContractWithMethodAndUrl<{
    resBody: {
      points: MedalPoints;
      stats: SimpleUserWithQuickStats[];
    };
    params: { userIds: string };
  }> {
            static readonly method = "get";
            static readonly url = "/global-stats/user/:userIds";
        }
export class GET__global_stats__user__collection__rarity  extends ContractWithMethodAndUrl<{
    resBody: {
      userScores: { userId: number; averageRarity: number }[];
      myScore: number;
    };
  }> {
            static readonly method = "get";
            static readonly url = "/global-stats/user/collection/rarity";
        }
export class GET__coa__authorsfullnames__search__$partialAuthorName  extends ContractWithMethodAndUrl<{
    resBody: { [_personcode: string]: string };
    params: { partialAuthorName: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/authorsfullnames/search/:partialAuthorName";
        }
export class GET__coa__list__countries__$locale  extends ContractWithMethodAndUrl<{
    resBody: { [_countrycode: string]: string };
    params: { locale: string };
    query: { countryCodes: string | null };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/countries/:locale";
        }
export class GET__coa__list__issuesbycodes__$issueCodes  extends ContractWithMethodAndUrl<{
    resBody: Record<string, SimpleIssueWithPublication>;
    params: { issueCodes: string };
  }> {
            static readonly method = "get";
            static readonly url = "/coa/list/issuesbycodes/:issueCodes";
        }
export class GET__coa__list__publications__$countrycode  extends ContractWithMethodAndUrl<{
      resBody: PublicationTitles;
      params: { countrycode: string };
    }> {
            static readonly method = "get";
            static readonly url = "/coa/list/publications/:countrycode";
        }
export class GET__collection__on_sale_by_others__contact_methods__$sellerId  extends ContractWithMethodAndUrl<{
    resBody: {
      [_contactMethod: string]: string | number;
    };
    params: { sellerId: string };
  }> {
            static readonly method = "get";
            static readonly url = "/collection/on-sale-by-others/contact-methods/:sellerId";
        }
export class GET__edgecreator__elements__images__$filename  extends ContractWithMethodAndUrl<{
    resBody: ImageElement[];
    params: { filename: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/elements/images/:filename";
        }
export class GET__edgecreator__model__$modelIds__steps  extends ContractWithMethodAndUrl<{
    resBody: ModelSteps;
    params: { modelIds: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model/:modelIds/steps";
        }
export class GET__edgecreator__multiple_edge_photo__hash__$hash  extends ContractWithMethodAndUrl<{
    resBody: elementImage;
    params: { hash: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/multiple-edge-photo/hash/:hash";
        }
export class GET__collection__on_sale_by_others__requests__as__$as  extends ContractWithMethodAndUrl<{
    resBody: requestedIssue[];
    params: { as: "buyer" | "seller" };
  }> {
            static readonly method = "get";
            static readonly url = "/collection/on-sale-by-others/requests/as/:as";
        }
export class GET__edgecreator__model__$modelId__photo__main  extends ContractWithMethodAndUrl<{
    resBody: Pick<elementImage, "id" | "fileName">;
    params: { modelId: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model/:modelId/photo/main";
        }
export class GET__edges__$countrycode__$magazinecode__$issuenumbers  extends ContractWithMethodAndUrl<{
    resBody: Record<string, EdgeWithModelId>;
    params: {
      countrycode: string;
      magazinecode: string;
      issuenumbers?: string;
    };
  }> {
            static readonly method = "get";
            static readonly url = "/edges/:countrycode/:magazinecode/:issuenumbers";
        }
export class GET__edgecreator__model__$countrycode__$magazinecode__$issuenumber  extends ContractWithMethodAndUrl<{
    resBody: edgeModel;
    params: { countrycode: string; magazinecode: string; issuenumber: string };
  }> {
            static readonly method = "get";
            static readonly url = "/edgecreator/model/:countrycode/:magazinecode/:issuenumber";
        }
export class PUT__edgecreator__publish__$country__$magazine__$issuenumber  extends ContractWithMethodAndUrl<{
      resBody: {
        publicationcode: string;
        issuenumber: string;
        isNew: boolean;
        edgeId: number;
        contributors: number[];
        url: string;
      };
      params: { country: string; magazine: string; issuenumber: string };
      reqBody: { designers: string[]; photographers: string[] };
    }> {
            static readonly method = "put";
            static readonly url = "/edgecreator/publish/:country/:magazine/:issuenumber";
        }
export class GET__collection__stats__suggestedissues__$countrycode__$sincePreviousVisit__$sort__$limit  extends ContractWithMethodAndUrl<{
      resBody: SuggestionsWithDetails;
      params: {
        countrycode: string;
        sincePreviousVisit: "since_previous_visit" | "_";
        sort: "score" | "oldestdate";
        limit: string;
      };
    }> {
            static readonly method = "get";
            static readonly url = "/collection/stats/suggestedissues/:countrycode/:sincePreviousVisit/:sort/:limit";
        }