"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTimestamp = void 0;
exports.computeTimestamp = {
    timestamp: {
        needs: {
            creationDate: true,
        },
        compute: ({ creationDate }) => creationDate.getTime() / 1000,
    },
};
