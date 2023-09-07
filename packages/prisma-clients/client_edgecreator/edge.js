
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
} = require('./runtime/edge')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.2.0
 * Query Engine version: 2804dc98259d2ea960602aca6b8e7fdc03c1758f
 */
Prisma.prismaVersion = {
  client: "5.2.0",
  engine: "2804dc98259d2ea960602aca6b8e7fdc03c1758f"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OptionIntervalScalarFieldEnum = {
  id: 'id',
  valueId: 'valueId',
  issueNumberStart: 'issueNumberStart',
  issueNumberEnd: 'issueNumberEnd',
  username: 'username'
};

exports.Prisma.EdgeModelOldScalarFieldEnum = {
  id: 'id',
  country: 'country',
  magazine: 'magazine',
  order: 'order',
  functionName: 'functionName',
  optionName: 'optionName'
};

exports.Prisma.OptionValueScalarFieldEnum = {
  id: 'id',
  optionId: 'optionId',
  value: 'value'
};

exports.Prisma.MyfontsImageScalarFieldEnum = {
  id: 'id',
  font: 'font',
  color: 'color',
  backgroundColor: 'backgroundColor',
  width: 'width',
  text: 'text',
  precision: 'precision'
};

exports.Prisma.ElementImageScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  hash: 'hash',
  createdAt: 'createdAt',
  fileName: 'fileName'
};

exports.Prisma.EdgeModelScalarFieldEnum = {
  id: 'id',
  country: 'country',
  magazine: 'magazine',
  issuenumber: 'issuenumber',
  username: 'username',
  mainPhotoName: 'mainPhotoName',
  photographs: 'photographs',
  creators: 'creators',
  isActive: 'isActive'
};

exports.Prisma.EdgeContributorScalarFieldEnum = {
  id: 'id',
  modelId: 'modelId',
  userId: 'userId',
  contribution: 'contribution'
};

exports.Prisma.EdgePhotoScalarFieldEnum = {
  id: 'id',
  modelId: 'modelId',
  photoId: 'photoId',
  isMainPhoto: 'isMainPhoto'
};

exports.Prisma.EdgeValueScalarFieldEnum = {
  id: 'id',
  order: 'order',
  renderName: 'renderName',
  optionName: 'optionName',
  optionValue: 'optionValue',
  modelId: 'modelId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.contribution = exports.$Enums.contribution = {
  photographe: 'photographe',
  createur: 'createur'
};

exports.Prisma.ModelName = {
  optionInterval: 'optionInterval',
  edgeModelOld: 'edgeModelOld',
  optionValue: 'optionValue',
  myfontsImage: 'myfontsImage',
  elementImage: 'elementImage',
  edgeModel: 'edgeModel',
  edgeContributor: 'edgeContributor',
  edgePhoto: 'edgePhoto',
  edgeValue: 'edgeValue'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/media/bruno/workspace/var/www/html/DucksManager/packages/api/dist/prisma/client_edgecreator",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      }
    ],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.2.0",
  "engineVersion": "2804dc98259d2ea960602aca6b8e7fdc03c1758f",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "mysql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL_EDGECREATOR",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICA9ICJwcmlzbWEtY2xpZW50LWpzIgogIG91dHB1dCAgICAgICAgPSAiLi4vZGlzdC9wcmlzbWEvY2xpZW50X2VkZ2VjcmVhdG9yIgogIGJpbmFyeVRhcmdldHMgPSBbIm5hdGl2ZSIsICJkZWJpYW4tb3BlbnNzbC0xLjEueCIsICJkZWJpYW4tb3BlbnNzbC0zLjAueCJdCn0KCmRhdGFzb3VyY2UgZGIgewogIHByb3ZpZGVyID0gIm15c3FsIgogIHVybCAgICAgID0gZW52KCJEQVRBQkFTRV9VUkxfRURHRUNSRUFUT1IiKQp9Cgptb2RlbCBvcHRpb25JbnRlcnZhbCB7CiAgaWQgICAgICAgICAgICAgICBJbnQgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHZhbHVlSWQgICAgICAgICAgSW50ICAgIEBtYXAoIklEX1ZhbGV1ciIpCiAgaXNzdWVOdW1iZXJTdGFydCBTdHJpbmcgQG1hcCgiTnVtZXJvX2RlYnV0IikgQGRiLlZhckNoYXIoMTApCiAgaXNzdWVOdW1iZXJFbmQgICBTdHJpbmcgQG1hcCgiTnVtZXJvX2ZpbiIpIEBkYi5WYXJDaGFyKDEwKQogIHVzZXJuYW1lICAgICAgICAgU3RyaW5nIEBkYi5WYXJDaGFyKDI1KQoKICBAQGluZGV4KFt2YWx1ZUlkLCBpc3N1ZU51bWJlclN0YXJ0LCBpc3N1ZU51bWJlckVuZCwgdXNlcm5hbWVdLCBtYXA6ICJpbmRleF9pbnRlcnZhbGxlcyIpCiAgQEBtYXAoImVkZ2VjcmVhdG9yX2ludGVydmFsbGVzIikKfQoKbW9kZWwgZWRnZU1vZGVsT2xkIHsKICBpZCAgICAgICAgICAgSW50ICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgY291bnRyeSAgICAgIFN0cmluZyAgQG1hcCgiUGF5cyIpIEBkYi5WYXJDaGFyKDMpCiAgbWFnYXppbmUgICAgIFN0cmluZyAgQG1hcCgiTWFnYXppbmUiKSBAZGIuVmFyQ2hhcig2KQogIG9yZGVyICAgICAgICBJbnQgICAgIEBtYXAoIk9yZHJlIikKICBmdW5jdGlvbk5hbWUgU3RyaW5nICBAbWFwKCJOb21fZm9uY3Rpb24iKSBAZGIuVmFyQ2hhcigzMCkKICBvcHRpb25OYW1lICAgU3RyaW5nPyBAbWFwKCJPcHRpb25fbm9tIikgQGRiLlZhckNoYXIoMjApCgogIEBAbWFwKCJlZGdlY3JlYXRvcl9tb2RlbGVzMiIpCn0KCm1vZGVsIG9wdGlvblZhbHVlIHsKICBpZCAgICAgICBJbnQgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKICBvcHRpb25JZCBJbnQ/ICAgIEBtYXAoIklEX09wdGlvbiIpCiAgdmFsdWUgICAgU3RyaW5nPyBAbWFwKCJPcHRpb25fdmFsZXVyIikgQGRiLlZhckNoYXIoMjAwKQoKICBAQGluZGV4KFtvcHRpb25JZF0sIG1hcDogImVkZ2VjcmVhdG9yX3ZhbGV1cnNfZWRnZWNyZWF0b3JfbW9kZWxlczJfSURfZmsiKQogIEBAbWFwKCJlZGdlY3JlYXRvcl92YWxldXJzIikKfQoKbW9kZWwgbXlmb250c0ltYWdlIHsKICBpZCAgICAgICAgICAgICAgSW50ICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgZm9udCAgICAgICAgICAgIFN0cmluZz8gQG1hcCgiRm9udCIpIEBkYi5WYXJDaGFyKDE1MCkKICBjb2xvciAgICAgICAgICAgU3RyaW5nPyBAbWFwKCJDb2xvciIpIEBkYi5WYXJDaGFyKDEwKQogIGJhY2tncm91bmRDb2xvciBTdHJpbmc/IEBtYXAoIkNvbG9yQkciKSBAZGIuVmFyQ2hhcigxMCkKICB3aWR0aCAgICAgICAgICAgU3RyaW5nPyBAbWFwKCJXaWR0aCIpIEBkYi5WYXJDaGFyKDcpCiAgdGV4dCAgICAgICAgICAgIFN0cmluZz8gQG1hcCgiVGV4dGUiKSBAZGIuVmFyQ2hhcigxNTApCiAgcHJlY2lzaW9uICAgICAgIFN0cmluZz8gQG1hcCgiUHJlY2lzaW9uXyIpIEBkYi5WYXJDaGFyKDUpCgogIEBAbWFwKCJpbWFnZXNfbXlmb250cyIpCn0KCm1vZGVsIGVsZW1lbnRJbWFnZSB7CiAgaWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIHVzZXJJZCAgICAgICAgICAgICAgICAgICAgICAgICAgIEludD8gICAgICAgIEBtYXAoIklEX1V0aWxpc2F0ZXVyIikKICBoYXNoICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmc/ICAgICBAdW5pcXVlKG1hcDogImltYWdlc190cmFuY2hlc19IYXNoX3VpbmRleCIpIEBtYXAoIkhhc2giKSBAZGIuVmFyQ2hhcig0MCkKICBjcmVhdGVkQXQgICAgICAgICAgICAgICAgICAgICAgICBEYXRlVGltZT8gICBAbWFwKCJEYXRlSGV1cmUiKSBAZGIuRGF0ZVRpbWUoMCkKICBmaWxlTmFtZSAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmcgICAgICBAbWFwKCJOb21GaWNoaWVyIikgQGRiLlZhckNoYXIoMjU1KQogIHRyYW5jaGVzX2VuX2NvdXJzX21vZGVsZXNfaW1hZ2VzIGVkZ2VQaG90b1tdCgogIEBAbWFwKCJpbWFnZXNfdHJhbmNoZXMiKQp9Cgptb2RlbCBlZGdlTW9kZWwgewogIGlkICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIGNvdW50cnkgICAgICAgU3RyaW5nICAgICAgICAgICAgQG1hcCgiUGF5cyIpIEBkYi5WYXJDaGFyKDMpCiAgbWFnYXppbmUgICAgICBTdHJpbmcgICAgICAgICAgICBAbWFwKCJNYWdhemluZSIpIEBkYi5WYXJDaGFyKDYpCiAgaXNzdWVudW1iZXIgICBTdHJpbmcgICAgICAgICAgICBAbWFwKCJOdW1lcm8iKSBAZGIuVmFyQ2hhcigxMCkKICB1c2VybmFtZSAgICAgIFN0cmluZz8gICAgICAgICAgIEBkYi5WYXJDaGFyKDI1KQogIG1haW5QaG90b05hbWUgU3RyaW5nPyAgICAgICAgICAgQG1hcCgiTm9tUGhvdG9QcmluY2lwYWxlIikgQGRiLlZhckNoYXIoNjApCiAgcGhvdG9ncmFwaHMgICBTdHJpbmc/ICAgICAgICAgICBAbWFwKCJwaG90b2dyYXBoZXMiKSBAZGIuVGV4dAogIGNyZWF0b3JzICAgICAgU3RyaW5nPyAgICAgICAgICAgQG1hcCgiY3JlYXRldXJzIikgQGRiLlRleHQKICBpc0FjdGl2ZSAgICAgIEJvb2xlYW4gICAgICAgICAgIEBtYXAoIkFjdGl2ZSIpCiAgY29udHJpYnV0b3JzICBlZGdlQ29udHJpYnV0b3JbXQogIHBob3RvcyAgICAgICAgZWRnZVBob3RvW10KICB2YWx1ZXMgICAgICAgIGVkZ2VWYWx1ZVtdCgogIEBAdW5pcXVlKFtjb3VudHJ5LCBtYWdhemluZSwgaXNzdWVudW1iZXIsIHVzZXJuYW1lXSwgbWFwOiAidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19fbnVtZXJvIikKICBAQG1hcCgidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlcyIpCn0KCm1vZGVsIGVkZ2VDb250cmlidXRvciB7CiAgaWQgICAgICAgICAgIEludCAgICAgICAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKSBAbWFwKCJJRCIpCiAgbW9kZWxJZCAgICAgIEludD8gICAgICAgICBAbWFwKCJJRF9Nb2RlbGUiKQogIHVzZXJJZCAgICAgICBJbnQgICAgICAgICAgQG1hcCgiSURfVXRpbGlzYXRldXIiKQogIGNvbnRyaWJ1dGlvbiBjb250cmlidXRpb24KICBtb2RlbCAgICAgICAgZWRnZU1vZGVsPyAgIEByZWxhdGlvbihmaWVsZHM6IFttb2RlbElkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IFJlc3RyaWN0LCBvblVwZGF0ZTogUmVzdHJpY3QsIG1hcDogInRyYW5jaGVzX2VuX2NvdXJzX2NvbnRyaWJ1dGV1cnNfdHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19JRF9mayIpCgogIEBAdW5pcXVlKFttb2RlbElkLCB1c2VySWQsIGNvbnRyaWJ1dGlvbl0sIG1hcDogInRyYW5jaGVzX2VuX2NvdXJzX2NvbnRyaWJ1dGV1cnNfX3VuaXF1ZSIpCiAgQEBtYXAoInRyYW5jaGVzX2VuX2NvdXJzX2NvbnRyaWJ1dGV1cnMiKQp9Cgptb2RlbCBlZGdlUGhvdG8gewogIGlkICAgICAgICAgICBJbnQgICAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIG1vZGVsSWQgICAgICBJbnQgICAgICAgICAgQG1hcCgiSURfTW9kZWxlIikKICBwaG90b0lkICAgICAgSW50ICAgICAgICAgIEBtYXAoIklEX0ltYWdlIikKICBpc01haW5QaG90byAgQm9vbGVhbiAgICAgIEBtYXAoIkVzdFBob3RvUHJpbmNpcGFsZSIpCiAgZWxlbWVudEltYWdlIGVsZW1lbnRJbWFnZSBAcmVsYXRpb24oZmllbGRzOiBbcGhvdG9JZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uVXBkYXRlOiBSZXN0cmljdCwgbWFwOiAidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19pbWFnZXNfX19ma19pbWFnZSIpCiAgbW9kZWwgICAgICAgIGVkZ2VNb2RlbCAgICBAcmVsYXRpb24oZmllbGRzOiBbbW9kZWxJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uVXBkYXRlOiBSZXN0cmljdCwgbWFwOiAidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19pbWFnZXNfX19tb2RlbGUiKQoKICBAQGluZGV4KFtwaG90b0lkXSwgbWFwOiAidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19pbWFnZXNfX19ma19pbWFnZSIpCiAgQEBpbmRleChbbW9kZWxJZF0sIG1hcDogInRyYW5jaGVzX2VuX2NvdXJzX21vZGVsZXNfaW1hZ2VzX19fbW9kZWxlIikKICBAQG1hcCgidHJhbmNoZXNfZW5fY291cnNfbW9kZWxlc19pbWFnZXMiKQp9Cgptb2RlbCBlZGdlVmFsdWUgewogIGlkICAgICAgICAgIEludCAgICAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkgQG1hcCgiSUQiKQogIG9yZGVyICAgICAgIEZsb2F0ICAgICAgQG1hcCgiT3JkcmUiKQogIHJlbmRlck5hbWUgIFN0cmluZyAgICAgQG1hcCgiTm9tX2ZvbmN0aW9uIikgQGRiLlZhckNoYXIoMzApCiAgb3B0aW9uTmFtZSAgU3RyaW5nPyAgICBAbWFwKCJPcHRpb25fbm9tIikgQGRiLlZhckNoYXIoMzApCiAgb3B0aW9uVmFsdWUgU3RyaW5nPyAgICBAbWFwKCJPcHRpb25fdmFsZXVyIikgQGRiLlZhckNoYXIoMjAwKQogIG1vZGVsSWQgICAgIEludD8gICAgICAgQG1hcCgiSURfTW9kZWxlIikKICBtb2RlbCAgICAgICBlZGdlTW9kZWw/IEByZWxhdGlvbihmaWVsZHM6IFttb2RlbElkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IFJlc3RyaWN0LCBvblVwZGF0ZTogUmVzdHJpY3QsIG1hcDogIkZLX0FDNTdEOTlFNEExRUQ1NzYiKQoKICBAQGluZGV4KFttb2RlbElkXSwgbWFwOiAiSURfTW9kZWxlIikKICBAQG1hcCgidHJhbmNoZXNfZW5fY291cnNfdmFsZXVycyIpCn0KCmVudW0gY29udHJpYnV0aW9uIHsKICBwaG90b2dyYXBoZQogIGNyZWF0ZXVyCn0K",
  "inlineSchemaHash": "b8b1e6ac097adac34c3e0532fcd1b4d6235802c7d727c781088a1c4887fdac07",
  "noEngine": false
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"optionInterval\":{\"dbName\":\"edgecreator_intervalles\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"valueId\",\"dbName\":\"ID_Valeur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issueNumberStart\",\"dbName\":\"Numero_debut\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issueNumberEnd\",\"dbName\":\"Numero_fin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"edgeModelOld\":{\"dbName\":\"edgecreator_modeles2\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"dbName\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"magazine\",\"dbName\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"dbName\":\"Ordre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"functionName\",\"dbName\":\"Nom_fonction\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionName\",\"dbName\":\"Option_nom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"optionValue\":{\"dbName\":\"edgecreator_valeurs\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionId\",\"dbName\":\"ID_Option\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"dbName\":\"Option_valeur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"myfontsImage\":{\"dbName\":\"images_myfonts\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"font\",\"dbName\":\"Font\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"color\",\"dbName\":\"Color\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"backgroundColor\",\"dbName\":\"ColorBG\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"width\",\"dbName\":\"Width\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"text\",\"dbName\":\"Texte\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"precision\",\"dbName\":\"Precision_\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"elementImage\":{\"dbName\":\"images_tranches\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hash\",\"dbName\":\"Hash\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"DateHeure\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fileName\",\"dbName\":\"NomFichier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tranches_en_cours_modeles_images\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgePhoto\",\"relationName\":\"edgePhotoToelementImage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"edgeModel\":{\"dbName\":\"tranches_en_cours_modeles\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"country\",\"dbName\":\"Pays\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"magazine\",\"dbName\":\"Magazine\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuenumber\",\"dbName\":\"Numero\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mainPhotoName\",\"dbName\":\"NomPhotoPrincipale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photographs\",\"dbName\":\"photographes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creators\",\"dbName\":\"createurs\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"Active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contributors\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgeContributor\",\"relationName\":\"edgeContributorToedgeModel\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photos\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgePhoto\",\"relationName\":\"edgeModelToedgePhoto\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"values\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgeValue\",\"relationName\":\"edgeModelToedgeValue\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"country\",\"magazine\",\"issuenumber\",\"username\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"country\",\"magazine\",\"issuenumber\",\"username\"]}],\"isGenerated\":false},\"edgeContributor\":{\"dbName\":\"tranches_en_cours_contributeurs\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modelId\",\"dbName\":\"ID_Modele\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"ID_Utilisateur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contribution\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"contribution\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgeModel\",\"relationName\":\"edgeContributorToedgeModel\",\"relationFromFields\":[\"modelId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"modelId\",\"userId\",\"contribution\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"modelId\",\"userId\",\"contribution\"]}],\"isGenerated\":false},\"edgePhoto\":{\"dbName\":\"tranches_en_cours_modeles_images\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modelId\",\"dbName\":\"ID_Modele\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"photoId\",\"dbName\":\"ID_Image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isMainPhoto\",\"dbName\":\"EstPhotoPrincipale\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"elementImage\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"elementImage\",\"relationName\":\"edgePhotoToelementImage\",\"relationFromFields\":[\"photoId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgeModel\",\"relationName\":\"edgeModelToedgePhoto\",\"relationFromFields\":[\"modelId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"edgeValue\":{\"dbName\":\"tranches_en_cours_valeurs\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"dbName\":\"Ordre\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"renderName\",\"dbName\":\"Nom_fonction\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionName\",\"dbName\":\"Option_nom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionValue\",\"dbName\":\"Option_valeur\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"modelId\",\"dbName\":\"ID_Modele\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"edgeModel\",\"relationName\":\"edgeModelToedgeValue\",\"relationFromFields\":[\"modelId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Restrict\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"contribution\":{\"values\":[{\"name\":\"photographe\",\"dbName\":null},{\"name\":\"createur\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)


config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL_EDGECREATOR: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL_EDGECREATOR'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL_EDGECREATOR || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

