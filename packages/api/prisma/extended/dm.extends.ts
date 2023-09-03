import { prismaDm } from "../../prisma";
import { computeTimestamp } from "./dm.edge.timestamp";
import { computePublicationcode } from "./dm.publicationcode";

export default prismaDm.$extends({
  result: {
    issue: computePublicationcode,
    subscription: computePublicationcode,
    edge: computeTimestamp,
  },
});
