
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

exports.Prisma.CoverImportScalarFieldEnum = {
  coverId: 'coverId',
  importedAt: 'importedAt',
  importError: 'importError'
};

exports.Prisma.CoverScalarFieldEnum = {
  id: 'id',
  issuecode: 'issuecode',
  sitecode: 'sitecode',
  url: 'url'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  coverImport: 'coverImport',
  cover: 'cover'
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
      "value": "/media/bruno/workspace/var/www/html/DucksManager/packages/api/dist/prisma/client_cover_info",
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
        "fromEnvVar": "DATABASE_URL_COVER_INFO",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgPSAicHJpc21hLWNsaWVudC1qcyIKICBvdXRwdXQgICA9ICIuLi9kaXN0L3ByaXNtYS9jbGllbnRfY292ZXJfaW5mbyIKICBiaW5hcnlUYXJnZXRzID0gWyJuYXRpdmUiLCAiZGViaWFuLW9wZW5zc2wtMS4xLngiLCAiZGViaWFuLW9wZW5zc2wtMy4wLngiXQp9CgpkYXRhc291cmNlIGRiIHsKICBwcm92aWRlciA9ICJteXNxbCIKICB1cmwgICAgICA9IGVudigiREFUQUJBU0VfVVJMX0NPVkVSX0lORk8iKQp9Cgptb2RlbCBjb3ZlckltcG9ydCB7CiAgY292ZXJJZCAgICAgSW50ICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoImNvdmVyaWQiKQogIGltcG9ydGVkQXQgIERhdGVUaW1lPyBAZGIuRGF0ZVRpbWUoMCkgICAgICAgICAgICAgICBAbWFwKCJpbXBvcnRlZCIpCiAgaW1wb3J0RXJyb3IgU3RyaW5nPyAgIEBkYi5WYXJDaGFyKDIwMCkgICAgICAgICAgICAgIEBtYXAoImltcG9ydF9lcnJvciIpCgogIEBAdW5pcXVlKFtjb3ZlcklkLCBpbXBvcnRlZEF0LCBpbXBvcnRFcnJvcl0sIG1hcDogInVuaXF1ZWZpZWxkc2V0X2NvdmVyX2ltcG9ydHMiKQoKICBAQG1hcCgiY292ZXJfaW1wb3J0cyIpCn0KCm1vZGVsIGNvdmVyIHsKICBpZCAgICAgICAgSW50ICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpIEBtYXAoIklEIikKICBpc3N1ZWNvZGUgU3RyaW5nIEBkYi5WYXJDaGFyKDE3KQogIHNpdGVjb2RlICBTdHJpbmcgQGRiLlZhckNoYXIoMTEpCiAgdXJsICAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcig5OCkKCiAgQEB1bmlxdWUoW2lzc3VlY29kZSwgdXJsXSwgbWFwOiAidW5pcXVlZmllbGRzZXRfY292ZXJzIikKCiAgQEBtYXAoImNvdmVycyIpCn0K",
  "inlineSchemaHash": "990f7dd3ff3be3d4dd74256f14e1fb0ee2f6d329ae925956335ddb74bcbaad0f",
  "noEngine": false
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"coverImport\":{\"dbName\":\"cover_imports\",\"fields\":[{\"name\":\"coverId\",\"dbName\":\"coverid\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedAt\",\"dbName\":\"imported\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importError\",\"dbName\":\"import_error\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"coverId\",\"importedAt\",\"importError\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"coverId\",\"importedAt\",\"importError\"]}],\"isGenerated\":false},\"cover\":{\"dbName\":\"covers\",\"fields\":[{\"name\":\"id\",\"dbName\":\"ID\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"issuecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sitecode\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"issuecode\",\"url\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"issuecode\",\"url\"]}],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)


config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL_COVER_INFO: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL_COVER_INFO'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL_COVER_INFO || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

