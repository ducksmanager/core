"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../prisma");
const dm_edge_timestamp_1 = require("./dm.edge.timestamp");
const dm_publicationcode_1 = require("./dm.publicationcode");
exports.default = prisma_1.prismaDm.$extends({
    result: {
        issue: dm_publicationcode_1.computePublicationcode,
        subscription: dm_publicationcode_1.computePublicationcode,
        edge: dm_edge_timestamp_1.computeTimestamp,
    },
});
