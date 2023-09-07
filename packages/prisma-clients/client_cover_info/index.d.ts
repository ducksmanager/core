
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
 * Model coverImport
 * 
 */
export type coverImport = $Result.DefaultSelection<Prisma.$coverImportPayload>
/**
 * Model cover
 * 
 */
export type cover = $Result.DefaultSelection<Prisma.$coverPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more CoverImports
 * const coverImports = await prisma.coverImport.findMany()
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
   * // Fetch zero or more CoverImports
   * const coverImports = await prisma.coverImport.findMany()
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
   * `prisma.coverImport`: Exposes CRUD operations for the **coverImport** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CoverImports
    * const coverImports = await prisma.coverImport.findMany()
    * ```
    */
  get coverImport(): Prisma.coverImportDelegate<ExtArgs>;

  /**
   * `prisma.cover`: Exposes CRUD operations for the **cover** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Covers
    * const covers = await prisma.cover.findMany()
    * ```
    */
  get cover(): Prisma.coverDelegate<ExtArgs>;
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
    coverImport: 'coverImport',
    cover: 'cover'
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
      modelProps: 'coverImport' | 'cover'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      coverImport: {
        payload: Prisma.$coverImportPayload<ExtArgs>
        fields: Prisma.coverImportFieldRefs
        operations: {
          findUnique: {
            args: Prisma.coverImportFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.coverImportFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          findFirst: {
            args: Prisma.coverImportFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.coverImportFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          findMany: {
            args: Prisma.coverImportFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>[]
          }
          create: {
            args: Prisma.coverImportCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          createMany: {
            args: Prisma.coverImportCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.coverImportDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          update: {
            args: Prisma.coverImportUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          deleteMany: {
            args: Prisma.coverImportDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.coverImportUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.coverImportUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverImportPayload>
          }
          aggregate: {
            args: Prisma.CoverImportAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCoverImport>
          }
          groupBy: {
            args: Prisma.coverImportGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CoverImportGroupByOutputType>[]
          }
          count: {
            args: Prisma.coverImportCountArgs<ExtArgs>,
            result: $Utils.Optional<CoverImportCountAggregateOutputType> | number
          }
        }
      }
      cover: {
        payload: Prisma.$coverPayload<ExtArgs>
        fields: Prisma.coverFieldRefs
        operations: {
          findUnique: {
            args: Prisma.coverFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.coverFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          findFirst: {
            args: Prisma.coverFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.coverFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          findMany: {
            args: Prisma.coverFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>[]
          }
          create: {
            args: Prisma.coverCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          createMany: {
            args: Prisma.coverCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.coverDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          update: {
            args: Prisma.coverUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          deleteMany: {
            args: Prisma.coverDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.coverUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.coverUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$coverPayload>
          }
          aggregate: {
            args: Prisma.CoverAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateCover>
          }
          groupBy: {
            args: Prisma.coverGroupByArgs<ExtArgs>,
            result: $Utils.Optional<CoverGroupByOutputType>[]
          }
          count: {
            args: Prisma.coverCountArgs<ExtArgs>,
            result: $Utils.Optional<CoverCountAggregateOutputType> | number
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
   * Model coverImport
   */

  export type AggregateCoverImport = {
    _count: CoverImportCountAggregateOutputType | null
    _avg: CoverImportAvgAggregateOutputType | null
    _sum: CoverImportSumAggregateOutputType | null
    _min: CoverImportMinAggregateOutputType | null
    _max: CoverImportMaxAggregateOutputType | null
  }

  export type CoverImportAvgAggregateOutputType = {
    coverId: number | null
  }

  export type CoverImportSumAggregateOutputType = {
    coverId: number | null
  }

  export type CoverImportMinAggregateOutputType = {
    coverId: number | null
    importedAt: Date | null
    importError: string | null
  }

  export type CoverImportMaxAggregateOutputType = {
    coverId: number | null
    importedAt: Date | null
    importError: string | null
  }

  export type CoverImportCountAggregateOutputType = {
    coverId: number
    importedAt: number
    importError: number
    _all: number
  }


  export type CoverImportAvgAggregateInputType = {
    coverId?: true
  }

  export type CoverImportSumAggregateInputType = {
    coverId?: true
  }

  export type CoverImportMinAggregateInputType = {
    coverId?: true
    importedAt?: true
    importError?: true
  }

  export type CoverImportMaxAggregateInputType = {
    coverId?: true
    importedAt?: true
    importError?: true
  }

  export type CoverImportCountAggregateInputType = {
    coverId?: true
    importedAt?: true
    importError?: true
    _all?: true
  }

  export type CoverImportAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which coverImport to aggregate.
     */
    where?: coverImportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coverImports to fetch.
     */
    orderBy?: coverImportOrderByWithRelationInput | coverImportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: coverImportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coverImports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coverImports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned coverImports
    **/
    _count?: true | CoverImportCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverImportAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverImportSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverImportMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverImportMaxAggregateInputType
  }

  export type GetCoverImportAggregateType<T extends CoverImportAggregateArgs> = {
        [P in keyof T & keyof AggregateCoverImport]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCoverImport[P]>
      : GetScalarType<T[P], AggregateCoverImport[P]>
  }




  export type coverImportGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: coverImportWhereInput
    orderBy?: coverImportOrderByWithAggregationInput | coverImportOrderByWithAggregationInput[]
    by: CoverImportScalarFieldEnum[] | CoverImportScalarFieldEnum
    having?: coverImportScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverImportCountAggregateInputType | true
    _avg?: CoverImportAvgAggregateInputType
    _sum?: CoverImportSumAggregateInputType
    _min?: CoverImportMinAggregateInputType
    _max?: CoverImportMaxAggregateInputType
  }

  export type CoverImportGroupByOutputType = {
    coverId: number
    importedAt: Date | null
    importError: string | null
    _count: CoverImportCountAggregateOutputType | null
    _avg: CoverImportAvgAggregateOutputType | null
    _sum: CoverImportSumAggregateOutputType | null
    _min: CoverImportMinAggregateOutputType | null
    _max: CoverImportMaxAggregateOutputType | null
  }

  type GetCoverImportGroupByPayload<T extends coverImportGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverImportGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverImportGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverImportGroupByOutputType[P]>
            : GetScalarType<T[P], CoverImportGroupByOutputType[P]>
        }
      >
    >


  export type coverImportSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    coverId?: boolean
    importedAt?: boolean
    importError?: boolean
  }, ExtArgs["result"]["coverImport"]>

  export type coverImportSelectScalar = {
    coverId?: boolean
    importedAt?: boolean
    importError?: boolean
  }


  export type $coverImportPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "coverImport"
    objects: {}
    scalars: $Extensions.GetResult<{
      coverId: number
      importedAt: Date | null
      importError: string | null
    }, ExtArgs["result"]["coverImport"]>
    composites: {}
  }


  type coverImportGetPayload<S extends boolean | null | undefined | coverImportDefaultArgs> = $Result.GetResult<Prisma.$coverImportPayload, S>

  type coverImportCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<coverImportFindManyArgs, 'select' | 'include'> & {
      select?: CoverImportCountAggregateInputType | true
    }

  export interface coverImportDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['coverImport'], meta: { name: 'coverImport' } }
    /**
     * Find zero or one CoverImport that matches the filter.
     * @param {coverImportFindUniqueArgs} args - Arguments to find a CoverImport
     * @example
     * // Get one CoverImport
     * const coverImport = await prisma.coverImport.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends coverImportFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportFindUniqueArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one CoverImport that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {coverImportFindUniqueOrThrowArgs} args - Arguments to find a CoverImport
     * @example
     * // Get one CoverImport
     * const coverImport = await prisma.coverImport.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends coverImportFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first CoverImport that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportFindFirstArgs} args - Arguments to find a CoverImport
     * @example
     * // Get one CoverImport
     * const coverImport = await prisma.coverImport.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends coverImportFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportFindFirstArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first CoverImport that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportFindFirstOrThrowArgs} args - Arguments to find a CoverImport
     * @example
     * // Get one CoverImport
     * const coverImport = await prisma.coverImport.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends coverImportFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more CoverImports that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CoverImports
     * const coverImports = await prisma.coverImport.findMany()
     * 
     * // Get first 10 CoverImports
     * const coverImports = await prisma.coverImport.findMany({ take: 10 })
     * 
     * // Only select the `coverId`
     * const coverImportWithCoverIdOnly = await prisma.coverImport.findMany({ select: { coverId: true } })
     * 
    **/
    findMany<T extends coverImportFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a CoverImport.
     * @param {coverImportCreateArgs} args - Arguments to create a CoverImport.
     * @example
     * // Create one CoverImport
     * const CoverImport = await prisma.coverImport.create({
     *   data: {
     *     // ... data to create a CoverImport
     *   }
     * })
     * 
    **/
    create<T extends coverImportCreateArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportCreateArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many CoverImports.
     *     @param {coverImportCreateManyArgs} args - Arguments to create many CoverImports.
     *     @example
     *     // Create many CoverImports
     *     const coverImport = await prisma.coverImport.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends coverImportCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a CoverImport.
     * @param {coverImportDeleteArgs} args - Arguments to delete one CoverImport.
     * @example
     * // Delete one CoverImport
     * const CoverImport = await prisma.coverImport.delete({
     *   where: {
     *     // ... filter to delete one CoverImport
     *   }
     * })
     * 
    **/
    delete<T extends coverImportDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportDeleteArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one CoverImport.
     * @param {coverImportUpdateArgs} args - Arguments to update one CoverImport.
     * @example
     * // Update one CoverImport
     * const coverImport = await prisma.coverImport.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends coverImportUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportUpdateArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more CoverImports.
     * @param {coverImportDeleteManyArgs} args - Arguments to filter CoverImports to delete.
     * @example
     * // Delete a few CoverImports
     * const { count } = await prisma.coverImport.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends coverImportDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverImportDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CoverImports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CoverImports
     * const coverImport = await prisma.coverImport.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends coverImportUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CoverImport.
     * @param {coverImportUpsertArgs} args - Arguments to update or create a CoverImport.
     * @example
     * // Update or create a CoverImport
     * const coverImport = await prisma.coverImport.upsert({
     *   create: {
     *     // ... data to create a CoverImport
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CoverImport we want to update
     *   }
     * })
    **/
    upsert<T extends coverImportUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, coverImportUpsertArgs<ExtArgs>>
    ): Prisma__coverImportClient<$Result.GetResult<Prisma.$coverImportPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of CoverImports.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportCountArgs} args - Arguments to filter CoverImports to count.
     * @example
     * // Count the number of CoverImports
     * const count = await prisma.coverImport.count({
     *   where: {
     *     // ... the filter for the CoverImports we want to count
     *   }
     * })
    **/
    count<T extends coverImportCountArgs>(
      args?: Subset<T, coverImportCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverImportCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CoverImport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverImportAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CoverImportAggregateArgs>(args: Subset<T, CoverImportAggregateArgs>): Prisma.PrismaPromise<GetCoverImportAggregateType<T>>

    /**
     * Group by CoverImport.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverImportGroupByArgs} args - Group by arguments.
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
      T extends coverImportGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: coverImportGroupByArgs['orderBy'] }
        : { orderBy?: coverImportGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, coverImportGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverImportGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the coverImport model
   */
  readonly fields: coverImportFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for coverImport.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__coverImportClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the coverImport model
   */ 
  interface coverImportFieldRefs {
    readonly coverId: FieldRef<"coverImport", 'Int'>
    readonly importedAt: FieldRef<"coverImport", 'DateTime'>
    readonly importError: FieldRef<"coverImport", 'String'>
  }
    

  // Custom InputTypes

  /**
   * coverImport findUnique
   */
  export type coverImportFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter, which coverImport to fetch.
     */
    where: coverImportWhereUniqueInput
  }


  /**
   * coverImport findUniqueOrThrow
   */
  export type coverImportFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter, which coverImport to fetch.
     */
    where: coverImportWhereUniqueInput
  }


  /**
   * coverImport findFirst
   */
  export type coverImportFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter, which coverImport to fetch.
     */
    where?: coverImportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coverImports to fetch.
     */
    orderBy?: coverImportOrderByWithRelationInput | coverImportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for coverImports.
     */
    cursor?: coverImportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coverImports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coverImports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of coverImports.
     */
    distinct?: CoverImportScalarFieldEnum | CoverImportScalarFieldEnum[]
  }


  /**
   * coverImport findFirstOrThrow
   */
  export type coverImportFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter, which coverImport to fetch.
     */
    where?: coverImportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coverImports to fetch.
     */
    orderBy?: coverImportOrderByWithRelationInput | coverImportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for coverImports.
     */
    cursor?: coverImportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coverImports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coverImports.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of coverImports.
     */
    distinct?: CoverImportScalarFieldEnum | CoverImportScalarFieldEnum[]
  }


  /**
   * coverImport findMany
   */
  export type coverImportFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter, which coverImports to fetch.
     */
    where?: coverImportWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of coverImports to fetch.
     */
    orderBy?: coverImportOrderByWithRelationInput | coverImportOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing coverImports.
     */
    cursor?: coverImportWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` coverImports from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` coverImports.
     */
    skip?: number
    distinct?: CoverImportScalarFieldEnum | CoverImportScalarFieldEnum[]
  }


  /**
   * coverImport create
   */
  export type coverImportCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * The data needed to create a coverImport.
     */
    data?: XOR<coverImportCreateInput, coverImportUncheckedCreateInput>
  }


  /**
   * coverImport createMany
   */
  export type coverImportCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many coverImports.
     */
    data: coverImportCreateManyInput | coverImportCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * coverImport update
   */
  export type coverImportUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * The data needed to update a coverImport.
     */
    data: XOR<coverImportUpdateInput, coverImportUncheckedUpdateInput>
    /**
     * Choose, which coverImport to update.
     */
    where: coverImportWhereUniqueInput
  }


  /**
   * coverImport updateMany
   */
  export type coverImportUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update coverImports.
     */
    data: XOR<coverImportUpdateManyMutationInput, coverImportUncheckedUpdateManyInput>
    /**
     * Filter which coverImports to update
     */
    where?: coverImportWhereInput
  }


  /**
   * coverImport upsert
   */
  export type coverImportUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * The filter to search for the coverImport to update in case it exists.
     */
    where: coverImportWhereUniqueInput
    /**
     * In case the coverImport found by the `where` argument doesn't exist, create a new coverImport with this data.
     */
    create: XOR<coverImportCreateInput, coverImportUncheckedCreateInput>
    /**
     * In case the coverImport was found with the provided `where` argument, update it with this data.
     */
    update: XOR<coverImportUpdateInput, coverImportUncheckedUpdateInput>
  }


  /**
   * coverImport delete
   */
  export type coverImportDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
    /**
     * Filter which coverImport to delete.
     */
    where: coverImportWhereUniqueInput
  }


  /**
   * coverImport deleteMany
   */
  export type coverImportDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which coverImports to delete
     */
    where?: coverImportWhereInput
  }


  /**
   * coverImport without action
   */
  export type coverImportDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the coverImport
     */
    select?: coverImportSelect<ExtArgs> | null
  }



  /**
   * Model cover
   */

  export type AggregateCover = {
    _count: CoverCountAggregateOutputType | null
    _avg: CoverAvgAggregateOutputType | null
    _sum: CoverSumAggregateOutputType | null
    _min: CoverMinAggregateOutputType | null
    _max: CoverMaxAggregateOutputType | null
  }

  export type CoverAvgAggregateOutputType = {
    id: number | null
  }

  export type CoverSumAggregateOutputType = {
    id: number | null
  }

  export type CoverMinAggregateOutputType = {
    id: number | null
    issuecode: string | null
    sitecode: string | null
    url: string | null
  }

  export type CoverMaxAggregateOutputType = {
    id: number | null
    issuecode: string | null
    sitecode: string | null
    url: string | null
  }

  export type CoverCountAggregateOutputType = {
    id: number
    issuecode: number
    sitecode: number
    url: number
    _all: number
  }


  export type CoverAvgAggregateInputType = {
    id?: true
  }

  export type CoverSumAggregateInputType = {
    id?: true
  }

  export type CoverMinAggregateInputType = {
    id?: true
    issuecode?: true
    sitecode?: true
    url?: true
  }

  export type CoverMaxAggregateInputType = {
    id?: true
    issuecode?: true
    sitecode?: true
    url?: true
  }

  export type CoverCountAggregateInputType = {
    id?: true
    issuecode?: true
    sitecode?: true
    url?: true
    _all?: true
  }

  export type CoverAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which cover to aggregate.
     */
    where?: coverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of covers to fetch.
     */
    orderBy?: coverOrderByWithRelationInput | coverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: coverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` covers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` covers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned covers
    **/
    _count?: true | CoverCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CoverAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CoverSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CoverMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CoverMaxAggregateInputType
  }

  export type GetCoverAggregateType<T extends CoverAggregateArgs> = {
        [P in keyof T & keyof AggregateCover]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCover[P]>
      : GetScalarType<T[P], AggregateCover[P]>
  }




  export type coverGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: coverWhereInput
    orderBy?: coverOrderByWithAggregationInput | coverOrderByWithAggregationInput[]
    by: CoverScalarFieldEnum[] | CoverScalarFieldEnum
    having?: coverScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CoverCountAggregateInputType | true
    _avg?: CoverAvgAggregateInputType
    _sum?: CoverSumAggregateInputType
    _min?: CoverMinAggregateInputType
    _max?: CoverMaxAggregateInputType
  }

  export type CoverGroupByOutputType = {
    id: number
    issuecode: string
    sitecode: string
    url: string
    _count: CoverCountAggregateOutputType | null
    _avg: CoverAvgAggregateOutputType | null
    _sum: CoverSumAggregateOutputType | null
    _min: CoverMinAggregateOutputType | null
    _max: CoverMaxAggregateOutputType | null
  }

  type GetCoverGroupByPayload<T extends coverGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CoverGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CoverGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CoverGroupByOutputType[P]>
            : GetScalarType<T[P], CoverGroupByOutputType[P]>
        }
      >
    >


  export type coverSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    issuecode?: boolean
    sitecode?: boolean
    url?: boolean
  }, ExtArgs["result"]["cover"]>

  export type coverSelectScalar = {
    id?: boolean
    issuecode?: boolean
    sitecode?: boolean
    url?: boolean
  }


  export type $coverPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "cover"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      issuecode: string
      sitecode: string
      url: string
    }, ExtArgs["result"]["cover"]>
    composites: {}
  }


  type coverGetPayload<S extends boolean | null | undefined | coverDefaultArgs> = $Result.GetResult<Prisma.$coverPayload, S>

  type coverCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<coverFindManyArgs, 'select' | 'include'> & {
      select?: CoverCountAggregateInputType | true
    }

  export interface coverDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['cover'], meta: { name: 'cover' } }
    /**
     * Find zero or one Cover that matches the filter.
     * @param {coverFindUniqueArgs} args - Arguments to find a Cover
     * @example
     * // Get one Cover
     * const cover = await prisma.cover.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends coverFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, coverFindUniqueArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Cover that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {coverFindUniqueOrThrowArgs} args - Arguments to find a Cover
     * @example
     * // Get one Cover
     * const cover = await prisma.cover.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends coverFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, coverFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Cover that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverFindFirstArgs} args - Arguments to find a Cover
     * @example
     * // Get one Cover
     * const cover = await prisma.cover.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends coverFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, coverFindFirstArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Cover that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverFindFirstOrThrowArgs} args - Arguments to find a Cover
     * @example
     * // Get one Cover
     * const cover = await prisma.cover.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends coverFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, coverFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Covers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Covers
     * const covers = await prisma.cover.findMany()
     * 
     * // Get first 10 Covers
     * const covers = await prisma.cover.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const coverWithIdOnly = await prisma.cover.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends coverFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Cover.
     * @param {coverCreateArgs} args - Arguments to create a Cover.
     * @example
     * // Create one Cover
     * const Cover = await prisma.cover.create({
     *   data: {
     *     // ... data to create a Cover
     *   }
     * })
     * 
    **/
    create<T extends coverCreateArgs<ExtArgs>>(
      args: SelectSubset<T, coverCreateArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Covers.
     *     @param {coverCreateManyArgs} args - Arguments to create many Covers.
     *     @example
     *     // Create many Covers
     *     const cover = await prisma.cover.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends coverCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Cover.
     * @param {coverDeleteArgs} args - Arguments to delete one Cover.
     * @example
     * // Delete one Cover
     * const Cover = await prisma.cover.delete({
     *   where: {
     *     // ... filter to delete one Cover
     *   }
     * })
     * 
    **/
    delete<T extends coverDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, coverDeleteArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Cover.
     * @param {coverUpdateArgs} args - Arguments to update one Cover.
     * @example
     * // Update one Cover
     * const cover = await prisma.cover.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends coverUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, coverUpdateArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Covers.
     * @param {coverDeleteManyArgs} args - Arguments to filter Covers to delete.
     * @example
     * // Delete a few Covers
     * const { count } = await prisma.cover.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends coverDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, coverDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Covers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Covers
     * const cover = await prisma.cover.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends coverUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, coverUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Cover.
     * @param {coverUpsertArgs} args - Arguments to update or create a Cover.
     * @example
     * // Update or create a Cover
     * const cover = await prisma.cover.upsert({
     *   create: {
     *     // ... data to create a Cover
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cover we want to update
     *   }
     * })
    **/
    upsert<T extends coverUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, coverUpsertArgs<ExtArgs>>
    ): Prisma__coverClient<$Result.GetResult<Prisma.$coverPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Covers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverCountArgs} args - Arguments to filter Covers to count.
     * @example
     * // Count the number of Covers
     * const count = await prisma.cover.count({
     *   where: {
     *     // ... the filter for the Covers we want to count
     *   }
     * })
    **/
    count<T extends coverCountArgs>(
      args?: Subset<T, coverCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CoverCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cover.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CoverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CoverAggregateArgs>(args: Subset<T, CoverAggregateArgs>): Prisma.PrismaPromise<GetCoverAggregateType<T>>

    /**
     * Group by Cover.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {coverGroupByArgs} args - Group by arguments.
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
      T extends coverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: coverGroupByArgs['orderBy'] }
        : { orderBy?: coverGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, coverGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCoverGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the cover model
   */
  readonly fields: coverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for cover.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__coverClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the cover model
   */ 
  interface coverFieldRefs {
    readonly id: FieldRef<"cover", 'Int'>
    readonly issuecode: FieldRef<"cover", 'String'>
    readonly sitecode: FieldRef<"cover", 'String'>
    readonly url: FieldRef<"cover", 'String'>
  }
    

  // Custom InputTypes

  /**
   * cover findUnique
   */
  export type coverFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter, which cover to fetch.
     */
    where: coverWhereUniqueInput
  }


  /**
   * cover findUniqueOrThrow
   */
  export type coverFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter, which cover to fetch.
     */
    where: coverWhereUniqueInput
  }


  /**
   * cover findFirst
   */
  export type coverFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter, which cover to fetch.
     */
    where?: coverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of covers to fetch.
     */
    orderBy?: coverOrderByWithRelationInput | coverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for covers.
     */
    cursor?: coverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` covers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` covers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of covers.
     */
    distinct?: CoverScalarFieldEnum | CoverScalarFieldEnum[]
  }


  /**
   * cover findFirstOrThrow
   */
  export type coverFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter, which cover to fetch.
     */
    where?: coverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of covers to fetch.
     */
    orderBy?: coverOrderByWithRelationInput | coverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for covers.
     */
    cursor?: coverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` covers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` covers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of covers.
     */
    distinct?: CoverScalarFieldEnum | CoverScalarFieldEnum[]
  }


  /**
   * cover findMany
   */
  export type coverFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter, which covers to fetch.
     */
    where?: coverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of covers to fetch.
     */
    orderBy?: coverOrderByWithRelationInput | coverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing covers.
     */
    cursor?: coverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` covers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` covers.
     */
    skip?: number
    distinct?: CoverScalarFieldEnum | CoverScalarFieldEnum[]
  }


  /**
   * cover create
   */
  export type coverCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * The data needed to create a cover.
     */
    data: XOR<coverCreateInput, coverUncheckedCreateInput>
  }


  /**
   * cover createMany
   */
  export type coverCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many covers.
     */
    data: coverCreateManyInput | coverCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * cover update
   */
  export type coverUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * The data needed to update a cover.
     */
    data: XOR<coverUpdateInput, coverUncheckedUpdateInput>
    /**
     * Choose, which cover to update.
     */
    where: coverWhereUniqueInput
  }


  /**
   * cover updateMany
   */
  export type coverUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update covers.
     */
    data: XOR<coverUpdateManyMutationInput, coverUncheckedUpdateManyInput>
    /**
     * Filter which covers to update
     */
    where?: coverWhereInput
  }


  /**
   * cover upsert
   */
  export type coverUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * The filter to search for the cover to update in case it exists.
     */
    where: coverWhereUniqueInput
    /**
     * In case the cover found by the `where` argument doesn't exist, create a new cover with this data.
     */
    create: XOR<coverCreateInput, coverUncheckedCreateInput>
    /**
     * In case the cover was found with the provided `where` argument, update it with this data.
     */
    update: XOR<coverUpdateInput, coverUncheckedUpdateInput>
  }


  /**
   * cover delete
   */
  export type coverDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
    /**
     * Filter which cover to delete.
     */
    where: coverWhereUniqueInput
  }


  /**
   * cover deleteMany
   */
  export type coverDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which covers to delete
     */
    where?: coverWhereInput
  }


  /**
   * cover without action
   */
  export type coverDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cover
     */
    select?: coverSelect<ExtArgs> | null
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


  export const CoverImportScalarFieldEnum: {
    coverId: 'coverId',
    importedAt: 'importedAt',
    importError: 'importError'
  };

  export type CoverImportScalarFieldEnum = (typeof CoverImportScalarFieldEnum)[keyof typeof CoverImportScalarFieldEnum]


  export const CoverScalarFieldEnum: {
    id: 'id',
    issuecode: 'issuecode',
    sitecode: 'sitecode',
    url: 'url'
  };

  export type CoverScalarFieldEnum = (typeof CoverScalarFieldEnum)[keyof typeof CoverScalarFieldEnum]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type coverImportWhereInput = {
    AND?: coverImportWhereInput | coverImportWhereInput[]
    OR?: coverImportWhereInput[]
    NOT?: coverImportWhereInput | coverImportWhereInput[]
    coverId?: IntFilter<"coverImport"> | number
    importedAt?: DateTimeNullableFilter<"coverImport"> | Date | string | null
    importError?: StringNullableFilter<"coverImport"> | string | null
  }

  export type coverImportOrderByWithRelationInput = {
    coverId?: SortOrder
    importedAt?: SortOrderInput | SortOrder
    importError?: SortOrderInput | SortOrder
  }

  export type coverImportWhereUniqueInput = Prisma.AtLeast<{
    coverId?: number
    coverId_importedAt_importError?: coverImportCoverIdImportedAtImportErrorCompoundUniqueInput
    AND?: coverImportWhereInput | coverImportWhereInput[]
    OR?: coverImportWhereInput[]
    NOT?: coverImportWhereInput | coverImportWhereInput[]
    importedAt?: DateTimeNullableFilter<"coverImport"> | Date | string | null
    importError?: StringNullableFilter<"coverImport"> | string | null
  }, "coverId" | "coverId_importedAt_importError">

  export type coverImportOrderByWithAggregationInput = {
    coverId?: SortOrder
    importedAt?: SortOrderInput | SortOrder
    importError?: SortOrderInput | SortOrder
    _count?: coverImportCountOrderByAggregateInput
    _avg?: coverImportAvgOrderByAggregateInput
    _max?: coverImportMaxOrderByAggregateInput
    _min?: coverImportMinOrderByAggregateInput
    _sum?: coverImportSumOrderByAggregateInput
  }

  export type coverImportScalarWhereWithAggregatesInput = {
    AND?: coverImportScalarWhereWithAggregatesInput | coverImportScalarWhereWithAggregatesInput[]
    OR?: coverImportScalarWhereWithAggregatesInput[]
    NOT?: coverImportScalarWhereWithAggregatesInput | coverImportScalarWhereWithAggregatesInput[]
    coverId?: IntWithAggregatesFilter<"coverImport"> | number
    importedAt?: DateTimeNullableWithAggregatesFilter<"coverImport"> | Date | string | null
    importError?: StringNullableWithAggregatesFilter<"coverImport"> | string | null
  }

  export type coverWhereInput = {
    AND?: coverWhereInput | coverWhereInput[]
    OR?: coverWhereInput[]
    NOT?: coverWhereInput | coverWhereInput[]
    id?: IntFilter<"cover"> | number
    issuecode?: StringFilter<"cover"> | string
    sitecode?: StringFilter<"cover"> | string
    url?: StringFilter<"cover"> | string
  }

  export type coverOrderByWithRelationInput = {
    id?: SortOrder
    issuecode?: SortOrder
    sitecode?: SortOrder
    url?: SortOrder
  }

  export type coverWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    issuecode_url?: coverIssuecodeUrlCompoundUniqueInput
    AND?: coverWhereInput | coverWhereInput[]
    OR?: coverWhereInput[]
    NOT?: coverWhereInput | coverWhereInput[]
    issuecode?: StringFilter<"cover"> | string
    sitecode?: StringFilter<"cover"> | string
    url?: StringFilter<"cover"> | string
  }, "id" | "issuecode_url">

  export type coverOrderByWithAggregationInput = {
    id?: SortOrder
    issuecode?: SortOrder
    sitecode?: SortOrder
    url?: SortOrder
    _count?: coverCountOrderByAggregateInput
    _avg?: coverAvgOrderByAggregateInput
    _max?: coverMaxOrderByAggregateInput
    _min?: coverMinOrderByAggregateInput
    _sum?: coverSumOrderByAggregateInput
  }

  export type coverScalarWhereWithAggregatesInput = {
    AND?: coverScalarWhereWithAggregatesInput | coverScalarWhereWithAggregatesInput[]
    OR?: coverScalarWhereWithAggregatesInput[]
    NOT?: coverScalarWhereWithAggregatesInput | coverScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"cover"> | number
    issuecode?: StringWithAggregatesFilter<"cover"> | string
    sitecode?: StringWithAggregatesFilter<"cover"> | string
    url?: StringWithAggregatesFilter<"cover"> | string
  }

  export type coverImportCreateInput = {
    importedAt?: Date | string | null
    importError?: string | null
  }

  export type coverImportUncheckedCreateInput = {
    coverId?: number
    importedAt?: Date | string | null
    importError?: string | null
  }

  export type coverImportUpdateInput = {
    importedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    importError?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type coverImportUncheckedUpdateInput = {
    coverId?: IntFieldUpdateOperationsInput | number
    importedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    importError?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type coverImportCreateManyInput = {
    coverId?: number
    importedAt?: Date | string | null
    importError?: string | null
  }

  export type coverImportUpdateManyMutationInput = {
    importedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    importError?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type coverImportUncheckedUpdateManyInput = {
    coverId?: IntFieldUpdateOperationsInput | number
    importedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    importError?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type coverCreateInput = {
    issuecode: string
    sitecode: string
    url: string
  }

  export type coverUncheckedCreateInput = {
    id?: number
    issuecode: string
    sitecode: string
    url: string
  }

  export type coverUpdateInput = {
    issuecode?: StringFieldUpdateOperationsInput | string
    sitecode?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
  }

  export type coverUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    issuecode?: StringFieldUpdateOperationsInput | string
    sitecode?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
  }

  export type coverCreateManyInput = {
    id?: number
    issuecode: string
    sitecode: string
    url: string
  }

  export type coverUpdateManyMutationInput = {
    issuecode?: StringFieldUpdateOperationsInput | string
    sitecode?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
  }

  export type coverUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    issuecode?: StringFieldUpdateOperationsInput | string
    sitecode?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
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

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type coverImportCoverIdImportedAtImportErrorCompoundUniqueInput = {
    coverId: number
    importedAt: Date | string
    importError: string
  }

  export type coverImportCountOrderByAggregateInput = {
    coverId?: SortOrder
    importedAt?: SortOrder
    importError?: SortOrder
  }

  export type coverImportAvgOrderByAggregateInput = {
    coverId?: SortOrder
  }

  export type coverImportMaxOrderByAggregateInput = {
    coverId?: SortOrder
    importedAt?: SortOrder
    importError?: SortOrder
  }

  export type coverImportMinOrderByAggregateInput = {
    coverId?: SortOrder
    importedAt?: SortOrder
    importError?: SortOrder
  }

  export type coverImportSumOrderByAggregateInput = {
    coverId?: SortOrder
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

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type coverIssuecodeUrlCompoundUniqueInput = {
    issuecode: string
    url: string
  }

  export type coverCountOrderByAggregateInput = {
    id?: SortOrder
    issuecode?: SortOrder
    sitecode?: SortOrder
    url?: SortOrder
  }

  export type coverAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type coverMaxOrderByAggregateInput = {
    id?: SortOrder
    issuecode?: SortOrder
    sitecode?: SortOrder
    url?: SortOrder
  }

  export type coverMinOrderByAggregateInput = {
    id?: SortOrder
    issuecode?: SortOrder
    sitecode?: SortOrder
    url?: SortOrder
  }

  export type coverSumOrderByAggregateInput = {
    id?: SortOrder
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

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
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

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
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

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use coverImportDefaultArgs instead
     */
    export type coverImportArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = coverImportDefaultArgs<ExtArgs>
    /**
     * @deprecated Use coverDefaultArgs instead
     */
    export type coverArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = coverDefaultArgs<ExtArgs>

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