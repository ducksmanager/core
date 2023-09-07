"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePublicationcode = void 0;
exports.computePublicationcode = {
    publicationcode: {
        needs: {
            country: true,
            magazine: true,
        },
        compute: ({ country, magazine, }) => `${country}/${magazine}`,
    },
};
