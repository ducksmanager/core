
/**
 * Client
**/

import * as runtime from './runtime/library';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model authorStory
 * 
 */
export type authorStory = $Result.DefaultSelection<Prisma.$authorStoryPayload>
/**
 * Model authorUserForStats
 * 
 */
export type authorUserForStats = $Result.DefaultSelection<Prisma.$authorUserForStatsPayload>
/**
 * Model histoires_publications
 * 
 */
export type histoires_publications = $Result.DefaultSelection<Prisma.$histoires_publicationsPayload>
/**
 * Model missingStoryForUser
 * 
 */
export type missingStoryForUser = $Result.DefaultSelection<Prisma.$missingStoryForUserPayload>
/**
 * Model utilisateurs_publications_manquantes
 * 
 */
export type utilisateurs_publications_manquantes = $Result.DefaultSelection<Prisma.$utilisateurs_publications_manquantesPayload>
/**
 * Model suggestedIssueForUser
 * 
 */
export type suggestedIssueForUser = $Result.DefaultSelection<Prisma.$suggestedIssueForUserPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AuthorStories
 * const authorStories = await prisma.authorStory.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AuthorStories
   * const authorStories = await prisma.authorStory.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.authorStory`: Exposes CRUD operations for the **authorStory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthorStories
    * const authorStories = await prisma.authorStory.findMany()
    * ```
    */
  get authorStory(): Prisma.authorStoryDelegate<ExtArgs>;

  /**
   * `prisma.authorUserForStats`: Exposes CRUD operations for the **authorUserForStats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthorUserForStats
    * const authorUserForStats = await prisma.authorUserForStats.findMany()
    * ```
    */
  get authorUserForStats(): Prisma.authorUserForStatsDelegate<ExtArgs>;

  /**
   * `prisma.histoires_publications`: Exposes CRUD operations for the **histoires_publications** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Histoires_publications
    * const histoires_publications = await prisma.histoires_publications.findMany()
    * ```
    */
  get histoires_publications(): Prisma.histoires_publicationsDelegate<ExtArgs>;

  /**
   * `prisma.missingStoryForUser`: Exposes CRUD operations for the **missingStoryForUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MissingStoryForUsers
    * const missingStoryForUsers = await prisma.missingStoryForUser.findMany()
    * ```
    */
  get missingStoryForUser(): Prisma.missingStoryForUserDelegate<ExtArgs>;

  /**
   * `prisma.utilisateurs_publications_manquantes`: Exposes CRUD operations for the **utilisateurs_publications_manquantes** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Utilisateurs_publications_manquantes
    * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findMany()
    * ```
    */
  get utilisateurs_publications_manquantes(): Prisma.utilisateurs_publications_manquantesDelegate<ExtArgs>;

  /**
   * `prisma.suggestedIssueForUser`: Exposes CRUD operations for the **suggestedIssueForUser** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuggestedIssueForUsers
    * const suggestedIssueForUsers = await prisma.suggestedIssueForUser.findMany()
    * ```
    */
  get suggestedIssueForUser(): Prisma.suggestedIssueForUserDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.2.0
   * Query Engine version: 2804dc98259d2ea960602aca6b8e7fdc03c1758f
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    authorStory: 'authorStory',
    authorUserForStats: 'authorUserForStats',
    histoires_publications: 'histoires_publications',
    missingStoryForUser: 'missingStoryForUser',
    utilisateurs_publications_manquantes: 'utilisateurs_publications_manquantes',
    suggestedIssueForUser: 'suggestedIssueForUser'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.Args}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'authorStory' | 'authorUserForStats' | 'histoires_publications' | 'missingStoryForUser' | 'utilisateurs_publications_manquantes' | 'suggestedIssueForUser'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      authorStory: {
        payload: Prisma.$authorStoryPayload<ExtArgs>
        fields: Prisma.authorStoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.authorStoryFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.authorStoryFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          findFirst: {
            args: Prisma.authorStoryFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.authorStoryFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          findMany: {
            args: Prisma.authorStoryFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>[]
          }
          create: {
            args: Prisma.authorStoryCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          createMany: {
            args: Prisma.authorStoryCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.authorStoryDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          update: {
            args: Prisma.authorStoryUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          deleteMany: {
            args: Prisma.authorStoryDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.authorStoryUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.authorStoryUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorStoryPayload>
          }
          aggregate: {
            args: Prisma.AuthorStoryAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAuthorStory>
          }
          groupBy: {
            args: Prisma.authorStoryGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AuthorStoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.authorStoryCountArgs<ExtArgs>,
            result: $Utils.Optional<AuthorStoryCountAggregateOutputType> | number
          }
        }
      }
      authorUserForStats: {
        payload: Prisma.$authorUserForStatsPayload<ExtArgs>
        fields: Prisma.authorUserForStatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.authorUserForStatsFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.authorUserForStatsFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          findFirst: {
            args: Prisma.authorUserForStatsFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.authorUserForStatsFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          findMany: {
            args: Prisma.authorUserForStatsFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>[]
          }
          create: {
            args: Prisma.authorUserForStatsCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          createMany: {
            args: Prisma.authorUserForStatsCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.authorUserForStatsDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          update: {
            args: Prisma.authorUserForStatsUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          deleteMany: {
            args: Prisma.authorUserForStatsDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.authorUserForStatsUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.authorUserForStatsUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$authorUserForStatsPayload>
          }
          aggregate: {
            args: Prisma.AuthorUserForStatsAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAuthorUserForStats>
          }
          groupBy: {
            args: Prisma.authorUserForStatsGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AuthorUserForStatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.authorUserForStatsCountArgs<ExtArgs>,
            result: $Utils.Optional<AuthorUserForStatsCountAggregateOutputType> | number
          }
        }
      }
      histoires_publications: {
        payload: Prisma.$histoires_publicationsPayload<ExtArgs>
        fields: Prisma.histoires_publicationsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.histoires_publicationsFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.histoires_publicationsFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          findFirst: {
            args: Prisma.histoires_publicationsFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.histoires_publicationsFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          findMany: {
            args: Prisma.histoires_publicationsFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>[]
          }
          create: {
            args: Prisma.histoires_publicationsCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          createMany: {
            args: Prisma.histoires_publicationsCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.histoires_publicationsDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          update: {
            args: Prisma.histoires_publicationsUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          deleteMany: {
            args: Prisma.histoires_publicationsDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.histoires_publicationsUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.histoires_publicationsUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$histoires_publicationsPayload>
          }
          aggregate: {
            args: Prisma.Histoires_publicationsAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateHistoires_publications>
          }
          groupBy: {
            args: Prisma.histoires_publicationsGroupByArgs<ExtArgs>,
            result: $Utils.Optional<Histoires_publicationsGroupByOutputType>[]
          }
          count: {
            args: Prisma.histoires_publicationsCountArgs<ExtArgs>,
            result: $Utils.Optional<Histoires_publicationsCountAggregateOutputType> | number
          }
        }
      }
      missingStoryForUser: {
        payload: Prisma.$missingStoryForUserPayload<ExtArgs>
        fields: Prisma.missingStoryForUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.missingStoryForUserFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.missingStoryForUserFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          findFirst: {
            args: Prisma.missingStoryForUserFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.missingStoryForUserFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          findMany: {
            args: Prisma.missingStoryForUserFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>[]
          }
          create: {
            args: Prisma.missingStoryForUserCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          createMany: {
            args: Prisma.missingStoryForUserCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.missingStoryForUserDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          update: {
            args: Prisma.missingStoryForUserUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          deleteMany: {
            args: Prisma.missingStoryForUserDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.missingStoryForUserUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.missingStoryForUserUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$missingStoryForUserPayload>
          }
          aggregate: {
            args: Prisma.MissingStoryForUserAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateMissingStoryForUser>
          }
          groupBy: {
            args: Prisma.missingStoryForUserGroupByArgs<ExtArgs>,
            result: $Utils.Optional<MissingStoryForUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.missingStoryForUserCountArgs<ExtArgs>,
            result: $Utils.Optional<MissingStoryForUserCountAggregateOutputType> | number
          }
        }
      }
      utilisateurs_publications_manquantes: {
        payload: Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>
        fields: Prisma.utilisateurs_publications_manquantesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.utilisateurs_publications_manquantesFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.utilisateurs_publications_manquantesFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          findFirst: {
            args: Prisma.utilisateurs_publications_manquantesFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.utilisateurs_publications_manquantesFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          findMany: {
            args: Prisma.utilisateurs_publications_manquantesFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>[]
          }
          create: {
            args: Prisma.utilisateurs_publications_manquantesCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          createMany: {
            args: Prisma.utilisateurs_publications_manquantesCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.utilisateurs_publications_manquantesDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          update: {
            args: Prisma.utilisateurs_publications_manquantesUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          deleteMany: {
            args: Prisma.utilisateurs_publications_manquantesDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.utilisateurs_publications_manquantesUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.utilisateurs_publications_manquantesUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$utilisateurs_publications_manquantesPayload>
          }
          aggregate: {
            args: Prisma.Utilisateurs_publications_manquantesAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateUtilisateurs_publications_manquantes>
          }
          groupBy: {
            args: Prisma.utilisateurs_publications_manquantesGroupByArgs<ExtArgs>,
            result: $Utils.Optional<Utilisateurs_publications_manquantesGroupByOutputType>[]
          }
          count: {
            args: Prisma.utilisateurs_publications_manquantesCountArgs<ExtArgs>,
            result: $Utils.Optional<Utilisateurs_publications_manquantesCountAggregateOutputType> | number
          }
        }
      }
      suggestedIssueForUser: {
        payload: Prisma.$suggestedIssueForUserPayload<ExtArgs>
        fields: Prisma.suggestedIssueForUserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.suggestedIssueForUserFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.suggestedIssueForUserFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          findFirst: {
            args: Prisma.suggestedIssueForUserFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.suggestedIssueForUserFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          findMany: {
            args: Prisma.suggestedIssueForUserFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>[]
          }
          create: {
            args: Prisma.suggestedIssueForUserCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          createMany: {
            args: Prisma.suggestedIssueForUserCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.suggestedIssueForUserDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          update: {
            args: Prisma.suggestedIssueForUserUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          deleteMany: {
            args: Prisma.suggestedIssueForUserDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.suggestedIssueForUserUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.suggestedIssueForUserUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$suggestedIssueForUserPayload>
          }
          aggregate: {
            args: Prisma.SuggestedIssueForUserAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateSuggestedIssueForUser>
          }
          groupBy: {
            args: Prisma.suggestedIssueForUserGroupByArgs<ExtArgs>,
            result: $Utils.Optional<SuggestedIssueForUserGroupByOutputType>[]
          }
          count: {
            args: Prisma.suggestedIssueForUserCountArgs<ExtArgs>,
            result: $Utils.Optional<SuggestedIssueForUserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model authorStory
   */

  export type AggregateAuthorStory = {
    _count: AuthorStoryCountAggregateOutputType | null
    _avg: AuthorStoryAvgAggregateOutputType | null
    _sum: AuthorStorySumAggregateOutputType | null
    _min: AuthorStoryMinAggregateOutputType | null
    _max: AuthorStoryMaxAggregateOutputType | null
  }

  export type AuthorStoryAvgAggregateOutputType = {
    id: number | null
  }

  export type AuthorStorySumAggregateOutputType = {
    id: number | null
  }

  export type AuthorStoryMinAggregateOutputType = {
    id: number | null
    personcode: string | null
    storycode: string | null
  }

  export type AuthorStoryMaxAggregateOutputType = {
    id: number | null
    personcode: string | null
    storycode: string | null
  }

  export type AuthorStoryCountAggregateOutputType = {
    id: number
    personcode: number
    storycode: number
    _all: number
  }


  export type AuthorStoryAvgAggregateInputType = {
    id?: true
  }

  export type AuthorStorySumAggregateInputType = {
    id?: true
  }

  export type AuthorStoryMinAggregateInputType = {
    id?: true
    personcode?: true
    storycode?: true
  }

  export type AuthorStoryMaxAggregateInputType = {
    id?: true
    personcode?: true
    storycode?: true
  }

  export type AuthorStoryCountAggregateInputType = {
    id?: true
    personcode?: true
    storycode?: true
    _all?: true
  }

  export type AuthorStoryAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which authorStory to aggregate.
     */
    where?: authorStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorStories to fetch.
     */
    orderBy?: authorStoryOrderByWithRelationInput | authorStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: authorStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned authorStories
    **/
    _count?: true | AuthorStoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuthorStoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuthorStorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthorStoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthorStoryMaxAggregateInputType
  }

  export type GetAuthorStoryAggregateType<T extends AuthorStoryAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthorStory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthorStory[P]>
      : GetScalarType<T[P], AggregateAuthorStory[P]>
  }




  export type authorStoryGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: authorStoryWhereInput
    orderBy?: authorStoryOrderByWithAggregationInput | authorStoryOrderByWithAggregationInput[]
    by: AuthorStoryScalarFieldEnum[] | AuthorStoryScalarFieldEnum
    having?: authorStoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthorStoryCountAggregateInputType | true
    _avg?: AuthorStoryAvgAggregateInputType
    _sum?: AuthorStorySumAggregateInputType
    _min?: AuthorStoryMinAggregateInputType
    _max?: AuthorStoryMaxAggregateInputType
  }

  export type AuthorStoryGroupByOutputType = {
    id: number
    personcode: string
    storycode: string
    _count: AuthorStoryCountAggregateOutputType | null
    _avg: AuthorStoryAvgAggregateOutputType | null
    _sum: AuthorStorySumAggregateOutputType | null
    _min: AuthorStoryMinAggregateOutputType | null
    _max: AuthorStoryMaxAggregateOutputType | null
  }

  type GetAuthorStoryGroupByPayload<T extends authorStoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthorStoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthorStoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthorStoryGroupByOutputType[P]>
            : GetScalarType<T[P], AuthorStoryGroupByOutputType[P]>
        }
      >
    >


  export type authorStorySelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personcode?: boolean
    storycode?: boolean
  }, ExtArgs["result"]["authorStory"]>

  export type authorStorySelectScalar = {
    id?: boolean
    personcode?: boolean
    storycode?: boolean
  }


  export type $authorStoryPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "authorStory"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      personcode: string
      storycode: string
    }, ExtArgs["result"]["authorStory"]>
    composites: {}
  }


  type authorStoryGetPayload<S extends boolean | null | undefined | authorStoryDefaultArgs> = $Result.GetResult<Prisma.$authorStoryPayload, S>

  type authorStoryCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<authorStoryFindManyArgs, 'select' | 'include'> & {
      select?: AuthorStoryCountAggregateInputType | true
    }

  export interface authorStoryDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['authorStory'], meta: { name: 'authorStory' } }
    /**
     * Find zero or one AuthorStory that matches the filter.
     * @param {authorStoryFindUniqueArgs} args - Arguments to find a AuthorStory
     * @example
     * // Get one AuthorStory
     * const authorStory = await prisma.authorStory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends authorStoryFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryFindUniqueArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one AuthorStory that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {authorStoryFindUniqueOrThrowArgs} args - Arguments to find a AuthorStory
     * @example
     * // Get one AuthorStory
     * const authorStory = await prisma.authorStory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends authorStoryFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first AuthorStory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryFindFirstArgs} args - Arguments to find a AuthorStory
     * @example
     * // Get one AuthorStory
     * const authorStory = await prisma.authorStory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends authorStoryFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryFindFirstArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first AuthorStory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryFindFirstOrThrowArgs} args - Arguments to find a AuthorStory
     * @example
     * // Get one AuthorStory
     * const authorStory = await prisma.authorStory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends authorStoryFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more AuthorStories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthorStories
     * const authorStories = await prisma.authorStory.findMany()
     * 
     * // Get first 10 AuthorStories
     * const authorStories = await prisma.authorStory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authorStoryWithIdOnly = await prisma.authorStory.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends authorStoryFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a AuthorStory.
     * @param {authorStoryCreateArgs} args - Arguments to create a AuthorStory.
     * @example
     * // Create one AuthorStory
     * const AuthorStory = await prisma.authorStory.create({
     *   data: {
     *     // ... data to create a AuthorStory
     *   }
     * })
     * 
    **/
    create<T extends authorStoryCreateArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryCreateArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many AuthorStories.
     *     @param {authorStoryCreateManyArgs} args - Arguments to create many AuthorStories.
     *     @example
     *     // Create many AuthorStories
     *     const authorStory = await prisma.authorStory.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends authorStoryCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuthorStory.
     * @param {authorStoryDeleteArgs} args - Arguments to delete one AuthorStory.
     * @example
     * // Delete one AuthorStory
     * const AuthorStory = await prisma.authorStory.delete({
     *   where: {
     *     // ... filter to delete one AuthorStory
     *   }
     * })
     * 
    **/
    delete<T extends authorStoryDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryDeleteArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one AuthorStory.
     * @param {authorStoryUpdateArgs} args - Arguments to update one AuthorStory.
     * @example
     * // Update one AuthorStory
     * const authorStory = await prisma.authorStory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends authorStoryUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryUpdateArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more AuthorStories.
     * @param {authorStoryDeleteManyArgs} args - Arguments to filter AuthorStories to delete.
     * @example
     * // Delete a few AuthorStories
     * const { count } = await prisma.authorStory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends authorStoryDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorStoryDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthorStories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthorStories
     * const authorStory = await prisma.authorStory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends authorStoryUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuthorStory.
     * @param {authorStoryUpsertArgs} args - Arguments to update or create a AuthorStory.
     * @example
     * // Update or create a AuthorStory
     * const authorStory = await prisma.authorStory.upsert({
     *   create: {
     *     // ... data to create a AuthorStory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthorStory we want to update
     *   }
     * })
    **/
    upsert<T extends authorStoryUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, authorStoryUpsertArgs<ExtArgs>>
    ): Prisma__authorStoryClient<$Result.GetResult<Prisma.$authorStoryPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of AuthorStories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryCountArgs} args - Arguments to filter AuthorStories to count.
     * @example
     * // Count the number of AuthorStories
     * const count = await prisma.authorStory.count({
     *   where: {
     *     // ... the filter for the AuthorStories we want to count
     *   }
     * })
    **/
    count<T extends authorStoryCountArgs>(
      args?: Subset<T, authorStoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthorStoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthorStory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorStoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthorStoryAggregateArgs>(args: Subset<T, AuthorStoryAggregateArgs>): Prisma.PrismaPromise<GetAuthorStoryAggregateType<T>>

    /**
     * Group by AuthorStory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorStoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends authorStoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: authorStoryGroupByArgs['orderBy'] }
        : { orderBy?: authorStoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, authorStoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthorStoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the authorStory model
   */
  readonly fields: authorStoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for authorStory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__authorStoryClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the authorStory model
   */ 
  interface authorStoryFieldRefs {
    readonly id: FieldRef<"authorStory", 'Int'>
    readonly personcode: FieldRef<"authorStory", 'String'>
    readonly storycode: FieldRef<"authorStory", 'String'>
  }
    

  // Custom InputTypes

  /**
   * authorStory findUnique
   */
  export type authorStoryFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter, which authorStory to fetch.
     */
    where: authorStoryWhereUniqueInput
  }


  /**
   * authorStory findUniqueOrThrow
   */
  export type authorStoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter, which authorStory to fetch.
     */
    where: authorStoryWhereUniqueInput
  }


  /**
   * authorStory findFirst
   */
  export type authorStoryFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter, which authorStory to fetch.
     */
    where?: authorStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorStories to fetch.
     */
    orderBy?: authorStoryOrderByWithRelationInput | authorStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for authorStories.
     */
    cursor?: authorStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of authorStories.
     */
    distinct?: AuthorStoryScalarFieldEnum | AuthorStoryScalarFieldEnum[]
  }


  /**
   * authorStory findFirstOrThrow
   */
  export type authorStoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter, which authorStory to fetch.
     */
    where?: authorStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorStories to fetch.
     */
    orderBy?: authorStoryOrderByWithRelationInput | authorStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for authorStories.
     */
    cursor?: authorStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorStories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of authorStories.
     */
    distinct?: AuthorStoryScalarFieldEnum | AuthorStoryScalarFieldEnum[]
  }


  /**
   * authorStory findMany
   */
  export type authorStoryFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter, which authorStories to fetch.
     */
    where?: authorStoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorStories to fetch.
     */
    orderBy?: authorStoryOrderByWithRelationInput | authorStoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing authorStories.
     */
    cursor?: authorStoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorStories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorStories.
     */
    skip?: number
    distinct?: AuthorStoryScalarFieldEnum | AuthorStoryScalarFieldEnum[]
  }


  /**
   * authorStory create
   */
  export type authorStoryCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * The data needed to create a authorStory.
     */
    data: XOR<authorStoryCreateInput, authorStoryUncheckedCreateInput>
  }


  /**
   * authorStory createMany
   */
  export type authorStoryCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many authorStories.
     */
    data: authorStoryCreateManyInput | authorStoryCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * authorStory update
   */
  export type authorStoryUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * The data needed to update a authorStory.
     */
    data: XOR<authorStoryUpdateInput, authorStoryUncheckedUpdateInput>
    /**
     * Choose, which authorStory to update.
     */
    where: authorStoryWhereUniqueInput
  }


  /**
   * authorStory updateMany
   */
  export type authorStoryUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update authorStories.
     */
    data: XOR<authorStoryUpdateManyMutationInput, authorStoryUncheckedUpdateManyInput>
    /**
     * Filter which authorStories to update
     */
    where?: authorStoryWhereInput
  }


  /**
   * authorStory upsert
   */
  export type authorStoryUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * The filter to search for the authorStory to update in case it exists.
     */
    where: authorStoryWhereUniqueInput
    /**
     * In case the authorStory found by the `where` argument doesn't exist, create a new authorStory with this data.
     */
    create: XOR<authorStoryCreateInput, authorStoryUncheckedCreateInput>
    /**
     * In case the authorStory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<authorStoryUpdateInput, authorStoryUncheckedUpdateInput>
  }


  /**
   * authorStory delete
   */
  export type authorStoryDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
    /**
     * Filter which authorStory to delete.
     */
    where: authorStoryWhereUniqueInput
  }


  /**
   * authorStory deleteMany
   */
  export type authorStoryDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which authorStories to delete
     */
    where?: authorStoryWhereInput
  }


  /**
   * authorStory without action
   */
  export type authorStoryDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorStory
     */
    select?: authorStorySelect<ExtArgs> | null
  }



  /**
   * Model authorUserForStats
   */

  export type AggregateAuthorUserForStats = {
    _count: AuthorUserForStatsCountAggregateOutputType | null
    _avg: AuthorUserForStatsAvgAggregateOutputType | null
    _sum: AuthorUserForStatsSumAggregateOutputType | null
    _min: AuthorUserForStatsMinAggregateOutputType | null
    _max: AuthorUserForStatsMaxAggregateOutputType | null
  }

  export type AuthorUserForStatsAvgAggregateOutputType = {
    id: number | null
    userId: number | null
    notation: number | null
  }

  export type AuthorUserForStatsSumAggregateOutputType = {
    id: number | null
    userId: number | null
    notation: number | null
  }

  export type AuthorUserForStatsMinAggregateOutputType = {
    id: number | null
    personcode: string | null
    userId: number | null
    notation: number | null
  }

  export type AuthorUserForStatsMaxAggregateOutputType = {
    id: number | null
    personcode: string | null
    userId: number | null
    notation: number | null
  }

  export type AuthorUserForStatsCountAggregateOutputType = {
    id: number
    personcode: number
    userId: number
    notation: number
    _all: number
  }


  export type AuthorUserForStatsAvgAggregateInputType = {
    id?: true
    userId?: true
    notation?: true
  }

  export type AuthorUserForStatsSumAggregateInputType = {
    id?: true
    userId?: true
    notation?: true
  }

  export type AuthorUserForStatsMinAggregateInputType = {
    id?: true
    personcode?: true
    userId?: true
    notation?: true
  }

  export type AuthorUserForStatsMaxAggregateInputType = {
    id?: true
    personcode?: true
    userId?: true
    notation?: true
  }

  export type AuthorUserForStatsCountAggregateInputType = {
    id?: true
    personcode?: true
    userId?: true
    notation?: true
    _all?: true
  }

  export type AuthorUserForStatsAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which authorUserForStats to aggregate.
     */
    where?: authorUserForStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorUserForStats to fetch.
     */
    orderBy?: authorUserForStatsOrderByWithRelationInput | authorUserForStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: authorUserForStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorUserForStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorUserForStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned authorUserForStats
    **/
    _count?: true | AuthorUserForStatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AuthorUserForStatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AuthorUserForStatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthorUserForStatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthorUserForStatsMaxAggregateInputType
  }

  export type GetAuthorUserForStatsAggregateType<T extends AuthorUserForStatsAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthorUserForStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthorUserForStats[P]>
      : GetScalarType<T[P], AggregateAuthorUserForStats[P]>
  }




  export type authorUserForStatsGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: authorUserForStatsWhereInput
    orderBy?: authorUserForStatsOrderByWithAggregationInput | authorUserForStatsOrderByWithAggregationInput[]
    by: AuthorUserForStatsScalarFieldEnum[] | AuthorUserForStatsScalarFieldEnum
    having?: authorUserForStatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthorUserForStatsCountAggregateInputType | true
    _avg?: AuthorUserForStatsAvgAggregateInputType
    _sum?: AuthorUserForStatsSumAggregateInputType
    _min?: AuthorUserForStatsMinAggregateInputType
    _max?: AuthorUserForStatsMaxAggregateInputType
  }

  export type AuthorUserForStatsGroupByOutputType = {
    id: number
    personcode: string
    userId: number
    notation: number
    _count: AuthorUserForStatsCountAggregateOutputType | null
    _avg: AuthorUserForStatsAvgAggregateOutputType | null
    _sum: AuthorUserForStatsSumAggregateOutputType | null
    _min: AuthorUserForStatsMinAggregateOutputType | null
    _max: AuthorUserForStatsMaxAggregateOutputType | null
  }

  type GetAuthorUserForStatsGroupByPayload<T extends authorUserForStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthorUserForStatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthorUserForStatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthorUserForStatsGroupByOutputType[P]>
            : GetScalarType<T[P], AuthorUserForStatsGroupByOutputType[P]>
        }
      >
    >


  export type authorUserForStatsSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    personcode?: boolean
    userId?: boolean
    notation?: boolean
  }, ExtArgs["result"]["authorUserForStats"]>

  export type authorUserForStatsSelectScalar = {
    id?: boolean
    personcode?: boolean
    userId?: boolean
    notation?: boolean
  }


  export type $authorUserForStatsPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "authorUserForStats"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      personcode: string
      userId: number
      notation: number
    }, ExtArgs["result"]["authorUserForStats"]>
    composites: {}
  }


  type authorUserForStatsGetPayload<S extends boolean | null | undefined | authorUserForStatsDefaultArgs> = $Result.GetResult<Prisma.$authorUserForStatsPayload, S>

  type authorUserForStatsCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<authorUserForStatsFindManyArgs, 'select' | 'include'> & {
      select?: AuthorUserForStatsCountAggregateInputType | true
    }

  export interface authorUserForStatsDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['authorUserForStats'], meta: { name: 'authorUserForStats' } }
    /**
     * Find zero or one AuthorUserForStats that matches the filter.
     * @param {authorUserForStatsFindUniqueArgs} args - Arguments to find a AuthorUserForStats
     * @example
     * // Get one AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends authorUserForStatsFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsFindUniqueArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one AuthorUserForStats that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {authorUserForStatsFindUniqueOrThrowArgs} args - Arguments to find a AuthorUserForStats
     * @example
     * // Get one AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends authorUserForStatsFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first AuthorUserForStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsFindFirstArgs} args - Arguments to find a AuthorUserForStats
     * @example
     * // Get one AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends authorUserForStatsFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsFindFirstArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first AuthorUserForStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsFindFirstOrThrowArgs} args - Arguments to find a AuthorUserForStats
     * @example
     * // Get one AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends authorUserForStatsFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more AuthorUserForStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findMany()
     * 
     * // Get first 10 AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authorUserForStatsWithIdOnly = await prisma.authorUserForStats.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends authorUserForStatsFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a AuthorUserForStats.
     * @param {authorUserForStatsCreateArgs} args - Arguments to create a AuthorUserForStats.
     * @example
     * // Create one AuthorUserForStats
     * const AuthorUserForStats = await prisma.authorUserForStats.create({
     *   data: {
     *     // ... data to create a AuthorUserForStats
     *   }
     * })
     * 
    **/
    create<T extends authorUserForStatsCreateArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsCreateArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many AuthorUserForStats.
     *     @param {authorUserForStatsCreateManyArgs} args - Arguments to create many AuthorUserForStats.
     *     @example
     *     // Create many AuthorUserForStats
     *     const authorUserForStats = await prisma.authorUserForStats.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends authorUserForStatsCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a AuthorUserForStats.
     * @param {authorUserForStatsDeleteArgs} args - Arguments to delete one AuthorUserForStats.
     * @example
     * // Delete one AuthorUserForStats
     * const AuthorUserForStats = await prisma.authorUserForStats.delete({
     *   where: {
     *     // ... filter to delete one AuthorUserForStats
     *   }
     * })
     * 
    **/
    delete<T extends authorUserForStatsDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsDeleteArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one AuthorUserForStats.
     * @param {authorUserForStatsUpdateArgs} args - Arguments to update one AuthorUserForStats.
     * @example
     * // Update one AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends authorUserForStatsUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsUpdateArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more AuthorUserForStats.
     * @param {authorUserForStatsDeleteManyArgs} args - Arguments to filter AuthorUserForStats to delete.
     * @example
     * // Delete a few AuthorUserForStats
     * const { count } = await prisma.authorUserForStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends authorUserForStatsDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, authorUserForStatsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthorUserForStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends authorUserForStatsUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuthorUserForStats.
     * @param {authorUserForStatsUpsertArgs} args - Arguments to update or create a AuthorUserForStats.
     * @example
     * // Update or create a AuthorUserForStats
     * const authorUserForStats = await prisma.authorUserForStats.upsert({
     *   create: {
     *     // ... data to create a AuthorUserForStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthorUserForStats we want to update
     *   }
     * })
    **/
    upsert<T extends authorUserForStatsUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, authorUserForStatsUpsertArgs<ExtArgs>>
    ): Prisma__authorUserForStatsClient<$Result.GetResult<Prisma.$authorUserForStatsPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of AuthorUserForStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsCountArgs} args - Arguments to filter AuthorUserForStats to count.
     * @example
     * // Count the number of AuthorUserForStats
     * const count = await prisma.authorUserForStats.count({
     *   where: {
     *     // ... the filter for the AuthorUserForStats we want to count
     *   }
     * })
    **/
    count<T extends authorUserForStatsCountArgs>(
      args?: Subset<T, authorUserForStatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthorUserForStatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthorUserForStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthorUserForStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthorUserForStatsAggregateArgs>(args: Subset<T, AuthorUserForStatsAggregateArgs>): Prisma.PrismaPromise<GetAuthorUserForStatsAggregateType<T>>

    /**
     * Group by AuthorUserForStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {authorUserForStatsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends authorUserForStatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: authorUserForStatsGroupByArgs['orderBy'] }
        : { orderBy?: authorUserForStatsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, authorUserForStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthorUserForStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the authorUserForStats model
   */
  readonly fields: authorUserForStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for authorUserForStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__authorUserForStatsClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the authorUserForStats model
   */ 
  interface authorUserForStatsFieldRefs {
    readonly id: FieldRef<"authorUserForStats", 'Int'>
    readonly personcode: FieldRef<"authorUserForStats", 'String'>
    readonly userId: FieldRef<"authorUserForStats", 'Int'>
    readonly notation: FieldRef<"authorUserForStats", 'Int'>
  }
    

  // Custom InputTypes

  /**
   * authorUserForStats findUnique
   */
  export type authorUserForStatsFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter, which authorUserForStats to fetch.
     */
    where: authorUserForStatsWhereUniqueInput
  }


  /**
   * authorUserForStats findUniqueOrThrow
   */
  export type authorUserForStatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter, which authorUserForStats to fetch.
     */
    where: authorUserForStatsWhereUniqueInput
  }


  /**
   * authorUserForStats findFirst
   */
  export type authorUserForStatsFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter, which authorUserForStats to fetch.
     */
    where?: authorUserForStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorUserForStats to fetch.
     */
    orderBy?: authorUserForStatsOrderByWithRelationInput | authorUserForStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for authorUserForStats.
     */
    cursor?: authorUserForStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorUserForStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorUserForStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of authorUserForStats.
     */
    distinct?: AuthorUserForStatsScalarFieldEnum | AuthorUserForStatsScalarFieldEnum[]
  }


  /**
   * authorUserForStats findFirstOrThrow
   */
  export type authorUserForStatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter, which authorUserForStats to fetch.
     */
    where?: authorUserForStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorUserForStats to fetch.
     */
    orderBy?: authorUserForStatsOrderByWithRelationInput | authorUserForStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for authorUserForStats.
     */
    cursor?: authorUserForStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorUserForStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorUserForStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of authorUserForStats.
     */
    distinct?: AuthorUserForStatsScalarFieldEnum | AuthorUserForStatsScalarFieldEnum[]
  }


  /**
   * authorUserForStats findMany
   */
  export type authorUserForStatsFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter, which authorUserForStats to fetch.
     */
    where?: authorUserForStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of authorUserForStats to fetch.
     */
    orderBy?: authorUserForStatsOrderByWithRelationInput | authorUserForStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing authorUserForStats.
     */
    cursor?: authorUserForStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` authorUserForStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` authorUserForStats.
     */
    skip?: number
    distinct?: AuthorUserForStatsScalarFieldEnum | AuthorUserForStatsScalarFieldEnum[]
  }


  /**
   * authorUserForStats create
   */
  export type authorUserForStatsCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * The data needed to create a authorUserForStats.
     */
    data: XOR<authorUserForStatsCreateInput, authorUserForStatsUncheckedCreateInput>
  }


  /**
   * authorUserForStats createMany
   */
  export type authorUserForStatsCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many authorUserForStats.
     */
    data: authorUserForStatsCreateManyInput | authorUserForStatsCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * authorUserForStats update
   */
  export type authorUserForStatsUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * The data needed to update a authorUserForStats.
     */
    data: XOR<authorUserForStatsUpdateInput, authorUserForStatsUncheckedUpdateInput>
    /**
     * Choose, which authorUserForStats to update.
     */
    where: authorUserForStatsWhereUniqueInput
  }


  /**
   * authorUserForStats updateMany
   */
  export type authorUserForStatsUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update authorUserForStats.
     */
    data: XOR<authorUserForStatsUpdateManyMutationInput, authorUserForStatsUncheckedUpdateManyInput>
    /**
     * Filter which authorUserForStats to update
     */
    where?: authorUserForStatsWhereInput
  }


  /**
   * authorUserForStats upsert
   */
  export type authorUserForStatsUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * The filter to search for the authorUserForStats to update in case it exists.
     */
    where: authorUserForStatsWhereUniqueInput
    /**
     * In case the authorUserForStats found by the `where` argument doesn't exist, create a new authorUserForStats with this data.
     */
    create: XOR<authorUserForStatsCreateInput, authorUserForStatsUncheckedCreateInput>
    /**
     * In case the authorUserForStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<authorUserForStatsUpdateInput, authorUserForStatsUncheckedUpdateInput>
  }


  /**
   * authorUserForStats delete
   */
  export type authorUserForStatsDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
    /**
     * Filter which authorUserForStats to delete.
     */
    where: authorUserForStatsWhereUniqueInput
  }


  /**
   * authorUserForStats deleteMany
   */
  export type authorUserForStatsDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which authorUserForStats to delete
     */
    where?: authorUserForStatsWhereInput
  }


  /**
   * authorUserForStats without action
   */
  export type authorUserForStatsDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the authorUserForStats
     */
    select?: authorUserForStatsSelect<ExtArgs> | null
  }



  /**
   * Model histoires_publications
   */

  export type AggregateHistoires_publications = {
    _count: Histoires_publicationsCountAggregateOutputType | null
    _avg: Histoires_publicationsAvgAggregateOutputType | null
    _sum: Histoires_publicationsSumAggregateOutputType | null
    _min: Histoires_publicationsMinAggregateOutputType | null
    _max: Histoires_publicationsMaxAggregateOutputType | null
  }

  export type Histoires_publicationsAvgAggregateOutputType = {
    ID: number | null
  }

  export type Histoires_publicationsSumAggregateOutputType = {
    ID: number | null
  }

  export type Histoires_publicationsMinAggregateOutputType = {
    ID: number | null
    storycode: string | null
    publicationcode: string | null
    issuenumber: string | null
    issuecode: string | null
    oldestdate: Date | null
  }

  export type Histoires_publicationsMaxAggregateOutputType = {
    ID: number | null
    storycode: string | null
    publicationcode: string | null
    issuenumber: string | null
    issuecode: string | null
    oldestdate: Date | null
  }

  export type Histoires_publicationsCountAggregateOutputType = {
    ID: number
    storycode: number
    publicationcode: number
    issuenumber: number
    issuecode: number
    oldestdate: number
    _all: number
  }


  export type Histoires_publicationsAvgAggregateInputType = {
    ID?: true
  }

  export type Histoires_publicationsSumAggregateInputType = {
    ID?: true
  }

  export type Histoires_publicationsMinAggregateInputType = {
    ID?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    issuecode?: true
    oldestdate?: true
  }

  export type Histoires_publicationsMaxAggregateInputType = {
    ID?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    issuecode?: true
    oldestdate?: true
  }

  export type Histoires_publicationsCountAggregateInputType = {
    ID?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    issuecode?: true
    oldestdate?: true
    _all?: true
  }

  export type Histoires_publicationsAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which histoires_publications to aggregate.
     */
    where?: histoires_publicationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of histoires_publications to fetch.
     */
    orderBy?: histoires_publicationsOrderByWithRelationInput | histoires_publicationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: histoires_publicationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` histoires_publications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` histoires_publications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned histoires_publications
    **/
    _count?: true | Histoires_publicationsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Histoires_publicationsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Histoires_publicationsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Histoires_publicationsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Histoires_publicationsMaxAggregateInputType
  }

  export type GetHistoires_publicationsAggregateType<T extends Histoires_publicationsAggregateArgs> = {
        [P in keyof T & keyof AggregateHistoires_publications]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateHistoires_publications[P]>
      : GetScalarType<T[P], AggregateHistoires_publications[P]>
  }




  export type histoires_publicationsGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: histoires_publicationsWhereInput
    orderBy?: histoires_publicationsOrderByWithAggregationInput | histoires_publicationsOrderByWithAggregationInput[]
    by: Histoires_publicationsScalarFieldEnum[] | Histoires_publicationsScalarFieldEnum
    having?: histoires_publicationsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Histoires_publicationsCountAggregateInputType | true
    _avg?: Histoires_publicationsAvgAggregateInputType
    _sum?: Histoires_publicationsSumAggregateInputType
    _min?: Histoires_publicationsMinAggregateInputType
    _max?: Histoires_publicationsMaxAggregateInputType
  }

  export type Histoires_publicationsGroupByOutputType = {
    ID: number
    storycode: string
    publicationcode: string
    issuenumber: string
    issuecode: string
    oldestdate: Date | null
    _count: Histoires_publicationsCountAggregateOutputType | null
    _avg: Histoires_publicationsAvgAggregateOutputType | null
    _sum: Histoires_publicationsSumAggregateOutputType | null
    _min: Histoires_publicationsMinAggregateOutputType | null
    _max: Histoires_publicationsMaxAggregateOutputType | null
  }

  type GetHistoires_publicationsGroupByPayload<T extends histoires_publicationsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Histoires_publicationsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Histoires_publicationsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Histoires_publicationsGroupByOutputType[P]>
            : GetScalarType<T[P], Histoires_publicationsGroupByOutputType[P]>
        }
      >
    >


  export type histoires_publicationsSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ID?: boolean
    storycode?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    issuecode?: boolean
    oldestdate?: boolean
  }, ExtArgs["result"]["histoires_publications"]>

  export type histoires_publicationsSelectScalar = {
    ID?: boolean
    storycode?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    issuecode?: boolean
    oldestdate?: boolean
  }


  export type $histoires_publicationsPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "histoires_publications"
    objects: {}
    scalars: $Extensions.GetResult<{
      ID: number
      storycode: string
      publicationcode: string
      issuenumber: string
      issuecode: string
      oldestdate: Date | null
    }, ExtArgs["result"]["histoires_publications"]>
    composites: {}
  }


  type histoires_publicationsGetPayload<S extends boolean | null | undefined | histoires_publicationsDefaultArgs> = $Result.GetResult<Prisma.$histoires_publicationsPayload, S>

  type histoires_publicationsCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<histoires_publicationsFindManyArgs, 'select' | 'include'> & {
      select?: Histoires_publicationsCountAggregateInputType | true
    }

  export interface histoires_publicationsDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['histoires_publications'], meta: { name: 'histoires_publications' } }
    /**
     * Find zero or one Histoires_publications that matches the filter.
     * @param {histoires_publicationsFindUniqueArgs} args - Arguments to find a Histoires_publications
     * @example
     * // Get one Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends histoires_publicationsFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsFindUniqueArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Histoires_publications that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {histoires_publicationsFindUniqueOrThrowArgs} args - Arguments to find a Histoires_publications
     * @example
     * // Get one Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends histoires_publicationsFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Histoires_publications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsFindFirstArgs} args - Arguments to find a Histoires_publications
     * @example
     * // Get one Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends histoires_publicationsFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsFindFirstArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Histoires_publications that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsFindFirstOrThrowArgs} args - Arguments to find a Histoires_publications
     * @example
     * // Get one Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends histoires_publicationsFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Histoires_publications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findMany()
     * 
     * // Get first 10 Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.findMany({ take: 10 })
     * 
     * // Only select the `ID`
     * const histoires_publicationsWithIDOnly = await prisma.histoires_publications.findMany({ select: { ID: true } })
     * 
    **/
    findMany<T extends histoires_publicationsFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Histoires_publications.
     * @param {histoires_publicationsCreateArgs} args - Arguments to create a Histoires_publications.
     * @example
     * // Create one Histoires_publications
     * const Histoires_publications = await prisma.histoires_publications.create({
     *   data: {
     *     // ... data to create a Histoires_publications
     *   }
     * })
     * 
    **/
    create<T extends histoires_publicationsCreateArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsCreateArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Histoires_publications.
     *     @param {histoires_publicationsCreateManyArgs} args - Arguments to create many Histoires_publications.
     *     @example
     *     // Create many Histoires_publications
     *     const histoires_publications = await prisma.histoires_publications.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends histoires_publicationsCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Histoires_publications.
     * @param {histoires_publicationsDeleteArgs} args - Arguments to delete one Histoires_publications.
     * @example
     * // Delete one Histoires_publications
     * const Histoires_publications = await prisma.histoires_publications.delete({
     *   where: {
     *     // ... filter to delete one Histoires_publications
     *   }
     * })
     * 
    **/
    delete<T extends histoires_publicationsDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsDeleteArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Histoires_publications.
     * @param {histoires_publicationsUpdateArgs} args - Arguments to update one Histoires_publications.
     * @example
     * // Update one Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends histoires_publicationsUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsUpdateArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Histoires_publications.
     * @param {histoires_publicationsDeleteManyArgs} args - Arguments to filter Histoires_publications to delete.
     * @example
     * // Delete a few Histoires_publications
     * const { count } = await prisma.histoires_publications.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends histoires_publicationsDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, histoires_publicationsDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Histoires_publications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends histoires_publicationsUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Histoires_publications.
     * @param {histoires_publicationsUpsertArgs} args - Arguments to update or create a Histoires_publications.
     * @example
     * // Update or create a Histoires_publications
     * const histoires_publications = await prisma.histoires_publications.upsert({
     *   create: {
     *     // ... data to create a Histoires_publications
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Histoires_publications we want to update
     *   }
     * })
    **/
    upsert<T extends histoires_publicationsUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, histoires_publicationsUpsertArgs<ExtArgs>>
    ): Prisma__histoires_publicationsClient<$Result.GetResult<Prisma.$histoires_publicationsPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Histoires_publications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsCountArgs} args - Arguments to filter Histoires_publications to count.
     * @example
     * // Count the number of Histoires_publications
     * const count = await prisma.histoires_publications.count({
     *   where: {
     *     // ... the filter for the Histoires_publications we want to count
     *   }
     * })
    **/
    count<T extends histoires_publicationsCountArgs>(
      args?: Subset<T, histoires_publicationsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Histoires_publicationsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Histoires_publications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Histoires_publicationsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Histoires_publicationsAggregateArgs>(args: Subset<T, Histoires_publicationsAggregateArgs>): Prisma.PrismaPromise<GetHistoires_publicationsAggregateType<T>>

    /**
     * Group by Histoires_publications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {histoires_publicationsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends histoires_publicationsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: histoires_publicationsGroupByArgs['orderBy'] }
        : { orderBy?: histoires_publicationsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, histoires_publicationsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetHistoires_publicationsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the histoires_publications model
   */
  readonly fields: histoires_publicationsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for histoires_publications.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__histoires_publicationsClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the histoires_publications model
   */ 
  interface histoires_publicationsFieldRefs {
    readonly ID: FieldRef<"histoires_publications", 'Int'>
    readonly storycode: FieldRef<"histoires_publications", 'String'>
    readonly publicationcode: FieldRef<"histoires_publications", 'String'>
    readonly issuenumber: FieldRef<"histoires_publications", 'String'>
    readonly issuecode: FieldRef<"histoires_publications", 'String'>
    readonly oldestdate: FieldRef<"histoires_publications", 'DateTime'>
  }
    

  // Custom InputTypes

  /**
   * histoires_publications findUnique
   */
  export type histoires_publicationsFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter, which histoires_publications to fetch.
     */
    where: histoires_publicationsWhereUniqueInput
  }


  /**
   * histoires_publications findUniqueOrThrow
   */
  export type histoires_publicationsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter, which histoires_publications to fetch.
     */
    where: histoires_publicationsWhereUniqueInput
  }


  /**
   * histoires_publications findFirst
   */
  export type histoires_publicationsFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter, which histoires_publications to fetch.
     */
    where?: histoires_publicationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of histoires_publications to fetch.
     */
    orderBy?: histoires_publicationsOrderByWithRelationInput | histoires_publicationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for histoires_publications.
     */
    cursor?: histoires_publicationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` histoires_publications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` histoires_publications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of histoires_publications.
     */
    distinct?: Histoires_publicationsScalarFieldEnum | Histoires_publicationsScalarFieldEnum[]
  }


  /**
   * histoires_publications findFirstOrThrow
   */
  export type histoires_publicationsFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter, which histoires_publications to fetch.
     */
    where?: histoires_publicationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of histoires_publications to fetch.
     */
    orderBy?: histoires_publicationsOrderByWithRelationInput | histoires_publicationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for histoires_publications.
     */
    cursor?: histoires_publicationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` histoires_publications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` histoires_publications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of histoires_publications.
     */
    distinct?: Histoires_publicationsScalarFieldEnum | Histoires_publicationsScalarFieldEnum[]
  }


  /**
   * histoires_publications findMany
   */
  export type histoires_publicationsFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter, which histoires_publications to fetch.
     */
    where?: histoires_publicationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of histoires_publications to fetch.
     */
    orderBy?: histoires_publicationsOrderByWithRelationInput | histoires_publicationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing histoires_publications.
     */
    cursor?: histoires_publicationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` histoires_publications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` histoires_publications.
     */
    skip?: number
    distinct?: Histoires_publicationsScalarFieldEnum | Histoires_publicationsScalarFieldEnum[]
  }


  /**
   * histoires_publications create
   */
  export type histoires_publicationsCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * The data needed to create a histoires_publications.
     */
    data: XOR<histoires_publicationsCreateInput, histoires_publicationsUncheckedCreateInput>
  }


  /**
   * histoires_publications createMany
   */
  export type histoires_publicationsCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many histoires_publications.
     */
    data: histoires_publicationsCreateManyInput | histoires_publicationsCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * histoires_publications update
   */
  export type histoires_publicationsUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * The data needed to update a histoires_publications.
     */
    data: XOR<histoires_publicationsUpdateInput, histoires_publicationsUncheckedUpdateInput>
    /**
     * Choose, which histoires_publications to update.
     */
    where: histoires_publicationsWhereUniqueInput
  }


  /**
   * histoires_publications updateMany
   */
  export type histoires_publicationsUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update histoires_publications.
     */
    data: XOR<histoires_publicationsUpdateManyMutationInput, histoires_publicationsUncheckedUpdateManyInput>
    /**
     * Filter which histoires_publications to update
     */
    where?: histoires_publicationsWhereInput
  }


  /**
   * histoires_publications upsert
   */
  export type histoires_publicationsUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * The filter to search for the histoires_publications to update in case it exists.
     */
    where: histoires_publicationsWhereUniqueInput
    /**
     * In case the histoires_publications found by the `where` argument doesn't exist, create a new histoires_publications with this data.
     */
    create: XOR<histoires_publicationsCreateInput, histoires_publicationsUncheckedCreateInput>
    /**
     * In case the histoires_publications was found with the provided `where` argument, update it with this data.
     */
    update: XOR<histoires_publicationsUpdateInput, histoires_publicationsUncheckedUpdateInput>
  }


  /**
   * histoires_publications delete
   */
  export type histoires_publicationsDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
    /**
     * Filter which histoires_publications to delete.
     */
    where: histoires_publicationsWhereUniqueInput
  }


  /**
   * histoires_publications deleteMany
   */
  export type histoires_publicationsDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which histoires_publications to delete
     */
    where?: histoires_publicationsWhereInput
  }


  /**
   * histoires_publications without action
   */
  export type histoires_publicationsDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the histoires_publications
     */
    select?: histoires_publicationsSelect<ExtArgs> | null
  }



  /**
   * Model missingStoryForUser
   */

  export type AggregateMissingStoryForUser = {
    _count: MissingStoryForUserCountAggregateOutputType | null
    _avg: MissingStoryForUserAvgAggregateOutputType | null
    _sum: MissingStoryForUserSumAggregateOutputType | null
    _min: MissingStoryForUserMinAggregateOutputType | null
    _max: MissingStoryForUserMaxAggregateOutputType | null
  }

  export type MissingStoryForUserAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type MissingStoryForUserSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type MissingStoryForUserMinAggregateOutputType = {
    id: number | null
    userId: number | null
    personcode: string | null
    storycode: string | null
  }

  export type MissingStoryForUserMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    personcode: string | null
    storycode: string | null
  }

  export type MissingStoryForUserCountAggregateOutputType = {
    id: number
    userId: number
    personcode: number
    storycode: number
    _all: number
  }


  export type MissingStoryForUserAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type MissingStoryForUserSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type MissingStoryForUserMinAggregateInputType = {
    id?: true
    userId?: true
    personcode?: true
    storycode?: true
  }

  export type MissingStoryForUserMaxAggregateInputType = {
    id?: true
    userId?: true
    personcode?: true
    storycode?: true
  }

  export type MissingStoryForUserCountAggregateInputType = {
    id?: true
    userId?: true
    personcode?: true
    storycode?: true
    _all?: true
  }

  export type MissingStoryForUserAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which missingStoryForUser to aggregate.
     */
    where?: missingStoryForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of missingStoryForUsers to fetch.
     */
    orderBy?: missingStoryForUserOrderByWithRelationInput | missingStoryForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: missingStoryForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` missingStoryForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` missingStoryForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned missingStoryForUsers
    **/
    _count?: true | MissingStoryForUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MissingStoryForUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MissingStoryForUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MissingStoryForUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MissingStoryForUserMaxAggregateInputType
  }

  export type GetMissingStoryForUserAggregateType<T extends MissingStoryForUserAggregateArgs> = {
        [P in keyof T & keyof AggregateMissingStoryForUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMissingStoryForUser[P]>
      : GetScalarType<T[P], AggregateMissingStoryForUser[P]>
  }




  export type missingStoryForUserGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: missingStoryForUserWhereInput
    orderBy?: missingStoryForUserOrderByWithAggregationInput | missingStoryForUserOrderByWithAggregationInput[]
    by: MissingStoryForUserScalarFieldEnum[] | MissingStoryForUserScalarFieldEnum
    having?: missingStoryForUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MissingStoryForUserCountAggregateInputType | true
    _avg?: MissingStoryForUserAvgAggregateInputType
    _sum?: MissingStoryForUserSumAggregateInputType
    _min?: MissingStoryForUserMinAggregateInputType
    _max?: MissingStoryForUserMaxAggregateInputType
  }

  export type MissingStoryForUserGroupByOutputType = {
    id: number
    userId: number
    personcode: string
    storycode: string
    _count: MissingStoryForUserCountAggregateOutputType | null
    _avg: MissingStoryForUserAvgAggregateOutputType | null
    _sum: MissingStoryForUserSumAggregateOutputType | null
    _min: MissingStoryForUserMinAggregateOutputType | null
    _max: MissingStoryForUserMaxAggregateOutputType | null
  }

  type GetMissingStoryForUserGroupByPayload<T extends missingStoryForUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MissingStoryForUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MissingStoryForUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MissingStoryForUserGroupByOutputType[P]>
            : GetScalarType<T[P], MissingStoryForUserGroupByOutputType[P]>
        }
      >
    >


  export type missingStoryForUserSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    personcode?: boolean
    storycode?: boolean
  }, ExtArgs["result"]["missingStoryForUser"]>

  export type missingStoryForUserSelectScalar = {
    id?: boolean
    userId?: boolean
    personcode?: boolean
    storycode?: boolean
  }


  export type $missingStoryForUserPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "missingStoryForUser"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      userId: number
      personcode: string
      storycode: string
    }, ExtArgs["result"]["missingStoryForUser"]>
    composites: {}
  }


  type missingStoryForUserGetPayload<S extends boolean | null | undefined | missingStoryForUserDefaultArgs> = $Result.GetResult<Prisma.$missingStoryForUserPayload, S>

  type missingStoryForUserCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<missingStoryForUserFindManyArgs, 'select' | 'include'> & {
      select?: MissingStoryForUserCountAggregateInputType | true
    }

  export interface missingStoryForUserDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['missingStoryForUser'], meta: { name: 'missingStoryForUser' } }
    /**
     * Find zero or one MissingStoryForUser that matches the filter.
     * @param {missingStoryForUserFindUniqueArgs} args - Arguments to find a MissingStoryForUser
     * @example
     * // Get one MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends missingStoryForUserFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserFindUniqueArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one MissingStoryForUser that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {missingStoryForUserFindUniqueOrThrowArgs} args - Arguments to find a MissingStoryForUser
     * @example
     * // Get one MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends missingStoryForUserFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first MissingStoryForUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserFindFirstArgs} args - Arguments to find a MissingStoryForUser
     * @example
     * // Get one MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends missingStoryForUserFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserFindFirstArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first MissingStoryForUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserFindFirstOrThrowArgs} args - Arguments to find a MissingStoryForUser
     * @example
     * // Get one MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends missingStoryForUserFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more MissingStoryForUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MissingStoryForUsers
     * const missingStoryForUsers = await prisma.missingStoryForUser.findMany()
     * 
     * // Get first 10 MissingStoryForUsers
     * const missingStoryForUsers = await prisma.missingStoryForUser.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const missingStoryForUserWithIdOnly = await prisma.missingStoryForUser.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends missingStoryForUserFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a MissingStoryForUser.
     * @param {missingStoryForUserCreateArgs} args - Arguments to create a MissingStoryForUser.
     * @example
     * // Create one MissingStoryForUser
     * const MissingStoryForUser = await prisma.missingStoryForUser.create({
     *   data: {
     *     // ... data to create a MissingStoryForUser
     *   }
     * })
     * 
    **/
    create<T extends missingStoryForUserCreateArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserCreateArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many MissingStoryForUsers.
     *     @param {missingStoryForUserCreateManyArgs} args - Arguments to create many MissingStoryForUsers.
     *     @example
     *     // Create many MissingStoryForUsers
     *     const missingStoryForUser = await prisma.missingStoryForUser.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends missingStoryForUserCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MissingStoryForUser.
     * @param {missingStoryForUserDeleteArgs} args - Arguments to delete one MissingStoryForUser.
     * @example
     * // Delete one MissingStoryForUser
     * const MissingStoryForUser = await prisma.missingStoryForUser.delete({
     *   where: {
     *     // ... filter to delete one MissingStoryForUser
     *   }
     * })
     * 
    **/
    delete<T extends missingStoryForUserDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserDeleteArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one MissingStoryForUser.
     * @param {missingStoryForUserUpdateArgs} args - Arguments to update one MissingStoryForUser.
     * @example
     * // Update one MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends missingStoryForUserUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserUpdateArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more MissingStoryForUsers.
     * @param {missingStoryForUserDeleteManyArgs} args - Arguments to filter MissingStoryForUsers to delete.
     * @example
     * // Delete a few MissingStoryForUsers
     * const { count } = await prisma.missingStoryForUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends missingStoryForUserDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, missingStoryForUserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MissingStoryForUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MissingStoryForUsers
     * const missingStoryForUser = await prisma.missingStoryForUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends missingStoryForUserUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MissingStoryForUser.
     * @param {missingStoryForUserUpsertArgs} args - Arguments to update or create a MissingStoryForUser.
     * @example
     * // Update or create a MissingStoryForUser
     * const missingStoryForUser = await prisma.missingStoryForUser.upsert({
     *   create: {
     *     // ... data to create a MissingStoryForUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MissingStoryForUser we want to update
     *   }
     * })
    **/
    upsert<T extends missingStoryForUserUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, missingStoryForUserUpsertArgs<ExtArgs>>
    ): Prisma__missingStoryForUserClient<$Result.GetResult<Prisma.$missingStoryForUserPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of MissingStoryForUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserCountArgs} args - Arguments to filter MissingStoryForUsers to count.
     * @example
     * // Count the number of MissingStoryForUsers
     * const count = await prisma.missingStoryForUser.count({
     *   where: {
     *     // ... the filter for the MissingStoryForUsers we want to count
     *   }
     * })
    **/
    count<T extends missingStoryForUserCountArgs>(
      args?: Subset<T, missingStoryForUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MissingStoryForUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MissingStoryForUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MissingStoryForUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MissingStoryForUserAggregateArgs>(args: Subset<T, MissingStoryForUserAggregateArgs>): Prisma.PrismaPromise<GetMissingStoryForUserAggregateType<T>>

    /**
     * Group by MissingStoryForUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {missingStoryForUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends missingStoryForUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: missingStoryForUserGroupByArgs['orderBy'] }
        : { orderBy?: missingStoryForUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, missingStoryForUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMissingStoryForUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the missingStoryForUser model
   */
  readonly fields: missingStoryForUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for missingStoryForUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__missingStoryForUserClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the missingStoryForUser model
   */ 
  interface missingStoryForUserFieldRefs {
    readonly id: FieldRef<"missingStoryForUser", 'Int'>
    readonly userId: FieldRef<"missingStoryForUser", 'Int'>
    readonly personcode: FieldRef<"missingStoryForUser", 'String'>
    readonly storycode: FieldRef<"missingStoryForUser", 'String'>
  }
    

  // Custom InputTypes

  /**
   * missingStoryForUser findUnique
   */
  export type missingStoryForUserFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter, which missingStoryForUser to fetch.
     */
    where: missingStoryForUserWhereUniqueInput
  }


  /**
   * missingStoryForUser findUniqueOrThrow
   */
  export type missingStoryForUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter, which missingStoryForUser to fetch.
     */
    where: missingStoryForUserWhereUniqueInput
  }


  /**
   * missingStoryForUser findFirst
   */
  export type missingStoryForUserFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter, which missingStoryForUser to fetch.
     */
    where?: missingStoryForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of missingStoryForUsers to fetch.
     */
    orderBy?: missingStoryForUserOrderByWithRelationInput | missingStoryForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for missingStoryForUsers.
     */
    cursor?: missingStoryForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` missingStoryForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` missingStoryForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of missingStoryForUsers.
     */
    distinct?: MissingStoryForUserScalarFieldEnum | MissingStoryForUserScalarFieldEnum[]
  }


  /**
   * missingStoryForUser findFirstOrThrow
   */
  export type missingStoryForUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter, which missingStoryForUser to fetch.
     */
    where?: missingStoryForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of missingStoryForUsers to fetch.
     */
    orderBy?: missingStoryForUserOrderByWithRelationInput | missingStoryForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for missingStoryForUsers.
     */
    cursor?: missingStoryForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` missingStoryForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` missingStoryForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of missingStoryForUsers.
     */
    distinct?: MissingStoryForUserScalarFieldEnum | MissingStoryForUserScalarFieldEnum[]
  }


  /**
   * missingStoryForUser findMany
   */
  export type missingStoryForUserFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter, which missingStoryForUsers to fetch.
     */
    where?: missingStoryForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of missingStoryForUsers to fetch.
     */
    orderBy?: missingStoryForUserOrderByWithRelationInput | missingStoryForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing missingStoryForUsers.
     */
    cursor?: missingStoryForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` missingStoryForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` missingStoryForUsers.
     */
    skip?: number
    distinct?: MissingStoryForUserScalarFieldEnum | MissingStoryForUserScalarFieldEnum[]
  }


  /**
   * missingStoryForUser create
   */
  export type missingStoryForUserCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * The data needed to create a missingStoryForUser.
     */
    data: XOR<missingStoryForUserCreateInput, missingStoryForUserUncheckedCreateInput>
  }


  /**
   * missingStoryForUser createMany
   */
  export type missingStoryForUserCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many missingStoryForUsers.
     */
    data: missingStoryForUserCreateManyInput | missingStoryForUserCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * missingStoryForUser update
   */
  export type missingStoryForUserUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * The data needed to update a missingStoryForUser.
     */
    data: XOR<missingStoryForUserUpdateInput, missingStoryForUserUncheckedUpdateInput>
    /**
     * Choose, which missingStoryForUser to update.
     */
    where: missingStoryForUserWhereUniqueInput
  }


  /**
   * missingStoryForUser updateMany
   */
  export type missingStoryForUserUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update missingStoryForUsers.
     */
    data: XOR<missingStoryForUserUpdateManyMutationInput, missingStoryForUserUncheckedUpdateManyInput>
    /**
     * Filter which missingStoryForUsers to update
     */
    where?: missingStoryForUserWhereInput
  }


  /**
   * missingStoryForUser upsert
   */
  export type missingStoryForUserUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * The filter to search for the missingStoryForUser to update in case it exists.
     */
    where: missingStoryForUserWhereUniqueInput
    /**
     * In case the missingStoryForUser found by the `where` argument doesn't exist, create a new missingStoryForUser with this data.
     */
    create: XOR<missingStoryForUserCreateInput, missingStoryForUserUncheckedCreateInput>
    /**
     * In case the missingStoryForUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<missingStoryForUserUpdateInput, missingStoryForUserUncheckedUpdateInput>
  }


  /**
   * missingStoryForUser delete
   */
  export type missingStoryForUserDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
    /**
     * Filter which missingStoryForUser to delete.
     */
    where: missingStoryForUserWhereUniqueInput
  }


  /**
   * missingStoryForUser deleteMany
   */
  export type missingStoryForUserDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which missingStoryForUsers to delete
     */
    where?: missingStoryForUserWhereInput
  }


  /**
   * missingStoryForUser without action
   */
  export type missingStoryForUserDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the missingStoryForUser
     */
    select?: missingStoryForUserSelect<ExtArgs> | null
  }



  /**
   * Model utilisateurs_publications_manquantes
   */

  export type AggregateUtilisateurs_publications_manquantes = {
    _count: Utilisateurs_publications_manquantesCountAggregateOutputType | null
    _avg: Utilisateurs_publications_manquantesAvgAggregateOutputType | null
    _sum: Utilisateurs_publications_manquantesSumAggregateOutputType | null
    _min: Utilisateurs_publications_manquantesMinAggregateOutputType | null
    _max: Utilisateurs_publications_manquantesMaxAggregateOutputType | null
  }

  export type Utilisateurs_publications_manquantesAvgAggregateOutputType = {
    ID: number | null
    ID_User: number | null
    Notation: number | null
  }

  export type Utilisateurs_publications_manquantesSumAggregateOutputType = {
    ID: number | null
    ID_User: number | null
    Notation: number | null
  }

  export type Utilisateurs_publications_manquantesMinAggregateOutputType = {
    ID: number | null
    ID_User: number | null
    personcode: string | null
    storycode: string | null
    publicationcode: string | null
    issuenumber: string | null
    oldestdate: Date | null
    Notation: number | null
  }

  export type Utilisateurs_publications_manquantesMaxAggregateOutputType = {
    ID: number | null
    ID_User: number | null
    personcode: string | null
    storycode: string | null
    publicationcode: string | null
    issuenumber: string | null
    oldestdate: Date | null
    Notation: number | null
  }

  export type Utilisateurs_publications_manquantesCountAggregateOutputType = {
    ID: number
    ID_User: number
    personcode: number
    storycode: number
    publicationcode: number
    issuenumber: number
    oldestdate: number
    Notation: number
    _all: number
  }


  export type Utilisateurs_publications_manquantesAvgAggregateInputType = {
    ID?: true
    ID_User?: true
    Notation?: true
  }

  export type Utilisateurs_publications_manquantesSumAggregateInputType = {
    ID?: true
    ID_User?: true
    Notation?: true
  }

  export type Utilisateurs_publications_manquantesMinAggregateInputType = {
    ID?: true
    ID_User?: true
    personcode?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    Notation?: true
  }

  export type Utilisateurs_publications_manquantesMaxAggregateInputType = {
    ID?: true
    ID_User?: true
    personcode?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    Notation?: true
  }

  export type Utilisateurs_publications_manquantesCountAggregateInputType = {
    ID?: true
    ID_User?: true
    personcode?: true
    storycode?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    Notation?: true
    _all?: true
  }

  export type Utilisateurs_publications_manquantesAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which utilisateurs_publications_manquantes to aggregate.
     */
    where?: utilisateurs_publications_manquantesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of utilisateurs_publications_manquantes to fetch.
     */
    orderBy?: utilisateurs_publications_manquantesOrderByWithRelationInput | utilisateurs_publications_manquantesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: utilisateurs_publications_manquantesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` utilisateurs_publications_manquantes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` utilisateurs_publications_manquantes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned utilisateurs_publications_manquantes
    **/
    _count?: true | Utilisateurs_publications_manquantesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Utilisateurs_publications_manquantesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Utilisateurs_publications_manquantesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Utilisateurs_publications_manquantesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Utilisateurs_publications_manquantesMaxAggregateInputType
  }

  export type GetUtilisateurs_publications_manquantesAggregateType<T extends Utilisateurs_publications_manquantesAggregateArgs> = {
        [P in keyof T & keyof AggregateUtilisateurs_publications_manquantes]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUtilisateurs_publications_manquantes[P]>
      : GetScalarType<T[P], AggregateUtilisateurs_publications_manquantes[P]>
  }




  export type utilisateurs_publications_manquantesGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: utilisateurs_publications_manquantesWhereInput
    orderBy?: utilisateurs_publications_manquantesOrderByWithAggregationInput | utilisateurs_publications_manquantesOrderByWithAggregationInput[]
    by: Utilisateurs_publications_manquantesScalarFieldEnum[] | Utilisateurs_publications_manquantesScalarFieldEnum
    having?: utilisateurs_publications_manquantesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Utilisateurs_publications_manquantesCountAggregateInputType | true
    _avg?: Utilisateurs_publications_manquantesAvgAggregateInputType
    _sum?: Utilisateurs_publications_manquantesSumAggregateInputType
    _min?: Utilisateurs_publications_manquantesMinAggregateInputType
    _max?: Utilisateurs_publications_manquantesMaxAggregateInputType
  }

  export type Utilisateurs_publications_manquantesGroupByOutputType = {
    ID: number
    ID_User: number
    personcode: string
    storycode: string
    publicationcode: string
    issuenumber: string
    oldestdate: Date | null
    Notation: number
    _count: Utilisateurs_publications_manquantesCountAggregateOutputType | null
    _avg: Utilisateurs_publications_manquantesAvgAggregateOutputType | null
    _sum: Utilisateurs_publications_manquantesSumAggregateOutputType | null
    _min: Utilisateurs_publications_manquantesMinAggregateOutputType | null
    _max: Utilisateurs_publications_manquantesMaxAggregateOutputType | null
  }

  type GetUtilisateurs_publications_manquantesGroupByPayload<T extends utilisateurs_publications_manquantesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Utilisateurs_publications_manquantesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Utilisateurs_publications_manquantesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Utilisateurs_publications_manquantesGroupByOutputType[P]>
            : GetScalarType<T[P], Utilisateurs_publications_manquantesGroupByOutputType[P]>
        }
      >
    >


  export type utilisateurs_publications_manquantesSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ID?: boolean
    ID_User?: boolean
    personcode?: boolean
    storycode?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    oldestdate?: boolean
    Notation?: boolean
  }, ExtArgs["result"]["utilisateurs_publications_manquantes"]>

  export type utilisateurs_publications_manquantesSelectScalar = {
    ID?: boolean
    ID_User?: boolean
    personcode?: boolean
    storycode?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    oldestdate?: boolean
    Notation?: boolean
  }


  export type $utilisateurs_publications_manquantesPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "utilisateurs_publications_manquantes"
    objects: {}
    scalars: $Extensions.GetResult<{
      ID: number
      ID_User: number
      personcode: string
      storycode: string
      publicationcode: string
      issuenumber: string
      oldestdate: Date | null
      Notation: number
    }, ExtArgs["result"]["utilisateurs_publications_manquantes"]>
    composites: {}
  }


  type utilisateurs_publications_manquantesGetPayload<S extends boolean | null | undefined | utilisateurs_publications_manquantesDefaultArgs> = $Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload, S>

  type utilisateurs_publications_manquantesCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<utilisateurs_publications_manquantesFindManyArgs, 'select' | 'include'> & {
      select?: Utilisateurs_publications_manquantesCountAggregateInputType | true
    }

  export interface utilisateurs_publications_manquantesDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['utilisateurs_publications_manquantes'], meta: { name: 'utilisateurs_publications_manquantes' } }
    /**
     * Find zero or one Utilisateurs_publications_manquantes that matches the filter.
     * @param {utilisateurs_publications_manquantesFindUniqueArgs} args - Arguments to find a Utilisateurs_publications_manquantes
     * @example
     * // Get one Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends utilisateurs_publications_manquantesFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesFindUniqueArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Utilisateurs_publications_manquantes that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {utilisateurs_publications_manquantesFindUniqueOrThrowArgs} args - Arguments to find a Utilisateurs_publications_manquantes
     * @example
     * // Get one Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends utilisateurs_publications_manquantesFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Utilisateurs_publications_manquantes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesFindFirstArgs} args - Arguments to find a Utilisateurs_publications_manquantes
     * @example
     * // Get one Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends utilisateurs_publications_manquantesFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesFindFirstArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Utilisateurs_publications_manquantes that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesFindFirstOrThrowArgs} args - Arguments to find a Utilisateurs_publications_manquantes
     * @example
     * // Get one Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends utilisateurs_publications_manquantesFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Utilisateurs_publications_manquantes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findMany()
     * 
     * // Get first 10 Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.findMany({ take: 10 })
     * 
     * // Only select the `ID`
     * const utilisateurs_publications_manquantesWithIDOnly = await prisma.utilisateurs_publications_manquantes.findMany({ select: { ID: true } })
     * 
    **/
    findMany<T extends utilisateurs_publications_manquantesFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Utilisateurs_publications_manquantes.
     * @param {utilisateurs_publications_manquantesCreateArgs} args - Arguments to create a Utilisateurs_publications_manquantes.
     * @example
     * // Create one Utilisateurs_publications_manquantes
     * const Utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.create({
     *   data: {
     *     // ... data to create a Utilisateurs_publications_manquantes
     *   }
     * })
     * 
    **/
    create<T extends utilisateurs_publications_manquantesCreateArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesCreateArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Utilisateurs_publications_manquantes.
     *     @param {utilisateurs_publications_manquantesCreateManyArgs} args - Arguments to create many Utilisateurs_publications_manquantes.
     *     @example
     *     // Create many Utilisateurs_publications_manquantes
     *     const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends utilisateurs_publications_manquantesCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Utilisateurs_publications_manquantes.
     * @param {utilisateurs_publications_manquantesDeleteArgs} args - Arguments to delete one Utilisateurs_publications_manquantes.
     * @example
     * // Delete one Utilisateurs_publications_manquantes
     * const Utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.delete({
     *   where: {
     *     // ... filter to delete one Utilisateurs_publications_manquantes
     *   }
     * })
     * 
    **/
    delete<T extends utilisateurs_publications_manquantesDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesDeleteArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Utilisateurs_publications_manquantes.
     * @param {utilisateurs_publications_manquantesUpdateArgs} args - Arguments to update one Utilisateurs_publications_manquantes.
     * @example
     * // Update one Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends utilisateurs_publications_manquantesUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesUpdateArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Utilisateurs_publications_manquantes.
     * @param {utilisateurs_publications_manquantesDeleteManyArgs} args - Arguments to filter Utilisateurs_publications_manquantes to delete.
     * @example
     * // Delete a few Utilisateurs_publications_manquantes
     * const { count } = await prisma.utilisateurs_publications_manquantes.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends utilisateurs_publications_manquantesDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, utilisateurs_publications_manquantesDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Utilisateurs_publications_manquantes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends utilisateurs_publications_manquantesUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Utilisateurs_publications_manquantes.
     * @param {utilisateurs_publications_manquantesUpsertArgs} args - Arguments to update or create a Utilisateurs_publications_manquantes.
     * @example
     * // Update or create a Utilisateurs_publications_manquantes
     * const utilisateurs_publications_manquantes = await prisma.utilisateurs_publications_manquantes.upsert({
     *   create: {
     *     // ... data to create a Utilisateurs_publications_manquantes
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Utilisateurs_publications_manquantes we want to update
     *   }
     * })
    **/
    upsert<T extends utilisateurs_publications_manquantesUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, utilisateurs_publications_manquantesUpsertArgs<ExtArgs>>
    ): Prisma__utilisateurs_publications_manquantesClient<$Result.GetResult<Prisma.$utilisateurs_publications_manquantesPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Utilisateurs_publications_manquantes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesCountArgs} args - Arguments to filter Utilisateurs_publications_manquantes to count.
     * @example
     * // Count the number of Utilisateurs_publications_manquantes
     * const count = await prisma.utilisateurs_publications_manquantes.count({
     *   where: {
     *     // ... the filter for the Utilisateurs_publications_manquantes we want to count
     *   }
     * })
    **/
    count<T extends utilisateurs_publications_manquantesCountArgs>(
      args?: Subset<T, utilisateurs_publications_manquantesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Utilisateurs_publications_manquantesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Utilisateurs_publications_manquantes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Utilisateurs_publications_manquantesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Utilisateurs_publications_manquantesAggregateArgs>(args: Subset<T, Utilisateurs_publications_manquantesAggregateArgs>): Prisma.PrismaPromise<GetUtilisateurs_publications_manquantesAggregateType<T>>

    /**
     * Group by Utilisateurs_publications_manquantes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {utilisateurs_publications_manquantesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends utilisateurs_publications_manquantesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: utilisateurs_publications_manquantesGroupByArgs['orderBy'] }
        : { orderBy?: utilisateurs_publications_manquantesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, utilisateurs_publications_manquantesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUtilisateurs_publications_manquantesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the utilisateurs_publications_manquantes model
   */
  readonly fields: utilisateurs_publications_manquantesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for utilisateurs_publications_manquantes.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__utilisateurs_publications_manquantesClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the utilisateurs_publications_manquantes model
   */ 
  interface utilisateurs_publications_manquantesFieldRefs {
    readonly ID: FieldRef<"utilisateurs_publications_manquantes", 'Int'>
    readonly ID_User: FieldRef<"utilisateurs_publications_manquantes", 'Int'>
    readonly personcode: FieldRef<"utilisateurs_publications_manquantes", 'String'>
    readonly storycode: FieldRef<"utilisateurs_publications_manquantes", 'String'>
    readonly publicationcode: FieldRef<"utilisateurs_publications_manquantes", 'String'>
    readonly issuenumber: FieldRef<"utilisateurs_publications_manquantes", 'String'>
    readonly oldestdate: FieldRef<"utilisateurs_publications_manquantes", 'DateTime'>
    readonly Notation: FieldRef<"utilisateurs_publications_manquantes", 'Int'>
  }
    

  // Custom InputTypes

  /**
   * utilisateurs_publications_manquantes findUnique
   */
  export type utilisateurs_publications_manquantesFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter, which utilisateurs_publications_manquantes to fetch.
     */
    where: utilisateurs_publications_manquantesWhereUniqueInput
  }


  /**
   * utilisateurs_publications_manquantes findUniqueOrThrow
   */
  export type utilisateurs_publications_manquantesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter, which utilisateurs_publications_manquantes to fetch.
     */
    where: utilisateurs_publications_manquantesWhereUniqueInput
  }


  /**
   * utilisateurs_publications_manquantes findFirst
   */
  export type utilisateurs_publications_manquantesFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter, which utilisateurs_publications_manquantes to fetch.
     */
    where?: utilisateurs_publications_manquantesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of utilisateurs_publications_manquantes to fetch.
     */
    orderBy?: utilisateurs_publications_manquantesOrderByWithRelationInput | utilisateurs_publications_manquantesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for utilisateurs_publications_manquantes.
     */
    cursor?: utilisateurs_publications_manquantesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` utilisateurs_publications_manquantes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` utilisateurs_publications_manquantes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of utilisateurs_publications_manquantes.
     */
    distinct?: Utilisateurs_publications_manquantesScalarFieldEnum | Utilisateurs_publications_manquantesScalarFieldEnum[]
  }


  /**
   * utilisateurs_publications_manquantes findFirstOrThrow
   */
  export type utilisateurs_publications_manquantesFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter, which utilisateurs_publications_manquantes to fetch.
     */
    where?: utilisateurs_publications_manquantesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of utilisateurs_publications_manquantes to fetch.
     */
    orderBy?: utilisateurs_publications_manquantesOrderByWithRelationInput | utilisateurs_publications_manquantesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for utilisateurs_publications_manquantes.
     */
    cursor?: utilisateurs_publications_manquantesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` utilisateurs_publications_manquantes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` utilisateurs_publications_manquantes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of utilisateurs_publications_manquantes.
     */
    distinct?: Utilisateurs_publications_manquantesScalarFieldEnum | Utilisateurs_publications_manquantesScalarFieldEnum[]
  }


  /**
   * utilisateurs_publications_manquantes findMany
   */
  export type utilisateurs_publications_manquantesFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter, which utilisateurs_publications_manquantes to fetch.
     */
    where?: utilisateurs_publications_manquantesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of utilisateurs_publications_manquantes to fetch.
     */
    orderBy?: utilisateurs_publications_manquantesOrderByWithRelationInput | utilisateurs_publications_manquantesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing utilisateurs_publications_manquantes.
     */
    cursor?: utilisateurs_publications_manquantesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` utilisateurs_publications_manquantes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` utilisateurs_publications_manquantes.
     */
    skip?: number
    distinct?: Utilisateurs_publications_manquantesScalarFieldEnum | Utilisateurs_publications_manquantesScalarFieldEnum[]
  }


  /**
   * utilisateurs_publications_manquantes create
   */
  export type utilisateurs_publications_manquantesCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * The data needed to create a utilisateurs_publications_manquantes.
     */
    data: XOR<utilisateurs_publications_manquantesCreateInput, utilisateurs_publications_manquantesUncheckedCreateInput>
  }


  /**
   * utilisateurs_publications_manquantes createMany
   */
  export type utilisateurs_publications_manquantesCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many utilisateurs_publications_manquantes.
     */
    data: utilisateurs_publications_manquantesCreateManyInput | utilisateurs_publications_manquantesCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * utilisateurs_publications_manquantes update
   */
  export type utilisateurs_publications_manquantesUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * The data needed to update a utilisateurs_publications_manquantes.
     */
    data: XOR<utilisateurs_publications_manquantesUpdateInput, utilisateurs_publications_manquantesUncheckedUpdateInput>
    /**
     * Choose, which utilisateurs_publications_manquantes to update.
     */
    where: utilisateurs_publications_manquantesWhereUniqueInput
  }


  /**
   * utilisateurs_publications_manquantes updateMany
   */
  export type utilisateurs_publications_manquantesUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update utilisateurs_publications_manquantes.
     */
    data: XOR<utilisateurs_publications_manquantesUpdateManyMutationInput, utilisateurs_publications_manquantesUncheckedUpdateManyInput>
    /**
     * Filter which utilisateurs_publications_manquantes to update
     */
    where?: utilisateurs_publications_manquantesWhereInput
  }


  /**
   * utilisateurs_publications_manquantes upsert
   */
  export type utilisateurs_publications_manquantesUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * The filter to search for the utilisateurs_publications_manquantes to update in case it exists.
     */
    where: utilisateurs_publications_manquantesWhereUniqueInput
    /**
     * In case the utilisateurs_publications_manquantes found by the `where` argument doesn't exist, create a new utilisateurs_publications_manquantes with this data.
     */
    create: XOR<utilisateurs_publications_manquantesCreateInput, utilisateurs_publications_manquantesUncheckedCreateInput>
    /**
     * In case the utilisateurs_publications_manquantes was found with the provided `where` argument, update it with this data.
     */
    update: XOR<utilisateurs_publications_manquantesUpdateInput, utilisateurs_publications_manquantesUncheckedUpdateInput>
  }


  /**
   * utilisateurs_publications_manquantes delete
   */
  export type utilisateurs_publications_manquantesDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
    /**
     * Filter which utilisateurs_publications_manquantes to delete.
     */
    where: utilisateurs_publications_manquantesWhereUniqueInput
  }


  /**
   * utilisateurs_publications_manquantes deleteMany
   */
  export type utilisateurs_publications_manquantesDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which utilisateurs_publications_manquantes to delete
     */
    where?: utilisateurs_publications_manquantesWhereInput
  }


  /**
   * utilisateurs_publications_manquantes without action
   */
  export type utilisateurs_publications_manquantesDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the utilisateurs_publications_manquantes
     */
    select?: utilisateurs_publications_manquantesSelect<ExtArgs> | null
  }



  /**
   * Model suggestedIssueForUser
   */

  export type AggregateSuggestedIssueForUser = {
    _count: SuggestedIssueForUserCountAggregateOutputType | null
    _avg: SuggestedIssueForUserAvgAggregateOutputType | null
    _sum: SuggestedIssueForUserSumAggregateOutputType | null
    _min: SuggestedIssueForUserMinAggregateOutputType | null
    _max: SuggestedIssueForUserMaxAggregateOutputType | null
  }

  export type SuggestedIssueForUserAvgAggregateOutputType = {
    ID: number | null
    userId: number | null
    score: number | null
  }

  export type SuggestedIssueForUserSumAggregateOutputType = {
    ID: number | null
    userId: number | null
    score: number | null
  }

  export type SuggestedIssueForUserMinAggregateOutputType = {
    ID: number | null
    userId: number | null
    publicationcode: string | null
    issuenumber: string | null
    oldestdate: Date | null
    score: number | null
  }

  export type SuggestedIssueForUserMaxAggregateOutputType = {
    ID: number | null
    userId: number | null
    publicationcode: string | null
    issuenumber: string | null
    oldestdate: Date | null
    score: number | null
  }

  export type SuggestedIssueForUserCountAggregateOutputType = {
    ID: number
    userId: number
    publicationcode: number
    issuenumber: number
    oldestdate: number
    score: number
    _all: number
  }


  export type SuggestedIssueForUserAvgAggregateInputType = {
    ID?: true
    userId?: true
    score?: true
  }

  export type SuggestedIssueForUserSumAggregateInputType = {
    ID?: true
    userId?: true
    score?: true
  }

  export type SuggestedIssueForUserMinAggregateInputType = {
    ID?: true
    userId?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    score?: true
  }

  export type SuggestedIssueForUserMaxAggregateInputType = {
    ID?: true
    userId?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    score?: true
  }

  export type SuggestedIssueForUserCountAggregateInputType = {
    ID?: true
    userId?: true
    publicationcode?: true
    issuenumber?: true
    oldestdate?: true
    score?: true
    _all?: true
  }

  export type SuggestedIssueForUserAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which suggestedIssueForUser to aggregate.
     */
    where?: suggestedIssueForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of suggestedIssueForUsers to fetch.
     */
    orderBy?: suggestedIssueForUserOrderByWithRelationInput | suggestedIssueForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: suggestedIssueForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` suggestedIssueForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` suggestedIssueForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned suggestedIssueForUsers
    **/
    _count?: true | SuggestedIssueForUserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SuggestedIssueForUserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SuggestedIssueForUserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuggestedIssueForUserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuggestedIssueForUserMaxAggregateInputType
  }

  export type GetSuggestedIssueForUserAggregateType<T extends SuggestedIssueForUserAggregateArgs> = {
        [P in keyof T & keyof AggregateSuggestedIssueForUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuggestedIssueForUser[P]>
      : GetScalarType<T[P], AggregateSuggestedIssueForUser[P]>
  }




  export type suggestedIssueForUserGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: suggestedIssueForUserWhereInput
    orderBy?: suggestedIssueForUserOrderByWithAggregationInput | suggestedIssueForUserOrderByWithAggregationInput[]
    by: SuggestedIssueForUserScalarFieldEnum[] | SuggestedIssueForUserScalarFieldEnum
    having?: suggestedIssueForUserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuggestedIssueForUserCountAggregateInputType | true
    _avg?: SuggestedIssueForUserAvgAggregateInputType
    _sum?: SuggestedIssueForUserSumAggregateInputType
    _min?: SuggestedIssueForUserMinAggregateInputType
    _max?: SuggestedIssueForUserMaxAggregateInputType
  }

  export type SuggestedIssueForUserGroupByOutputType = {
    ID: number
    userId: number
    publicationcode: string
    issuenumber: string
    oldestdate: Date | null
    score: number
    _count: SuggestedIssueForUserCountAggregateOutputType | null
    _avg: SuggestedIssueForUserAvgAggregateOutputType | null
    _sum: SuggestedIssueForUserSumAggregateOutputType | null
    _min: SuggestedIssueForUserMinAggregateOutputType | null
    _max: SuggestedIssueForUserMaxAggregateOutputType | null
  }

  type GetSuggestedIssueForUserGroupByPayload<T extends suggestedIssueForUserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuggestedIssueForUserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuggestedIssueForUserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuggestedIssueForUserGroupByOutputType[P]>
            : GetScalarType<T[P], SuggestedIssueForUserGroupByOutputType[P]>
        }
      >
    >


  export type suggestedIssueForUserSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    ID?: boolean
    userId?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    oldestdate?: boolean
    score?: boolean
  }, ExtArgs["result"]["suggestedIssueForUser"]>

  export type suggestedIssueForUserSelectScalar = {
    ID?: boolean
    userId?: boolean
    publicationcode?: boolean
    issuenumber?: boolean
    oldestdate?: boolean
    score?: boolean
  }


  export type $suggestedIssueForUserPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "suggestedIssueForUser"
    objects: {}
    scalars: $Extensions.GetResult<{
      ID: number
      userId: number
      publicationcode: string
      issuenumber: string
      oldestdate: Date | null
      score: number
    }, ExtArgs["result"]["suggestedIssueForUser"]>
    composites: {}
  }


  type suggestedIssueForUserGetPayload<S extends boolean | null | undefined | suggestedIssueForUserDefaultArgs> = $Result.GetResult<Prisma.$suggestedIssueForUserPayload, S>

  type suggestedIssueForUserCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<suggestedIssueForUserFindManyArgs, 'select' | 'include'> & {
      select?: SuggestedIssueForUserCountAggregateInputType | true
    }

  export interface suggestedIssueForUserDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['suggestedIssueForUser'], meta: { name: 'suggestedIssueForUser' } }
    /**
     * Find zero or one SuggestedIssueForUser that matches the filter.
     * @param {suggestedIssueForUserFindUniqueArgs} args - Arguments to find a SuggestedIssueForUser
     * @example
     * // Get one SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends suggestedIssueForUserFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserFindUniqueArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one SuggestedIssueForUser that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {suggestedIssueForUserFindUniqueOrThrowArgs} args - Arguments to find a SuggestedIssueForUser
     * @example
     * // Get one SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends suggestedIssueForUserFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first SuggestedIssueForUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserFindFirstArgs} args - Arguments to find a SuggestedIssueForUser
     * @example
     * // Get one SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends suggestedIssueForUserFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserFindFirstArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first SuggestedIssueForUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserFindFirstOrThrowArgs} args - Arguments to find a SuggestedIssueForUser
     * @example
     * // Get one SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends suggestedIssueForUserFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more SuggestedIssueForUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuggestedIssueForUsers
     * const suggestedIssueForUsers = await prisma.suggestedIssueForUser.findMany()
     * 
     * // Get first 10 SuggestedIssueForUsers
     * const suggestedIssueForUsers = await prisma.suggestedIssueForUser.findMany({ take: 10 })
     * 
     * // Only select the `ID`
     * const suggestedIssueForUserWithIDOnly = await prisma.suggestedIssueForUser.findMany({ select: { ID: true } })
     * 
    **/
    findMany<T extends suggestedIssueForUserFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a SuggestedIssueForUser.
     * @param {suggestedIssueForUserCreateArgs} args - Arguments to create a SuggestedIssueForUser.
     * @example
     * // Create one SuggestedIssueForUser
     * const SuggestedIssueForUser = await prisma.suggestedIssueForUser.create({
     *   data: {
     *     // ... data to create a SuggestedIssueForUser
     *   }
     * })
     * 
    **/
    create<T extends suggestedIssueForUserCreateArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserCreateArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many SuggestedIssueForUsers.
     *     @param {suggestedIssueForUserCreateManyArgs} args - Arguments to create many SuggestedIssueForUsers.
     *     @example
     *     // Create many SuggestedIssueForUsers
     *     const suggestedIssueForUser = await prisma.suggestedIssueForUser.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends suggestedIssueForUserCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SuggestedIssueForUser.
     * @param {suggestedIssueForUserDeleteArgs} args - Arguments to delete one SuggestedIssueForUser.
     * @example
     * // Delete one SuggestedIssueForUser
     * const SuggestedIssueForUser = await prisma.suggestedIssueForUser.delete({
     *   where: {
     *     // ... filter to delete one SuggestedIssueForUser
     *   }
     * })
     * 
    **/
    delete<T extends suggestedIssueForUserDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserDeleteArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one SuggestedIssueForUser.
     * @param {suggestedIssueForUserUpdateArgs} args - Arguments to update one SuggestedIssueForUser.
     * @example
     * // Update one SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends suggestedIssueForUserUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserUpdateArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more SuggestedIssueForUsers.
     * @param {suggestedIssueForUserDeleteManyArgs} args - Arguments to filter SuggestedIssueForUsers to delete.
     * @example
     * // Delete a few SuggestedIssueForUsers
     * const { count } = await prisma.suggestedIssueForUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends suggestedIssueForUserDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, suggestedIssueForUserDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuggestedIssueForUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuggestedIssueForUsers
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends suggestedIssueForUserUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SuggestedIssueForUser.
     * @param {suggestedIssueForUserUpsertArgs} args - Arguments to update or create a SuggestedIssueForUser.
     * @example
     * // Update or create a SuggestedIssueForUser
     * const suggestedIssueForUser = await prisma.suggestedIssueForUser.upsert({
     *   create: {
     *     // ... data to create a SuggestedIssueForUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuggestedIssueForUser we want to update
     *   }
     * })
    **/
    upsert<T extends suggestedIssueForUserUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, suggestedIssueForUserUpsertArgs<ExtArgs>>
    ): Prisma__suggestedIssueForUserClient<$Result.GetResult<Prisma.$suggestedIssueForUserPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of SuggestedIssueForUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserCountArgs} args - Arguments to filter SuggestedIssueForUsers to count.
     * @example
     * // Count the number of SuggestedIssueForUsers
     * const count = await prisma.suggestedIssueForUser.count({
     *   where: {
     *     // ... the filter for the SuggestedIssueForUsers we want to count
     *   }
     * })
    **/
    count<T extends suggestedIssueForUserCountArgs>(
      args?: Subset<T, suggestedIssueForUserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuggestedIssueForUserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuggestedIssueForUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuggestedIssueForUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuggestedIssueForUserAggregateArgs>(args: Subset<T, SuggestedIssueForUserAggregateArgs>): Prisma.PrismaPromise<GetSuggestedIssueForUserAggregateType<T>>

    /**
     * Group by SuggestedIssueForUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {suggestedIssueForUserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends suggestedIssueForUserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: suggestedIssueForUserGroupByArgs['orderBy'] }
        : { orderBy?: suggestedIssueForUserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, suggestedIssueForUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuggestedIssueForUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the suggestedIssueForUser model
   */
  readonly fields: suggestedIssueForUserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for suggestedIssueForUser.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__suggestedIssueForUserClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the suggestedIssueForUser model
   */ 
  interface suggestedIssueForUserFieldRefs {
    readonly ID: FieldRef<"suggestedIssueForUser", 'Int'>
    readonly userId: FieldRef<"suggestedIssueForUser", 'Int'>
    readonly publicationcode: FieldRef<"suggestedIssueForUser", 'String'>
    readonly issuenumber: FieldRef<"suggestedIssueForUser", 'String'>
    readonly oldestdate: FieldRef<"suggestedIssueForUser", 'DateTime'>
    readonly score: FieldRef<"suggestedIssueForUser", 'Int'>
  }
    

  // Custom InputTypes

  /**
   * suggestedIssueForUser findUnique
   */
  export type suggestedIssueForUserFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter, which suggestedIssueForUser to fetch.
     */
    where: suggestedIssueForUserWhereUniqueInput
  }


  /**
   * suggestedIssueForUser findUniqueOrThrow
   */
  export type suggestedIssueForUserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter, which suggestedIssueForUser to fetch.
     */
    where: suggestedIssueForUserWhereUniqueInput
  }


  /**
   * suggestedIssueForUser findFirst
   */
  export type suggestedIssueForUserFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter, which suggestedIssueForUser to fetch.
     */
    where?: suggestedIssueForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of suggestedIssueForUsers to fetch.
     */
    orderBy?: suggestedIssueForUserOrderByWithRelationInput | suggestedIssueForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for suggestedIssueForUsers.
     */
    cursor?: suggestedIssueForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` suggestedIssueForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` suggestedIssueForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of suggestedIssueForUsers.
     */
    distinct?: SuggestedIssueForUserScalarFieldEnum | SuggestedIssueForUserScalarFieldEnum[]
  }


  /**
   * suggestedIssueForUser findFirstOrThrow
   */
  export type suggestedIssueForUserFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter, which suggestedIssueForUser to fetch.
     */
    where?: suggestedIssueForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of suggestedIssueForUsers to fetch.
     */
    orderBy?: suggestedIssueForUserOrderByWithRelationInput | suggestedIssueForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for suggestedIssueForUsers.
     */
    cursor?: suggestedIssueForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` suggestedIssueForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` suggestedIssueForUsers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of suggestedIssueForUsers.
     */
    distinct?: SuggestedIssueForUserScalarFieldEnum | SuggestedIssueForUserScalarFieldEnum[]
  }


  /**
   * suggestedIssueForUser findMany
   */
  export type suggestedIssueForUserFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter, which suggestedIssueForUsers to fetch.
     */
    where?: suggestedIssueForUserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of suggestedIssueForUsers to fetch.
     */
    orderBy?: suggestedIssueForUserOrderByWithRelationInput | suggestedIssueForUserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing suggestedIssueForUsers.
     */
    cursor?: suggestedIssueForUserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` suggestedIssueForUsers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` suggestedIssueForUsers.
     */
    skip?: number
    distinct?: SuggestedIssueForUserScalarFieldEnum | SuggestedIssueForUserScalarFieldEnum[]
  }


  /**
   * suggestedIssueForUser create
   */
  export type suggestedIssueForUserCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * The data needed to create a suggestedIssueForUser.
     */
    data: XOR<suggestedIssueForUserCreateInput, suggestedIssueForUserUncheckedCreateInput>
  }


  /**
   * suggestedIssueForUser createMany
   */
  export type suggestedIssueForUserCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many suggestedIssueForUsers.
     */
    data: suggestedIssueForUserCreateManyInput | suggestedIssueForUserCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * suggestedIssueForUser update
   */
  export type suggestedIssueForUserUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * The data needed to update a suggestedIssueForUser.
     */
    data: XOR<suggestedIssueForUserUpdateInput, suggestedIssueForUserUncheckedUpdateInput>
    /**
     * Choose, which suggestedIssueForUser to update.
     */
    where: suggestedIssueForUserWhereUniqueInput
  }


  /**
   * suggestedIssueForUser updateMany
   */
  export type suggestedIssueForUserUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update suggestedIssueForUsers.
     */
    data: XOR<suggestedIssueForUserUpdateManyMutationInput, suggestedIssueForUserUncheckedUpdateManyInput>
    /**
     * Filter which suggestedIssueForUsers to update
     */
    where?: suggestedIssueForUserWhereInput
  }


  /**
   * suggestedIssueForUser upsert
   */
  export type suggestedIssueForUserUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * The filter to search for the suggestedIssueForUser to update in case it exists.
     */
    where: suggestedIssueForUserWhereUniqueInput
    /**
     * In case the suggestedIssueForUser found by the `where` argument doesn't exist, create a new suggestedIssueForUser with this data.
     */
    create: XOR<suggestedIssueForUserCreateInput, suggestedIssueForUserUncheckedCreateInput>
    /**
     * In case the suggestedIssueForUser was found with the provided `where` argument, update it with this data.
     */
    update: XOR<suggestedIssueForUserUpdateInput, suggestedIssueForUserUncheckedUpdateInput>
  }


  /**
   * suggestedIssueForUser delete
   */
  export type suggestedIssueForUserDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
    /**
     * Filter which suggestedIssueForUser to delete.
     */
    where: suggestedIssueForUserWhereUniqueInput
  }


  /**
   * suggestedIssueForUser deleteMany
   */
  export type suggestedIssueForUserDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which suggestedIssueForUsers to delete
     */
    where?: suggestedIssueForUserWhereInput
  }


  /**
   * suggestedIssueForUser without action
   */
  export type suggestedIssueForUserDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the suggestedIssueForUser
     */
    select?: suggestedIssueForUserSelect<ExtArgs> | null
  }



  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AuthorStoryScalarFieldEnum: {
    id: 'id',
    personcode: 'personcode',
    storycode: 'storycode'
  };

  export type AuthorStoryScalarFieldEnum = (typeof AuthorStoryScalarFieldEnum)[keyof typeof AuthorStoryScalarFieldEnum]


  export const AuthorUserForStatsScalarFieldEnum: {
    id: 'id',
    personcode: 'personcode',
    userId: 'userId',
    notation: 'notation'
  };

  export type AuthorUserForStatsScalarFieldEnum = (typeof AuthorUserForStatsScalarFieldEnum)[keyof typeof AuthorUserForStatsScalarFieldEnum]


  export const Histoires_publicationsScalarFieldEnum: {
    ID: 'ID',
    storycode: 'storycode',
    publicationcode: 'publicationcode',
    issuenumber: 'issuenumber',
    issuecode: 'issuecode',
    oldestdate: 'oldestdate'
  };

  export type Histoires_publicationsScalarFieldEnum = (typeof Histoires_publicationsScalarFieldEnum)[keyof typeof Histoires_publicationsScalarFieldEnum]


  export const MissingStoryForUserScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    personcode: 'personcode',
    storycode: 'storycode'
  };

  export type MissingStoryForUserScalarFieldEnum = (typeof MissingStoryForUserScalarFieldEnum)[keyof typeof MissingStoryForUserScalarFieldEnum]


  export const Utilisateurs_publications_manquantesScalarFieldEnum: {
    ID: 'ID',
    ID_User: 'ID_User',
    personcode: 'personcode',
    storycode: 'storycode',
    publicationcode: 'publicationcode',
    issuenumber: 'issuenumber',
    oldestdate: 'oldestdate',
    Notation: 'Notation'
  };

  export type Utilisateurs_publications_manquantesScalarFieldEnum = (typeof Utilisateurs_publications_manquantesScalarFieldEnum)[keyof typeof Utilisateurs_publications_manquantesScalarFieldEnum]


  export const SuggestedIssueForUserScalarFieldEnum: {
    ID: 'ID',
    userId: 'userId',
    publicationcode: 'publicationcode',
    issuenumber: 'issuenumber',
    oldestdate: 'oldestdate',
    score: 'score'
  };

  export type SuggestedIssueForUserScalarFieldEnum = (typeof SuggestedIssueForUserScalarFieldEnum)[keyof typeof SuggestedIssueForUserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type authorStoryWhereInput = {
    AND?: authorStoryWhereInput | authorStoryWhereInput[]
    OR?: authorStoryWhereInput[]
    NOT?: authorStoryWhereInput | authorStoryWhereInput[]
    id?: IntFilter<"authorStory"> | number
    personcode?: StringFilter<"authorStory"> | string
    storycode?: StringFilter<"authorStory"> | string
  }

  export type authorStoryOrderByWithRelationInput = {
    id?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type authorStoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    personcode_storycode?: authorStoryPersoncodeStorycodeCompoundUniqueInput
    AND?: authorStoryWhereInput | authorStoryWhereInput[]
    OR?: authorStoryWhereInput[]
    NOT?: authorStoryWhereInput | authorStoryWhereInput[]
    personcode?: StringFilter<"authorStory"> | string
    storycode?: StringFilter<"authorStory"> | string
  }, "id" | "personcode_storycode">

  export type authorStoryOrderByWithAggregationInput = {
    id?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    _count?: authorStoryCountOrderByAggregateInput
    _avg?: authorStoryAvgOrderByAggregateInput
    _max?: authorStoryMaxOrderByAggregateInput
    _min?: authorStoryMinOrderByAggregateInput
    _sum?: authorStorySumOrderByAggregateInput
  }

  export type authorStoryScalarWhereWithAggregatesInput = {
    AND?: authorStoryScalarWhereWithAggregatesInput | authorStoryScalarWhereWithAggregatesInput[]
    OR?: authorStoryScalarWhereWithAggregatesInput[]
    NOT?: authorStoryScalarWhereWithAggregatesInput | authorStoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"authorStory"> | number
    personcode?: StringWithAggregatesFilter<"authorStory"> | string
    storycode?: StringWithAggregatesFilter<"authorStory"> | string
  }

  export type authorUserForStatsWhereInput = {
    AND?: authorUserForStatsWhereInput | authorUserForStatsWhereInput[]
    OR?: authorUserForStatsWhereInput[]
    NOT?: authorUserForStatsWhereInput | authorUserForStatsWhereInput[]
    id?: IntFilter<"authorUserForStats"> | number
    personcode?: StringFilter<"authorUserForStats"> | string
    userId?: IntFilter<"authorUserForStats"> | number
    notation?: IntFilter<"authorUserForStats"> | number
  }

  export type authorUserForStatsOrderByWithRelationInput = {
    id?: SortOrder
    personcode?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type authorUserForStatsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_personcode?: authorUserForStatsUserIdPersoncodeCompoundUniqueInput
    AND?: authorUserForStatsWhereInput | authorUserForStatsWhereInput[]
    OR?: authorUserForStatsWhereInput[]
    NOT?: authorUserForStatsWhereInput | authorUserForStatsWhereInput[]
    personcode?: StringFilter<"authorUserForStats"> | string
    userId?: IntFilter<"authorUserForStats"> | number
    notation?: IntFilter<"authorUserForStats"> | number
  }, "id" | "userId_personcode">

  export type authorUserForStatsOrderByWithAggregationInput = {
    id?: SortOrder
    personcode?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
    _count?: authorUserForStatsCountOrderByAggregateInput
    _avg?: authorUserForStatsAvgOrderByAggregateInput
    _max?: authorUserForStatsMaxOrderByAggregateInput
    _min?: authorUserForStatsMinOrderByAggregateInput
    _sum?: authorUserForStatsSumOrderByAggregateInput
  }

  export type authorUserForStatsScalarWhereWithAggregatesInput = {
    AND?: authorUserForStatsScalarWhereWithAggregatesInput | authorUserForStatsScalarWhereWithAggregatesInput[]
    OR?: authorUserForStatsScalarWhereWithAggregatesInput[]
    NOT?: authorUserForStatsScalarWhereWithAggregatesInput | authorUserForStatsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"authorUserForStats"> | number
    personcode?: StringWithAggregatesFilter<"authorUserForStats"> | string
    userId?: IntWithAggregatesFilter<"authorUserForStats"> | number
    notation?: IntWithAggregatesFilter<"authorUserForStats"> | number
  }

  export type histoires_publicationsWhereInput = {
    AND?: histoires_publicationsWhereInput | histoires_publicationsWhereInput[]
    OR?: histoires_publicationsWhereInput[]
    NOT?: histoires_publicationsWhereInput | histoires_publicationsWhereInput[]
    ID?: IntFilter<"histoires_publications"> | number
    storycode?: StringFilter<"histoires_publications"> | string
    publicationcode?: StringFilter<"histoires_publications"> | string
    issuenumber?: StringFilter<"histoires_publications"> | string
    issuecode?: StringFilter<"histoires_publications"> | string
    oldestdate?: DateTimeNullableFilter<"histoires_publications"> | Date | string | null
  }

  export type histoires_publicationsOrderByWithRelationInput = {
    ID?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    issuecode?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
  }

  export type histoires_publicationsWhereUniqueInput = Prisma.AtLeast<{
    ID?: number
    issuecode_storycode?: histoires_publicationsIssuecodeStorycodeCompoundUniqueInput
    AND?: histoires_publicationsWhereInput | histoires_publicationsWhereInput[]
    OR?: histoires_publicationsWhereInput[]
    NOT?: histoires_publicationsWhereInput | histoires_publicationsWhereInput[]
    storycode?: StringFilter<"histoires_publications"> | string
    publicationcode?: StringFilter<"histoires_publications"> | string
    issuenumber?: StringFilter<"histoires_publications"> | string
    issuecode?: StringFilter<"histoires_publications"> | string
    oldestdate?: DateTimeNullableFilter<"histoires_publications"> | Date | string | null
  }, "ID" | "issuecode_storycode">

  export type histoires_publicationsOrderByWithAggregationInput = {
    ID?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    issuecode?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
    _count?: histoires_publicationsCountOrderByAggregateInput
    _avg?: histoires_publicationsAvgOrderByAggregateInput
    _max?: histoires_publicationsMaxOrderByAggregateInput
    _min?: histoires_publicationsMinOrderByAggregateInput
    _sum?: histoires_publicationsSumOrderByAggregateInput
  }

  export type histoires_publicationsScalarWhereWithAggregatesInput = {
    AND?: histoires_publicationsScalarWhereWithAggregatesInput | histoires_publicationsScalarWhereWithAggregatesInput[]
    OR?: histoires_publicationsScalarWhereWithAggregatesInput[]
    NOT?: histoires_publicationsScalarWhereWithAggregatesInput | histoires_publicationsScalarWhereWithAggregatesInput[]
    ID?: IntWithAggregatesFilter<"histoires_publications"> | number
    storycode?: StringWithAggregatesFilter<"histoires_publications"> | string
    publicationcode?: StringWithAggregatesFilter<"histoires_publications"> | string
    issuenumber?: StringWithAggregatesFilter<"histoires_publications"> | string
    issuecode?: StringWithAggregatesFilter<"histoires_publications"> | string
    oldestdate?: DateTimeNullableWithAggregatesFilter<"histoires_publications"> | Date | string | null
  }

  export type missingStoryForUserWhereInput = {
    AND?: missingStoryForUserWhereInput | missingStoryForUserWhereInput[]
    OR?: missingStoryForUserWhereInput[]
    NOT?: missingStoryForUserWhereInput | missingStoryForUserWhereInput[]
    id?: IntFilter<"missingStoryForUser"> | number
    userId?: IntFilter<"missingStoryForUser"> | number
    personcode?: StringFilter<"missingStoryForUser"> | string
    storycode?: StringFilter<"missingStoryForUser"> | string
  }

  export type missingStoryForUserOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type missingStoryForUserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_personcode_storycode?: missingStoryForUserUserIdPersoncodeStorycodeCompoundUniqueInput
    AND?: missingStoryForUserWhereInput | missingStoryForUserWhereInput[]
    OR?: missingStoryForUserWhereInput[]
    NOT?: missingStoryForUserWhereInput | missingStoryForUserWhereInput[]
    userId?: IntFilter<"missingStoryForUser"> | number
    personcode?: StringFilter<"missingStoryForUser"> | string
    storycode?: StringFilter<"missingStoryForUser"> | string
  }, "id" | "userId_personcode_storycode">

  export type missingStoryForUserOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    _count?: missingStoryForUserCountOrderByAggregateInput
    _avg?: missingStoryForUserAvgOrderByAggregateInput
    _max?: missingStoryForUserMaxOrderByAggregateInput
    _min?: missingStoryForUserMinOrderByAggregateInput
    _sum?: missingStoryForUserSumOrderByAggregateInput
  }

  export type missingStoryForUserScalarWhereWithAggregatesInput = {
    AND?: missingStoryForUserScalarWhereWithAggregatesInput | missingStoryForUserScalarWhereWithAggregatesInput[]
    OR?: missingStoryForUserScalarWhereWithAggregatesInput[]
    NOT?: missingStoryForUserScalarWhereWithAggregatesInput | missingStoryForUserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"missingStoryForUser"> | number
    userId?: IntWithAggregatesFilter<"missingStoryForUser"> | number
    personcode?: StringWithAggregatesFilter<"missingStoryForUser"> | string
    storycode?: StringWithAggregatesFilter<"missingStoryForUser"> | string
  }

  export type utilisateurs_publications_manquantesWhereInput = {
    AND?: utilisateurs_publications_manquantesWhereInput | utilisateurs_publications_manquantesWhereInput[]
    OR?: utilisateurs_publications_manquantesWhereInput[]
    NOT?: utilisateurs_publications_manquantesWhereInput | utilisateurs_publications_manquantesWhereInput[]
    ID?: IntFilter<"utilisateurs_publications_manquantes"> | number
    ID_User?: IntFilter<"utilisateurs_publications_manquantes"> | number
    personcode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    storycode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    publicationcode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    issuenumber?: StringFilter<"utilisateurs_publications_manquantes"> | string
    oldestdate?: DateTimeNullableFilter<"utilisateurs_publications_manquantes"> | Date | string | null
    Notation?: IntFilter<"utilisateurs_publications_manquantes"> | number
  }

  export type utilisateurs_publications_manquantesOrderByWithRelationInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
    Notation?: SortOrder
  }

  export type utilisateurs_publications_manquantesWhereUniqueInput = Prisma.AtLeast<{
    ID?: number
    ID_User_personcode_storycode_publicationcode_issuenumber?: utilisateurs_publications_manquantesID_UserPersoncodeStorycodePublicationcodeIssuenumberCompoundUniqueInput
    AND?: utilisateurs_publications_manquantesWhereInput | utilisateurs_publications_manquantesWhereInput[]
    OR?: utilisateurs_publications_manquantesWhereInput[]
    NOT?: utilisateurs_publications_manquantesWhereInput | utilisateurs_publications_manquantesWhereInput[]
    ID_User?: IntFilter<"utilisateurs_publications_manquantes"> | number
    personcode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    storycode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    publicationcode?: StringFilter<"utilisateurs_publications_manquantes"> | string
    issuenumber?: StringFilter<"utilisateurs_publications_manquantes"> | string
    oldestdate?: DateTimeNullableFilter<"utilisateurs_publications_manquantes"> | Date | string | null
    Notation?: IntFilter<"utilisateurs_publications_manquantes"> | number
  }, "ID" | "ID_User_personcode_storycode_publicationcode_issuenumber">

  export type utilisateurs_publications_manquantesOrderByWithAggregationInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
    Notation?: SortOrder
    _count?: utilisateurs_publications_manquantesCountOrderByAggregateInput
    _avg?: utilisateurs_publications_manquantesAvgOrderByAggregateInput
    _max?: utilisateurs_publications_manquantesMaxOrderByAggregateInput
    _min?: utilisateurs_publications_manquantesMinOrderByAggregateInput
    _sum?: utilisateurs_publications_manquantesSumOrderByAggregateInput
  }

  export type utilisateurs_publications_manquantesScalarWhereWithAggregatesInput = {
    AND?: utilisateurs_publications_manquantesScalarWhereWithAggregatesInput | utilisateurs_publications_manquantesScalarWhereWithAggregatesInput[]
    OR?: utilisateurs_publications_manquantesScalarWhereWithAggregatesInput[]
    NOT?: utilisateurs_publications_manquantesScalarWhereWithAggregatesInput | utilisateurs_publications_manquantesScalarWhereWithAggregatesInput[]
    ID?: IntWithAggregatesFilter<"utilisateurs_publications_manquantes"> | number
    ID_User?: IntWithAggregatesFilter<"utilisateurs_publications_manquantes"> | number
    personcode?: StringWithAggregatesFilter<"utilisateurs_publications_manquantes"> | string
    storycode?: StringWithAggregatesFilter<"utilisateurs_publications_manquantes"> | string
    publicationcode?: StringWithAggregatesFilter<"utilisateurs_publications_manquantes"> | string
    issuenumber?: StringWithAggregatesFilter<"utilisateurs_publications_manquantes"> | string
    oldestdate?: DateTimeNullableWithAggregatesFilter<"utilisateurs_publications_manquantes"> | Date | string | null
    Notation?: IntWithAggregatesFilter<"utilisateurs_publications_manquantes"> | number
  }

  export type suggestedIssueForUserWhereInput = {
    AND?: suggestedIssueForUserWhereInput | suggestedIssueForUserWhereInput[]
    OR?: suggestedIssueForUserWhereInput[]
    NOT?: suggestedIssueForUserWhereInput | suggestedIssueForUserWhereInput[]
    ID?: IntFilter<"suggestedIssueForUser"> | number
    userId?: IntFilter<"suggestedIssueForUser"> | number
    publicationcode?: StringFilter<"suggestedIssueForUser"> | string
    issuenumber?: StringFilter<"suggestedIssueForUser"> | string
    oldestdate?: DateTimeNullableFilter<"suggestedIssueForUser"> | Date | string | null
    score?: IntFilter<"suggestedIssueForUser"> | number
  }

  export type suggestedIssueForUserOrderByWithRelationInput = {
    ID?: SortOrder
    userId?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
    score?: SortOrder
  }

  export type suggestedIssueForUserWhereUniqueInput = Prisma.AtLeast<{
    ID?: number
    userId_publicationcode_issuenumber?: suggestedIssueForUserUserIdPublicationcodeIssuenumberCompoundUniqueInput
    AND?: suggestedIssueForUserWhereInput | suggestedIssueForUserWhereInput[]
    OR?: suggestedIssueForUserWhereInput[]
    NOT?: suggestedIssueForUserWhereInput | suggestedIssueForUserWhereInput[]
    userId?: IntFilter<"suggestedIssueForUser"> | number
    publicationcode?: StringFilter<"suggestedIssueForUser"> | string
    issuenumber?: StringFilter<"suggestedIssueForUser"> | string
    oldestdate?: DateTimeNullableFilter<"suggestedIssueForUser"> | Date | string | null
    score?: IntFilter<"suggestedIssueForUser"> | number
  }, "ID" | "userId_publicationcode_issuenumber">

  export type suggestedIssueForUserOrderByWithAggregationInput = {
    ID?: SortOrder
    userId?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrderInput | SortOrder
    score?: SortOrder
    _count?: suggestedIssueForUserCountOrderByAggregateInput
    _avg?: suggestedIssueForUserAvgOrderByAggregateInput
    _max?: suggestedIssueForUserMaxOrderByAggregateInput
    _min?: suggestedIssueForUserMinOrderByAggregateInput
    _sum?: suggestedIssueForUserSumOrderByAggregateInput
  }

  export type suggestedIssueForUserScalarWhereWithAggregatesInput = {
    AND?: suggestedIssueForUserScalarWhereWithAggregatesInput | suggestedIssueForUserScalarWhereWithAggregatesInput[]
    OR?: suggestedIssueForUserScalarWhereWithAggregatesInput[]
    NOT?: suggestedIssueForUserScalarWhereWithAggregatesInput | suggestedIssueForUserScalarWhereWithAggregatesInput[]
    ID?: IntWithAggregatesFilter<"suggestedIssueForUser"> | number
    userId?: IntWithAggregatesFilter<"suggestedIssueForUser"> | number
    publicationcode?: StringWithAggregatesFilter<"suggestedIssueForUser"> | string
    issuenumber?: StringWithAggregatesFilter<"suggestedIssueForUser"> | string
    oldestdate?: DateTimeNullableWithAggregatesFilter<"suggestedIssueForUser"> | Date | string | null
    score?: IntWithAggregatesFilter<"suggestedIssueForUser"> | number
  }

  export type authorStoryCreateInput = {
    personcode: string
    storycode: string
  }

  export type authorStoryUncheckedCreateInput = {
    id?: number
    personcode: string
    storycode: string
  }

  export type authorStoryUpdateInput = {
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type authorStoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type authorStoryCreateManyInput = {
    id?: number
    personcode: string
    storycode: string
  }

  export type authorStoryUpdateManyMutationInput = {
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type authorStoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type authorUserForStatsCreateInput = {
    personcode: string
    userId: number
    notation?: number
  }

  export type authorUserForStatsUncheckedCreateInput = {
    id?: number
    personcode: string
    userId: number
    notation?: number
  }

  export type authorUserForStatsUpdateInput = {
    personcode?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    notation?: IntFieldUpdateOperationsInput | number
  }

  export type authorUserForStatsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    notation?: IntFieldUpdateOperationsInput | number
  }

  export type authorUserForStatsCreateManyInput = {
    id?: number
    personcode: string
    userId: number
    notation?: number
  }

  export type authorUserForStatsUpdateManyMutationInput = {
    personcode?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    notation?: IntFieldUpdateOperationsInput | number
  }

  export type authorUserForStatsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    userId?: IntFieldUpdateOperationsInput | number
    notation?: IntFieldUpdateOperationsInput | number
  }

  export type histoires_publicationsCreateInput = {
    storycode: string
    publicationcode: string
    issuenumber: string
    issuecode: string
    oldestdate?: Date | string | null
  }

  export type histoires_publicationsUncheckedCreateInput = {
    ID?: number
    storycode: string
    publicationcode: string
    issuenumber: string
    issuecode: string
    oldestdate?: Date | string | null
  }

  export type histoires_publicationsUpdateInput = {
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    issuecode?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type histoires_publicationsUncheckedUpdateInput = {
    ID?: IntFieldUpdateOperationsInput | number
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    issuecode?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type histoires_publicationsCreateManyInput = {
    ID?: number
    storycode: string
    publicationcode: string
    issuenumber: string
    issuecode: string
    oldestdate?: Date | string | null
  }

  export type histoires_publicationsUpdateManyMutationInput = {
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    issuecode?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type histoires_publicationsUncheckedUpdateManyInput = {
    ID?: IntFieldUpdateOperationsInput | number
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    issuecode?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type missingStoryForUserCreateInput = {
    userId: number
    personcode: string
    storycode: string
  }

  export type missingStoryForUserUncheckedCreateInput = {
    id?: number
    userId: number
    personcode: string
    storycode: string
  }

  export type missingStoryForUserUpdateInput = {
    userId?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type missingStoryForUserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type missingStoryForUserCreateManyInput = {
    id?: number
    userId: number
    personcode: string
    storycode: string
  }

  export type missingStoryForUserUpdateManyMutationInput = {
    userId?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type missingStoryForUserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
  }

  export type utilisateurs_publications_manquantesCreateInput = {
    ID_User: number
    personcode: string
    storycode: string
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    Notation: number
  }

  export type utilisateurs_publications_manquantesUncheckedCreateInput = {
    ID?: number
    ID_User: number
    personcode: string
    storycode: string
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    Notation: number
  }

  export type utilisateurs_publications_manquantesUpdateInput = {
    ID_User?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Notation?: IntFieldUpdateOperationsInput | number
  }

  export type utilisateurs_publications_manquantesUncheckedUpdateInput = {
    ID?: IntFieldUpdateOperationsInput | number
    ID_User?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Notation?: IntFieldUpdateOperationsInput | number
  }

  export type utilisateurs_publications_manquantesCreateManyInput = {
    ID?: number
    ID_User: number
    personcode: string
    storycode: string
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    Notation: number
  }

  export type utilisateurs_publications_manquantesUpdateManyMutationInput = {
    ID_User?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Notation?: IntFieldUpdateOperationsInput | number
  }

  export type utilisateurs_publications_manquantesUncheckedUpdateManyInput = {
    ID?: IntFieldUpdateOperationsInput | number
    ID_User?: IntFieldUpdateOperationsInput | number
    personcode?: StringFieldUpdateOperationsInput | string
    storycode?: StringFieldUpdateOperationsInput | string
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Notation?: IntFieldUpdateOperationsInput | number
  }

  export type suggestedIssueForUserCreateInput = {
    userId: number
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    score: number
  }

  export type suggestedIssueForUserUncheckedCreateInput = {
    ID?: number
    userId: number
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    score: number
  }

  export type suggestedIssueForUserUpdateInput = {
    userId?: IntFieldUpdateOperationsInput | number
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: IntFieldUpdateOperationsInput | number
  }

  export type suggestedIssueForUserUncheckedUpdateInput = {
    ID?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: IntFieldUpdateOperationsInput | number
  }

  export type suggestedIssueForUserCreateManyInput = {
    ID?: number
    userId: number
    publicationcode: string
    issuenumber: string
    oldestdate?: Date | string | null
    score: number
  }

  export type suggestedIssueForUserUpdateManyMutationInput = {
    userId?: IntFieldUpdateOperationsInput | number
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: IntFieldUpdateOperationsInput | number
  }

  export type suggestedIssueForUserUncheckedUpdateManyInput = {
    ID?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    publicationcode?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    oldestdate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    score?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type authorStoryPersoncodeStorycodeCompoundUniqueInput = {
    personcode: string
    storycode: string
  }

  export type authorStoryCountOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type authorStoryAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type authorStoryMaxOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type authorStoryMinOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type authorStorySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type authorUserForStatsUserIdPersoncodeCompoundUniqueInput = {
    userId: number
    personcode: string
  }

  export type authorUserForStatsCountOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type authorUserForStatsAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type authorUserForStatsMaxOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type authorUserForStatsMinOrderByAggregateInput = {
    id?: SortOrder
    personcode?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type authorUserForStatsSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    notation?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type histoires_publicationsIssuecodeStorycodeCompoundUniqueInput = {
    issuecode: string
    storycode: string
  }

  export type histoires_publicationsCountOrderByAggregateInput = {
    ID?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    issuecode?: SortOrder
    oldestdate?: SortOrder
  }

  export type histoires_publicationsAvgOrderByAggregateInput = {
    ID?: SortOrder
  }

  export type histoires_publicationsMaxOrderByAggregateInput = {
    ID?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    issuecode?: SortOrder
    oldestdate?: SortOrder
  }

  export type histoires_publicationsMinOrderByAggregateInput = {
    ID?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    issuecode?: SortOrder
    oldestdate?: SortOrder
  }

  export type histoires_publicationsSumOrderByAggregateInput = {
    ID?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type missingStoryForUserUserIdPersoncodeStorycodeCompoundUniqueInput = {
    userId: number
    personcode: string
    storycode: string
  }

  export type missingStoryForUserCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type missingStoryForUserAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type missingStoryForUserMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type missingStoryForUserMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
  }

  export type missingStoryForUserSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type utilisateurs_publications_manquantesID_UserPersoncodeStorycodePublicationcodeIssuenumberCompoundUniqueInput = {
    ID_User: number
    personcode: string
    storycode: string
    publicationcode: string
    issuenumber: string
  }

  export type utilisateurs_publications_manquantesCountOrderByAggregateInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    Notation?: SortOrder
  }

  export type utilisateurs_publications_manquantesAvgOrderByAggregateInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    Notation?: SortOrder
  }

  export type utilisateurs_publications_manquantesMaxOrderByAggregateInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    Notation?: SortOrder
  }

  export type utilisateurs_publications_manquantesMinOrderByAggregateInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    personcode?: SortOrder
    storycode?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    Notation?: SortOrder
  }

  export type utilisateurs_publications_manquantesSumOrderByAggregateInput = {
    ID?: SortOrder
    ID_User?: SortOrder
    Notation?: SortOrder
  }

  export type suggestedIssueForUserUserIdPublicationcodeIssuenumberCompoundUniqueInput = {
    userId: number
    publicationcode: string
    issuenumber: string
  }

  export type suggestedIssueForUserCountOrderByAggregateInput = {
    ID?: SortOrder
    userId?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    score?: SortOrder
  }

  export type suggestedIssueForUserAvgOrderByAggregateInput = {
    ID?: SortOrder
    userId?: SortOrder
    score?: SortOrder
  }

  export type suggestedIssueForUserMaxOrderByAggregateInput = {
    ID?: SortOrder
    userId?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    score?: SortOrder
  }

  export type suggestedIssueForUserMinOrderByAggregateInput = {
    ID?: SortOrder
    userId?: SortOrder
    publicationcode?: SortOrder
    issuenumber?: SortOrder
    oldestdate?: SortOrder
    score?: SortOrder
  }

  export type suggestedIssueForUserSumOrderByAggregateInput = {
    ID?: SortOrder
    userId?: SortOrder
    score?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use authorStoryDefaultArgs instead
     */
    export type authorStoryArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = authorStoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use authorUserForStatsDefaultArgs instead
     */
    export type authorUserForStatsArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = authorUserForStatsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use histoires_publicationsDefaultArgs instead
     */
    export type histoires_publicationsArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = histoires_publicationsDefaultArgs<ExtArgs>
    /**
     * @deprecated Use missingStoryForUserDefaultArgs instead
     */
    export type missingStoryForUserArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = missingStoryForUserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use utilisateurs_publications_manquantesDefaultArgs instead
     */
    export type utilisateurs_publications_manquantesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = utilisateurs_publications_manquantesDefaultArgs<ExtArgs>
    /**
     * @deprecated Use suggestedIssueForUserDefaultArgs instead
     */
    export type suggestedIssueForUserArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = suggestedIssueForUserDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}