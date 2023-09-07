
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
 * Model optionInterval
 * 
 */
export type optionInterval = $Result.DefaultSelection<Prisma.$optionIntervalPayload>
/**
 * Model edgeModelOld
 * 
 */
export type edgeModelOld = $Result.DefaultSelection<Prisma.$edgeModelOldPayload>
/**
 * Model optionValue
 * 
 */
export type optionValue = $Result.DefaultSelection<Prisma.$optionValuePayload>
/**
 * Model myfontsImage
 * 
 */
export type myfontsImage = $Result.DefaultSelection<Prisma.$myfontsImagePayload>
/**
 * Model elementImage
 * 
 */
export type elementImage = $Result.DefaultSelection<Prisma.$elementImagePayload>
/**
 * Model edgeModel
 * 
 */
export type edgeModel = $Result.DefaultSelection<Prisma.$edgeModelPayload>
/**
 * Model edgeContributor
 * 
 */
export type edgeContributor = $Result.DefaultSelection<Prisma.$edgeContributorPayload>
/**
 * Model edgePhoto
 * 
 */
export type edgePhoto = $Result.DefaultSelection<Prisma.$edgePhotoPayload>
/**
 * Model edgeValue
 * 
 */
export type edgeValue = $Result.DefaultSelection<Prisma.$edgeValuePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const contribution: {
  photographe: 'photographe',
  createur: 'createur'
};

export type contribution = (typeof contribution)[keyof typeof contribution]

}

export type contribution = $Enums.contribution

export const contribution: typeof $Enums.contribution

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more OptionIntervals
 * const optionIntervals = await prisma.optionInterval.findMany()
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
   * // Fetch zero or more OptionIntervals
   * const optionIntervals = await prisma.optionInterval.findMany()
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
   * `prisma.optionInterval`: Exposes CRUD operations for the **optionInterval** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OptionIntervals
    * const optionIntervals = await prisma.optionInterval.findMany()
    * ```
    */
  get optionInterval(): Prisma.optionIntervalDelegate<ExtArgs>;

  /**
   * `prisma.edgeModelOld`: Exposes CRUD operations for the **edgeModelOld** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdgeModelOlds
    * const edgeModelOlds = await prisma.edgeModelOld.findMany()
    * ```
    */
  get edgeModelOld(): Prisma.edgeModelOldDelegate<ExtArgs>;

  /**
   * `prisma.optionValue`: Exposes CRUD operations for the **optionValue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OptionValues
    * const optionValues = await prisma.optionValue.findMany()
    * ```
    */
  get optionValue(): Prisma.optionValueDelegate<ExtArgs>;

  /**
   * `prisma.myfontsImage`: Exposes CRUD operations for the **myfontsImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MyfontsImages
    * const myfontsImages = await prisma.myfontsImage.findMany()
    * ```
    */
  get myfontsImage(): Prisma.myfontsImageDelegate<ExtArgs>;

  /**
   * `prisma.elementImage`: Exposes CRUD operations for the **elementImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ElementImages
    * const elementImages = await prisma.elementImage.findMany()
    * ```
    */
  get elementImage(): Prisma.elementImageDelegate<ExtArgs>;

  /**
   * `prisma.edgeModel`: Exposes CRUD operations for the **edgeModel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdgeModels
    * const edgeModels = await prisma.edgeModel.findMany()
    * ```
    */
  get edgeModel(): Prisma.edgeModelDelegate<ExtArgs>;

  /**
   * `prisma.edgeContributor`: Exposes CRUD operations for the **edgeContributor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdgeContributors
    * const edgeContributors = await prisma.edgeContributor.findMany()
    * ```
    */
  get edgeContributor(): Prisma.edgeContributorDelegate<ExtArgs>;

  /**
   * `prisma.edgePhoto`: Exposes CRUD operations for the **edgePhoto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdgePhotos
    * const edgePhotos = await prisma.edgePhoto.findMany()
    * ```
    */
  get edgePhoto(): Prisma.edgePhotoDelegate<ExtArgs>;

  /**
   * `prisma.edgeValue`: Exposes CRUD operations for the **edgeValue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EdgeValues
    * const edgeValues = await prisma.edgeValue.findMany()
    * ```
    */
  get edgeValue(): Prisma.edgeValueDelegate<ExtArgs>;
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.Args}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'optionInterval' | 'edgeModelOld' | 'optionValue' | 'myfontsImage' | 'elementImage' | 'edgeModel' | 'edgeContributor' | 'edgePhoto' | 'edgeValue'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      optionInterval: {
        payload: Prisma.$optionIntervalPayload<ExtArgs>
        fields: Prisma.optionIntervalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.optionIntervalFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.optionIntervalFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          findFirst: {
            args: Prisma.optionIntervalFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.optionIntervalFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          findMany: {
            args: Prisma.optionIntervalFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>[]
          }
          create: {
            args: Prisma.optionIntervalCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          createMany: {
            args: Prisma.optionIntervalCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.optionIntervalDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          update: {
            args: Prisma.optionIntervalUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          deleteMany: {
            args: Prisma.optionIntervalDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.optionIntervalUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.optionIntervalUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionIntervalPayload>
          }
          aggregate: {
            args: Prisma.OptionIntervalAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateOptionInterval>
          }
          groupBy: {
            args: Prisma.optionIntervalGroupByArgs<ExtArgs>,
            result: $Utils.Optional<OptionIntervalGroupByOutputType>[]
          }
          count: {
            args: Prisma.optionIntervalCountArgs<ExtArgs>,
            result: $Utils.Optional<OptionIntervalCountAggregateOutputType> | number
          }
        }
      }
      edgeModelOld: {
        payload: Prisma.$edgeModelOldPayload<ExtArgs>
        fields: Prisma.edgeModelOldFieldRefs
        operations: {
          findUnique: {
            args: Prisma.edgeModelOldFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.edgeModelOldFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          findFirst: {
            args: Prisma.edgeModelOldFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.edgeModelOldFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          findMany: {
            args: Prisma.edgeModelOldFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>[]
          }
          create: {
            args: Prisma.edgeModelOldCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          createMany: {
            args: Prisma.edgeModelOldCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.edgeModelOldDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          update: {
            args: Prisma.edgeModelOldUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          deleteMany: {
            args: Prisma.edgeModelOldDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.edgeModelOldUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.edgeModelOldUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelOldPayload>
          }
          aggregate: {
            args: Prisma.EdgeModelOldAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEdgeModelOld>
          }
          groupBy: {
            args: Prisma.edgeModelOldGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EdgeModelOldGroupByOutputType>[]
          }
          count: {
            args: Prisma.edgeModelOldCountArgs<ExtArgs>,
            result: $Utils.Optional<EdgeModelOldCountAggregateOutputType> | number
          }
        }
      }
      optionValue: {
        payload: Prisma.$optionValuePayload<ExtArgs>
        fields: Prisma.optionValueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.optionValueFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.optionValueFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          findFirst: {
            args: Prisma.optionValueFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.optionValueFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          findMany: {
            args: Prisma.optionValueFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>[]
          }
          create: {
            args: Prisma.optionValueCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          createMany: {
            args: Prisma.optionValueCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.optionValueDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          update: {
            args: Prisma.optionValueUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          deleteMany: {
            args: Prisma.optionValueDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.optionValueUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.optionValueUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$optionValuePayload>
          }
          aggregate: {
            args: Prisma.OptionValueAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateOptionValue>
          }
          groupBy: {
            args: Prisma.optionValueGroupByArgs<ExtArgs>,
            result: $Utils.Optional<OptionValueGroupByOutputType>[]
          }
          count: {
            args: Prisma.optionValueCountArgs<ExtArgs>,
            result: $Utils.Optional<OptionValueCountAggregateOutputType> | number
          }
        }
      }
      myfontsImage: {
        payload: Prisma.$myfontsImagePayload<ExtArgs>
        fields: Prisma.myfontsImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.myfontsImageFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.myfontsImageFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          findFirst: {
            args: Prisma.myfontsImageFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.myfontsImageFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          findMany: {
            args: Prisma.myfontsImageFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>[]
          }
          create: {
            args: Prisma.myfontsImageCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          createMany: {
            args: Prisma.myfontsImageCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.myfontsImageDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          update: {
            args: Prisma.myfontsImageUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          deleteMany: {
            args: Prisma.myfontsImageDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.myfontsImageUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.myfontsImageUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$myfontsImagePayload>
          }
          aggregate: {
            args: Prisma.MyfontsImageAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateMyfontsImage>
          }
          groupBy: {
            args: Prisma.myfontsImageGroupByArgs<ExtArgs>,
            result: $Utils.Optional<MyfontsImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.myfontsImageCountArgs<ExtArgs>,
            result: $Utils.Optional<MyfontsImageCountAggregateOutputType> | number
          }
        }
      }
      elementImage: {
        payload: Prisma.$elementImagePayload<ExtArgs>
        fields: Prisma.elementImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.elementImageFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.elementImageFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          findFirst: {
            args: Prisma.elementImageFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.elementImageFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          findMany: {
            args: Prisma.elementImageFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>[]
          }
          create: {
            args: Prisma.elementImageCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          createMany: {
            args: Prisma.elementImageCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.elementImageDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          update: {
            args: Prisma.elementImageUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          deleteMany: {
            args: Prisma.elementImageDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.elementImageUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.elementImageUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$elementImagePayload>
          }
          aggregate: {
            args: Prisma.ElementImageAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateElementImage>
          }
          groupBy: {
            args: Prisma.elementImageGroupByArgs<ExtArgs>,
            result: $Utils.Optional<ElementImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.elementImageCountArgs<ExtArgs>,
            result: $Utils.Optional<ElementImageCountAggregateOutputType> | number
          }
        }
      }
      edgeModel: {
        payload: Prisma.$edgeModelPayload<ExtArgs>
        fields: Prisma.edgeModelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.edgeModelFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.edgeModelFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          findFirst: {
            args: Prisma.edgeModelFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.edgeModelFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          findMany: {
            args: Prisma.edgeModelFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>[]
          }
          create: {
            args: Prisma.edgeModelCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          createMany: {
            args: Prisma.edgeModelCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.edgeModelDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          update: {
            args: Prisma.edgeModelUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          deleteMany: {
            args: Prisma.edgeModelDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.edgeModelUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.edgeModelUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeModelPayload>
          }
          aggregate: {
            args: Prisma.EdgeModelAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEdgeModel>
          }
          groupBy: {
            args: Prisma.edgeModelGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EdgeModelGroupByOutputType>[]
          }
          count: {
            args: Prisma.edgeModelCountArgs<ExtArgs>,
            result: $Utils.Optional<EdgeModelCountAggregateOutputType> | number
          }
        }
      }
      edgeContributor: {
        payload: Prisma.$edgeContributorPayload<ExtArgs>
        fields: Prisma.edgeContributorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.edgeContributorFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.edgeContributorFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          findFirst: {
            args: Prisma.edgeContributorFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.edgeContributorFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          findMany: {
            args: Prisma.edgeContributorFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>[]
          }
          create: {
            args: Prisma.edgeContributorCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          createMany: {
            args: Prisma.edgeContributorCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.edgeContributorDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          update: {
            args: Prisma.edgeContributorUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          deleteMany: {
            args: Prisma.edgeContributorDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.edgeContributorUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.edgeContributorUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeContributorPayload>
          }
          aggregate: {
            args: Prisma.EdgeContributorAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEdgeContributor>
          }
          groupBy: {
            args: Prisma.edgeContributorGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EdgeContributorGroupByOutputType>[]
          }
          count: {
            args: Prisma.edgeContributorCountArgs<ExtArgs>,
            result: $Utils.Optional<EdgeContributorCountAggregateOutputType> | number
          }
        }
      }
      edgePhoto: {
        payload: Prisma.$edgePhotoPayload<ExtArgs>
        fields: Prisma.edgePhotoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.edgePhotoFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.edgePhotoFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          findFirst: {
            args: Prisma.edgePhotoFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.edgePhotoFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          findMany: {
            args: Prisma.edgePhotoFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>[]
          }
          create: {
            args: Prisma.edgePhotoCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          createMany: {
            args: Prisma.edgePhotoCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.edgePhotoDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          update: {
            args: Prisma.edgePhotoUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          deleteMany: {
            args: Prisma.edgePhotoDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.edgePhotoUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.edgePhotoUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgePhotoPayload>
          }
          aggregate: {
            args: Prisma.EdgePhotoAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEdgePhoto>
          }
          groupBy: {
            args: Prisma.edgePhotoGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EdgePhotoGroupByOutputType>[]
          }
          count: {
            args: Prisma.edgePhotoCountArgs<ExtArgs>,
            result: $Utils.Optional<EdgePhotoCountAggregateOutputType> | number
          }
        }
      }
      edgeValue: {
        payload: Prisma.$edgeValuePayload<ExtArgs>
        fields: Prisma.edgeValueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.edgeValueFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.edgeValueFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          findFirst: {
            args: Prisma.edgeValueFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.edgeValueFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          findMany: {
            args: Prisma.edgeValueFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>[]
          }
          create: {
            args: Prisma.edgeValueCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          createMany: {
            args: Prisma.edgeValueCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.edgeValueDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          update: {
            args: Prisma.edgeValueUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          deleteMany: {
            args: Prisma.edgeValueDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.edgeValueUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.edgeValueUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$edgeValuePayload>
          }
          aggregate: {
            args: Prisma.EdgeValueAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEdgeValue>
          }
          groupBy: {
            args: Prisma.edgeValueGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EdgeValueGroupByOutputType>[]
          }
          count: {
            args: Prisma.edgeValueCountArgs<ExtArgs>,
            result: $Utils.Optional<EdgeValueCountAggregateOutputType> | number
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
   * Count Type ElementImageCountOutputType
   */

  export type ElementImageCountOutputType = {
    tranches_en_cours_modeles_images: number
  }

  export type ElementImageCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    tranches_en_cours_modeles_images?: boolean | ElementImageCountOutputTypeCountTranches_en_cours_modeles_imagesArgs
  }

  // Custom InputTypes

  /**
   * ElementImageCountOutputType without action
   */
  export type ElementImageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ElementImageCountOutputType
     */
    select?: ElementImageCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * ElementImageCountOutputType without action
   */
  export type ElementImageCountOutputTypeCountTranches_en_cours_modeles_imagesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgePhotoWhereInput
  }



  /**
   * Count Type EdgeModelCountOutputType
   */

  export type EdgeModelCountOutputType = {
    contributors: number
    photos: number
    values: number
  }

  export type EdgeModelCountOutputTypeSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    contributors?: boolean | EdgeModelCountOutputTypeCountContributorsArgs
    photos?: boolean | EdgeModelCountOutputTypeCountPhotosArgs
    values?: boolean | EdgeModelCountOutputTypeCountValuesArgs
  }

  // Custom InputTypes

  /**
   * EdgeModelCountOutputType without action
   */
  export type EdgeModelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EdgeModelCountOutputType
     */
    select?: EdgeModelCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * EdgeModelCountOutputType without action
   */
  export type EdgeModelCountOutputTypeCountContributorsArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeContributorWhereInput
  }


  /**
   * EdgeModelCountOutputType without action
   */
  export type EdgeModelCountOutputTypeCountPhotosArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgePhotoWhereInput
  }


  /**
   * EdgeModelCountOutputType without action
   */
  export type EdgeModelCountOutputTypeCountValuesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeValueWhereInput
  }



  /**
   * Models
   */

  /**
   * Model optionInterval
   */

  export type AggregateOptionInterval = {
    _count: OptionIntervalCountAggregateOutputType | null
    _avg: OptionIntervalAvgAggregateOutputType | null
    _sum: OptionIntervalSumAggregateOutputType | null
    _min: OptionIntervalMinAggregateOutputType | null
    _max: OptionIntervalMaxAggregateOutputType | null
  }

  export type OptionIntervalAvgAggregateOutputType = {
    id: number | null
    valueId: number | null
  }

  export type OptionIntervalSumAggregateOutputType = {
    id: number | null
    valueId: number | null
  }

  export type OptionIntervalMinAggregateOutputType = {
    id: number | null
    valueId: number | null
    issueNumberStart: string | null
    issueNumberEnd: string | null
    username: string | null
  }

  export type OptionIntervalMaxAggregateOutputType = {
    id: number | null
    valueId: number | null
    issueNumberStart: string | null
    issueNumberEnd: string | null
    username: string | null
  }

  export type OptionIntervalCountAggregateOutputType = {
    id: number
    valueId: number
    issueNumberStart: number
    issueNumberEnd: number
    username: number
    _all: number
  }


  export type OptionIntervalAvgAggregateInputType = {
    id?: true
    valueId?: true
  }

  export type OptionIntervalSumAggregateInputType = {
    id?: true
    valueId?: true
  }

  export type OptionIntervalMinAggregateInputType = {
    id?: true
    valueId?: true
    issueNumberStart?: true
    issueNumberEnd?: true
    username?: true
  }

  export type OptionIntervalMaxAggregateInputType = {
    id?: true
    valueId?: true
    issueNumberStart?: true
    issueNumberEnd?: true
    username?: true
  }

  export type OptionIntervalCountAggregateInputType = {
    id?: true
    valueId?: true
    issueNumberStart?: true
    issueNumberEnd?: true
    username?: true
    _all?: true
  }

  export type OptionIntervalAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which optionInterval to aggregate.
     */
    where?: optionIntervalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionIntervals to fetch.
     */
    orderBy?: optionIntervalOrderByWithRelationInput | optionIntervalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: optionIntervalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionIntervals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionIntervals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned optionIntervals
    **/
    _count?: true | OptionIntervalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OptionIntervalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OptionIntervalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OptionIntervalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OptionIntervalMaxAggregateInputType
  }

  export type GetOptionIntervalAggregateType<T extends OptionIntervalAggregateArgs> = {
        [P in keyof T & keyof AggregateOptionInterval]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOptionInterval[P]>
      : GetScalarType<T[P], AggregateOptionInterval[P]>
  }




  export type optionIntervalGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: optionIntervalWhereInput
    orderBy?: optionIntervalOrderByWithAggregationInput | optionIntervalOrderByWithAggregationInput[]
    by: OptionIntervalScalarFieldEnum[] | OptionIntervalScalarFieldEnum
    having?: optionIntervalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OptionIntervalCountAggregateInputType | true
    _avg?: OptionIntervalAvgAggregateInputType
    _sum?: OptionIntervalSumAggregateInputType
    _min?: OptionIntervalMinAggregateInputType
    _max?: OptionIntervalMaxAggregateInputType
  }

  export type OptionIntervalGroupByOutputType = {
    id: number
    valueId: number
    issueNumberStart: string
    issueNumberEnd: string
    username: string
    _count: OptionIntervalCountAggregateOutputType | null
    _avg: OptionIntervalAvgAggregateOutputType | null
    _sum: OptionIntervalSumAggregateOutputType | null
    _min: OptionIntervalMinAggregateOutputType | null
    _max: OptionIntervalMaxAggregateOutputType | null
  }

  type GetOptionIntervalGroupByPayload<T extends optionIntervalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OptionIntervalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OptionIntervalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OptionIntervalGroupByOutputType[P]>
            : GetScalarType<T[P], OptionIntervalGroupByOutputType[P]>
        }
      >
    >


  export type optionIntervalSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    valueId?: boolean
    issueNumberStart?: boolean
    issueNumberEnd?: boolean
    username?: boolean
  }, ExtArgs["result"]["optionInterval"]>

  export type optionIntervalSelectScalar = {
    id?: boolean
    valueId?: boolean
    issueNumberStart?: boolean
    issueNumberEnd?: boolean
    username?: boolean
  }


  export type $optionIntervalPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "optionInterval"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      valueId: number
      issueNumberStart: string
      issueNumberEnd: string
      username: string
    }, ExtArgs["result"]["optionInterval"]>
    composites: {}
  }


  type optionIntervalGetPayload<S extends boolean | null | undefined | optionIntervalDefaultArgs> = $Result.GetResult<Prisma.$optionIntervalPayload, S>

  type optionIntervalCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<optionIntervalFindManyArgs, 'select' | 'include'> & {
      select?: OptionIntervalCountAggregateInputType | true
    }

  export interface optionIntervalDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['optionInterval'], meta: { name: 'optionInterval' } }
    /**
     * Find zero or one OptionInterval that matches the filter.
     * @param {optionIntervalFindUniqueArgs} args - Arguments to find a OptionInterval
     * @example
     * // Get one OptionInterval
     * const optionInterval = await prisma.optionInterval.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends optionIntervalFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalFindUniqueArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one OptionInterval that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {optionIntervalFindUniqueOrThrowArgs} args - Arguments to find a OptionInterval
     * @example
     * // Get one OptionInterval
     * const optionInterval = await prisma.optionInterval.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends optionIntervalFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first OptionInterval that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalFindFirstArgs} args - Arguments to find a OptionInterval
     * @example
     * // Get one OptionInterval
     * const optionInterval = await prisma.optionInterval.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends optionIntervalFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalFindFirstArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first OptionInterval that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalFindFirstOrThrowArgs} args - Arguments to find a OptionInterval
     * @example
     * // Get one OptionInterval
     * const optionInterval = await prisma.optionInterval.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends optionIntervalFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more OptionIntervals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OptionIntervals
     * const optionIntervals = await prisma.optionInterval.findMany()
     * 
     * // Get first 10 OptionIntervals
     * const optionIntervals = await prisma.optionInterval.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const optionIntervalWithIdOnly = await prisma.optionInterval.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends optionIntervalFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a OptionInterval.
     * @param {optionIntervalCreateArgs} args - Arguments to create a OptionInterval.
     * @example
     * // Create one OptionInterval
     * const OptionInterval = await prisma.optionInterval.create({
     *   data: {
     *     // ... data to create a OptionInterval
     *   }
     * })
     * 
    **/
    create<T extends optionIntervalCreateArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalCreateArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many OptionIntervals.
     *     @param {optionIntervalCreateManyArgs} args - Arguments to create many OptionIntervals.
     *     @example
     *     // Create many OptionIntervals
     *     const optionInterval = await prisma.optionInterval.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends optionIntervalCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OptionInterval.
     * @param {optionIntervalDeleteArgs} args - Arguments to delete one OptionInterval.
     * @example
     * // Delete one OptionInterval
     * const OptionInterval = await prisma.optionInterval.delete({
     *   where: {
     *     // ... filter to delete one OptionInterval
     *   }
     * })
     * 
    **/
    delete<T extends optionIntervalDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalDeleteArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one OptionInterval.
     * @param {optionIntervalUpdateArgs} args - Arguments to update one OptionInterval.
     * @example
     * // Update one OptionInterval
     * const optionInterval = await prisma.optionInterval.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends optionIntervalUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalUpdateArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more OptionIntervals.
     * @param {optionIntervalDeleteManyArgs} args - Arguments to filter OptionIntervals to delete.
     * @example
     * // Delete a few OptionIntervals
     * const { count } = await prisma.optionInterval.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends optionIntervalDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionIntervalDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OptionIntervals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OptionIntervals
     * const optionInterval = await prisma.optionInterval.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends optionIntervalUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OptionInterval.
     * @param {optionIntervalUpsertArgs} args - Arguments to update or create a OptionInterval.
     * @example
     * // Update or create a OptionInterval
     * const optionInterval = await prisma.optionInterval.upsert({
     *   create: {
     *     // ... data to create a OptionInterval
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OptionInterval we want to update
     *   }
     * })
    **/
    upsert<T extends optionIntervalUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, optionIntervalUpsertArgs<ExtArgs>>
    ): Prisma__optionIntervalClient<$Result.GetResult<Prisma.$optionIntervalPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of OptionIntervals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalCountArgs} args - Arguments to filter OptionIntervals to count.
     * @example
     * // Count the number of OptionIntervals
     * const count = await prisma.optionInterval.count({
     *   where: {
     *     // ... the filter for the OptionIntervals we want to count
     *   }
     * })
    **/
    count<T extends optionIntervalCountArgs>(
      args?: Subset<T, optionIntervalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OptionIntervalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OptionInterval.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionIntervalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OptionIntervalAggregateArgs>(args: Subset<T, OptionIntervalAggregateArgs>): Prisma.PrismaPromise<GetOptionIntervalAggregateType<T>>

    /**
     * Group by OptionInterval.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionIntervalGroupByArgs} args - Group by arguments.
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
      T extends optionIntervalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: optionIntervalGroupByArgs['orderBy'] }
        : { orderBy?: optionIntervalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, optionIntervalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOptionIntervalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the optionInterval model
   */
  readonly fields: optionIntervalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for optionInterval.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__optionIntervalClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the optionInterval model
   */ 
  interface optionIntervalFieldRefs {
    readonly id: FieldRef<"optionInterval", 'Int'>
    readonly valueId: FieldRef<"optionInterval", 'Int'>
    readonly issueNumberStart: FieldRef<"optionInterval", 'String'>
    readonly issueNumberEnd: FieldRef<"optionInterval", 'String'>
    readonly username: FieldRef<"optionInterval", 'String'>
  }
    

  // Custom InputTypes

  /**
   * optionInterval findUnique
   */
  export type optionIntervalFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter, which optionInterval to fetch.
     */
    where: optionIntervalWhereUniqueInput
  }


  /**
   * optionInterval findUniqueOrThrow
   */
  export type optionIntervalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter, which optionInterval to fetch.
     */
    where: optionIntervalWhereUniqueInput
  }


  /**
   * optionInterval findFirst
   */
  export type optionIntervalFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter, which optionInterval to fetch.
     */
    where?: optionIntervalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionIntervals to fetch.
     */
    orderBy?: optionIntervalOrderByWithRelationInput | optionIntervalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for optionIntervals.
     */
    cursor?: optionIntervalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionIntervals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionIntervals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of optionIntervals.
     */
    distinct?: OptionIntervalScalarFieldEnum | OptionIntervalScalarFieldEnum[]
  }


  /**
   * optionInterval findFirstOrThrow
   */
  export type optionIntervalFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter, which optionInterval to fetch.
     */
    where?: optionIntervalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionIntervals to fetch.
     */
    orderBy?: optionIntervalOrderByWithRelationInput | optionIntervalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for optionIntervals.
     */
    cursor?: optionIntervalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionIntervals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionIntervals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of optionIntervals.
     */
    distinct?: OptionIntervalScalarFieldEnum | OptionIntervalScalarFieldEnum[]
  }


  /**
   * optionInterval findMany
   */
  export type optionIntervalFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter, which optionIntervals to fetch.
     */
    where?: optionIntervalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionIntervals to fetch.
     */
    orderBy?: optionIntervalOrderByWithRelationInput | optionIntervalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing optionIntervals.
     */
    cursor?: optionIntervalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionIntervals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionIntervals.
     */
    skip?: number
    distinct?: OptionIntervalScalarFieldEnum | OptionIntervalScalarFieldEnum[]
  }


  /**
   * optionInterval create
   */
  export type optionIntervalCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * The data needed to create a optionInterval.
     */
    data: XOR<optionIntervalCreateInput, optionIntervalUncheckedCreateInput>
  }


  /**
   * optionInterval createMany
   */
  export type optionIntervalCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many optionIntervals.
     */
    data: optionIntervalCreateManyInput | optionIntervalCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * optionInterval update
   */
  export type optionIntervalUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * The data needed to update a optionInterval.
     */
    data: XOR<optionIntervalUpdateInput, optionIntervalUncheckedUpdateInput>
    /**
     * Choose, which optionInterval to update.
     */
    where: optionIntervalWhereUniqueInput
  }


  /**
   * optionInterval updateMany
   */
  export type optionIntervalUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update optionIntervals.
     */
    data: XOR<optionIntervalUpdateManyMutationInput, optionIntervalUncheckedUpdateManyInput>
    /**
     * Filter which optionIntervals to update
     */
    where?: optionIntervalWhereInput
  }


  /**
   * optionInterval upsert
   */
  export type optionIntervalUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * The filter to search for the optionInterval to update in case it exists.
     */
    where: optionIntervalWhereUniqueInput
    /**
     * In case the optionInterval found by the `where` argument doesn't exist, create a new optionInterval with this data.
     */
    create: XOR<optionIntervalCreateInput, optionIntervalUncheckedCreateInput>
    /**
     * In case the optionInterval was found with the provided `where` argument, update it with this data.
     */
    update: XOR<optionIntervalUpdateInput, optionIntervalUncheckedUpdateInput>
  }


  /**
   * optionInterval delete
   */
  export type optionIntervalDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
    /**
     * Filter which optionInterval to delete.
     */
    where: optionIntervalWhereUniqueInput
  }


  /**
   * optionInterval deleteMany
   */
  export type optionIntervalDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which optionIntervals to delete
     */
    where?: optionIntervalWhereInput
  }


  /**
   * optionInterval without action
   */
  export type optionIntervalDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionInterval
     */
    select?: optionIntervalSelect<ExtArgs> | null
  }



  /**
   * Model edgeModelOld
   */

  export type AggregateEdgeModelOld = {
    _count: EdgeModelOldCountAggregateOutputType | null
    _avg: EdgeModelOldAvgAggregateOutputType | null
    _sum: EdgeModelOldSumAggregateOutputType | null
    _min: EdgeModelOldMinAggregateOutputType | null
    _max: EdgeModelOldMaxAggregateOutputType | null
  }

  export type EdgeModelOldAvgAggregateOutputType = {
    id: number | null
    order: number | null
  }

  export type EdgeModelOldSumAggregateOutputType = {
    id: number | null
    order: number | null
  }

  export type EdgeModelOldMinAggregateOutputType = {
    id: number | null
    country: string | null
    magazine: string | null
    order: number | null
    functionName: string | null
    optionName: string | null
  }

  export type EdgeModelOldMaxAggregateOutputType = {
    id: number | null
    country: string | null
    magazine: string | null
    order: number | null
    functionName: string | null
    optionName: string | null
  }

  export type EdgeModelOldCountAggregateOutputType = {
    id: number
    country: number
    magazine: number
    order: number
    functionName: number
    optionName: number
    _all: number
  }


  export type EdgeModelOldAvgAggregateInputType = {
    id?: true
    order?: true
  }

  export type EdgeModelOldSumAggregateInputType = {
    id?: true
    order?: true
  }

  export type EdgeModelOldMinAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    order?: true
    functionName?: true
    optionName?: true
  }

  export type EdgeModelOldMaxAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    order?: true
    functionName?: true
    optionName?: true
  }

  export type EdgeModelOldCountAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    order?: true
    functionName?: true
    optionName?: true
    _all?: true
  }

  export type EdgeModelOldAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeModelOld to aggregate.
     */
    where?: edgeModelOldWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModelOlds to fetch.
     */
    orderBy?: edgeModelOldOrderByWithRelationInput | edgeModelOldOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: edgeModelOldWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModelOlds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModelOlds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned edgeModelOlds
    **/
    _count?: true | EdgeModelOldCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EdgeModelOldAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EdgeModelOldSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdgeModelOldMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdgeModelOldMaxAggregateInputType
  }

  export type GetEdgeModelOldAggregateType<T extends EdgeModelOldAggregateArgs> = {
        [P in keyof T & keyof AggregateEdgeModelOld]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdgeModelOld[P]>
      : GetScalarType<T[P], AggregateEdgeModelOld[P]>
  }




  export type edgeModelOldGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeModelOldWhereInput
    orderBy?: edgeModelOldOrderByWithAggregationInput | edgeModelOldOrderByWithAggregationInput[]
    by: EdgeModelOldScalarFieldEnum[] | EdgeModelOldScalarFieldEnum
    having?: edgeModelOldScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdgeModelOldCountAggregateInputType | true
    _avg?: EdgeModelOldAvgAggregateInputType
    _sum?: EdgeModelOldSumAggregateInputType
    _min?: EdgeModelOldMinAggregateInputType
    _max?: EdgeModelOldMaxAggregateInputType
  }

  export type EdgeModelOldGroupByOutputType = {
    id: number
    country: string
    magazine: string
    order: number
    functionName: string
    optionName: string | null
    _count: EdgeModelOldCountAggregateOutputType | null
    _avg: EdgeModelOldAvgAggregateOutputType | null
    _sum: EdgeModelOldSumAggregateOutputType | null
    _min: EdgeModelOldMinAggregateOutputType | null
    _max: EdgeModelOldMaxAggregateOutputType | null
  }

  type GetEdgeModelOldGroupByPayload<T extends edgeModelOldGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdgeModelOldGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdgeModelOldGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdgeModelOldGroupByOutputType[P]>
            : GetScalarType<T[P], EdgeModelOldGroupByOutputType[P]>
        }
      >
    >


  export type edgeModelOldSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    country?: boolean
    magazine?: boolean
    order?: boolean
    functionName?: boolean
    optionName?: boolean
  }, ExtArgs["result"]["edgeModelOld"]>

  export type edgeModelOldSelectScalar = {
    id?: boolean
    country?: boolean
    magazine?: boolean
    order?: boolean
    functionName?: boolean
    optionName?: boolean
  }


  export type $edgeModelOldPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "edgeModelOld"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      country: string
      magazine: string
      order: number
      functionName: string
      optionName: string | null
    }, ExtArgs["result"]["edgeModelOld"]>
    composites: {}
  }


  type edgeModelOldGetPayload<S extends boolean | null | undefined | edgeModelOldDefaultArgs> = $Result.GetResult<Prisma.$edgeModelOldPayload, S>

  type edgeModelOldCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<edgeModelOldFindManyArgs, 'select' | 'include'> & {
      select?: EdgeModelOldCountAggregateInputType | true
    }

  export interface edgeModelOldDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['edgeModelOld'], meta: { name: 'edgeModelOld' } }
    /**
     * Find zero or one EdgeModelOld that matches the filter.
     * @param {edgeModelOldFindUniqueArgs} args - Arguments to find a EdgeModelOld
     * @example
     * // Get one EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends edgeModelOldFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldFindUniqueArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one EdgeModelOld that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {edgeModelOldFindUniqueOrThrowArgs} args - Arguments to find a EdgeModelOld
     * @example
     * // Get one EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends edgeModelOldFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first EdgeModelOld that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldFindFirstArgs} args - Arguments to find a EdgeModelOld
     * @example
     * // Get one EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends edgeModelOldFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldFindFirstArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first EdgeModelOld that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldFindFirstOrThrowArgs} args - Arguments to find a EdgeModelOld
     * @example
     * // Get one EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends edgeModelOldFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more EdgeModelOlds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdgeModelOlds
     * const edgeModelOlds = await prisma.edgeModelOld.findMany()
     * 
     * // Get first 10 EdgeModelOlds
     * const edgeModelOlds = await prisma.edgeModelOld.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edgeModelOldWithIdOnly = await prisma.edgeModelOld.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends edgeModelOldFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a EdgeModelOld.
     * @param {edgeModelOldCreateArgs} args - Arguments to create a EdgeModelOld.
     * @example
     * // Create one EdgeModelOld
     * const EdgeModelOld = await prisma.edgeModelOld.create({
     *   data: {
     *     // ... data to create a EdgeModelOld
     *   }
     * })
     * 
    **/
    create<T extends edgeModelOldCreateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldCreateArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many EdgeModelOlds.
     *     @param {edgeModelOldCreateManyArgs} args - Arguments to create many EdgeModelOlds.
     *     @example
     *     // Create many EdgeModelOlds
     *     const edgeModelOld = await prisma.edgeModelOld.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends edgeModelOldCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EdgeModelOld.
     * @param {edgeModelOldDeleteArgs} args - Arguments to delete one EdgeModelOld.
     * @example
     * // Delete one EdgeModelOld
     * const EdgeModelOld = await prisma.edgeModelOld.delete({
     *   where: {
     *     // ... filter to delete one EdgeModelOld
     *   }
     * })
     * 
    **/
    delete<T extends edgeModelOldDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldDeleteArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one EdgeModelOld.
     * @param {edgeModelOldUpdateArgs} args - Arguments to update one EdgeModelOld.
     * @example
     * // Update one EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends edgeModelOldUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldUpdateArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more EdgeModelOlds.
     * @param {edgeModelOldDeleteManyArgs} args - Arguments to filter EdgeModelOlds to delete.
     * @example
     * // Delete a few EdgeModelOlds
     * const { count } = await prisma.edgeModelOld.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends edgeModelOldDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelOldDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdgeModelOlds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdgeModelOlds
     * const edgeModelOld = await prisma.edgeModelOld.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends edgeModelOldUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EdgeModelOld.
     * @param {edgeModelOldUpsertArgs} args - Arguments to update or create a EdgeModelOld.
     * @example
     * // Update or create a EdgeModelOld
     * const edgeModelOld = await prisma.edgeModelOld.upsert({
     *   create: {
     *     // ... data to create a EdgeModelOld
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdgeModelOld we want to update
     *   }
     * })
    **/
    upsert<T extends edgeModelOldUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelOldUpsertArgs<ExtArgs>>
    ): Prisma__edgeModelOldClient<$Result.GetResult<Prisma.$edgeModelOldPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of EdgeModelOlds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldCountArgs} args - Arguments to filter EdgeModelOlds to count.
     * @example
     * // Count the number of EdgeModelOlds
     * const count = await prisma.edgeModelOld.count({
     *   where: {
     *     // ... the filter for the EdgeModelOlds we want to count
     *   }
     * })
    **/
    count<T extends edgeModelOldCountArgs>(
      args?: Subset<T, edgeModelOldCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdgeModelOldCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdgeModelOld.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdgeModelOldAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EdgeModelOldAggregateArgs>(args: Subset<T, EdgeModelOldAggregateArgs>): Prisma.PrismaPromise<GetEdgeModelOldAggregateType<T>>

    /**
     * Group by EdgeModelOld.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelOldGroupByArgs} args - Group by arguments.
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
      T extends edgeModelOldGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: edgeModelOldGroupByArgs['orderBy'] }
        : { orderBy?: edgeModelOldGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, edgeModelOldGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdgeModelOldGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the edgeModelOld model
   */
  readonly fields: edgeModelOldFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for edgeModelOld.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__edgeModelOldClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the edgeModelOld model
   */ 
  interface edgeModelOldFieldRefs {
    readonly id: FieldRef<"edgeModelOld", 'Int'>
    readonly country: FieldRef<"edgeModelOld", 'String'>
    readonly magazine: FieldRef<"edgeModelOld", 'String'>
    readonly order: FieldRef<"edgeModelOld", 'Int'>
    readonly functionName: FieldRef<"edgeModelOld", 'String'>
    readonly optionName: FieldRef<"edgeModelOld", 'String'>
  }
    

  // Custom InputTypes

  /**
   * edgeModelOld findUnique
   */
  export type edgeModelOldFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter, which edgeModelOld to fetch.
     */
    where: edgeModelOldWhereUniqueInput
  }


  /**
   * edgeModelOld findUniqueOrThrow
   */
  export type edgeModelOldFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter, which edgeModelOld to fetch.
     */
    where: edgeModelOldWhereUniqueInput
  }


  /**
   * edgeModelOld findFirst
   */
  export type edgeModelOldFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter, which edgeModelOld to fetch.
     */
    where?: edgeModelOldWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModelOlds to fetch.
     */
    orderBy?: edgeModelOldOrderByWithRelationInput | edgeModelOldOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeModelOlds.
     */
    cursor?: edgeModelOldWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModelOlds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModelOlds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeModelOlds.
     */
    distinct?: EdgeModelOldScalarFieldEnum | EdgeModelOldScalarFieldEnum[]
  }


  /**
   * edgeModelOld findFirstOrThrow
   */
  export type edgeModelOldFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter, which edgeModelOld to fetch.
     */
    where?: edgeModelOldWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModelOlds to fetch.
     */
    orderBy?: edgeModelOldOrderByWithRelationInput | edgeModelOldOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeModelOlds.
     */
    cursor?: edgeModelOldWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModelOlds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModelOlds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeModelOlds.
     */
    distinct?: EdgeModelOldScalarFieldEnum | EdgeModelOldScalarFieldEnum[]
  }


  /**
   * edgeModelOld findMany
   */
  export type edgeModelOldFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter, which edgeModelOlds to fetch.
     */
    where?: edgeModelOldWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModelOlds to fetch.
     */
    orderBy?: edgeModelOldOrderByWithRelationInput | edgeModelOldOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing edgeModelOlds.
     */
    cursor?: edgeModelOldWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModelOlds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModelOlds.
     */
    skip?: number
    distinct?: EdgeModelOldScalarFieldEnum | EdgeModelOldScalarFieldEnum[]
  }


  /**
   * edgeModelOld create
   */
  export type edgeModelOldCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * The data needed to create a edgeModelOld.
     */
    data: XOR<edgeModelOldCreateInput, edgeModelOldUncheckedCreateInput>
  }


  /**
   * edgeModelOld createMany
   */
  export type edgeModelOldCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many edgeModelOlds.
     */
    data: edgeModelOldCreateManyInput | edgeModelOldCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * edgeModelOld update
   */
  export type edgeModelOldUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * The data needed to update a edgeModelOld.
     */
    data: XOR<edgeModelOldUpdateInput, edgeModelOldUncheckedUpdateInput>
    /**
     * Choose, which edgeModelOld to update.
     */
    where: edgeModelOldWhereUniqueInput
  }


  /**
   * edgeModelOld updateMany
   */
  export type edgeModelOldUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update edgeModelOlds.
     */
    data: XOR<edgeModelOldUpdateManyMutationInput, edgeModelOldUncheckedUpdateManyInput>
    /**
     * Filter which edgeModelOlds to update
     */
    where?: edgeModelOldWhereInput
  }


  /**
   * edgeModelOld upsert
   */
  export type edgeModelOldUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * The filter to search for the edgeModelOld to update in case it exists.
     */
    where: edgeModelOldWhereUniqueInput
    /**
     * In case the edgeModelOld found by the `where` argument doesn't exist, create a new edgeModelOld with this data.
     */
    create: XOR<edgeModelOldCreateInput, edgeModelOldUncheckedCreateInput>
    /**
     * In case the edgeModelOld was found with the provided `where` argument, update it with this data.
     */
    update: XOR<edgeModelOldUpdateInput, edgeModelOldUncheckedUpdateInput>
  }


  /**
   * edgeModelOld delete
   */
  export type edgeModelOldDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
    /**
     * Filter which edgeModelOld to delete.
     */
    where: edgeModelOldWhereUniqueInput
  }


  /**
   * edgeModelOld deleteMany
   */
  export type edgeModelOldDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeModelOlds to delete
     */
    where?: edgeModelOldWhereInput
  }


  /**
   * edgeModelOld without action
   */
  export type edgeModelOldDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModelOld
     */
    select?: edgeModelOldSelect<ExtArgs> | null
  }



  /**
   * Model optionValue
   */

  export type AggregateOptionValue = {
    _count: OptionValueCountAggregateOutputType | null
    _avg: OptionValueAvgAggregateOutputType | null
    _sum: OptionValueSumAggregateOutputType | null
    _min: OptionValueMinAggregateOutputType | null
    _max: OptionValueMaxAggregateOutputType | null
  }

  export type OptionValueAvgAggregateOutputType = {
    id: number | null
    optionId: number | null
  }

  export type OptionValueSumAggregateOutputType = {
    id: number | null
    optionId: number | null
  }

  export type OptionValueMinAggregateOutputType = {
    id: number | null
    optionId: number | null
    value: string | null
  }

  export type OptionValueMaxAggregateOutputType = {
    id: number | null
    optionId: number | null
    value: string | null
  }

  export type OptionValueCountAggregateOutputType = {
    id: number
    optionId: number
    value: number
    _all: number
  }


  export type OptionValueAvgAggregateInputType = {
    id?: true
    optionId?: true
  }

  export type OptionValueSumAggregateInputType = {
    id?: true
    optionId?: true
  }

  export type OptionValueMinAggregateInputType = {
    id?: true
    optionId?: true
    value?: true
  }

  export type OptionValueMaxAggregateInputType = {
    id?: true
    optionId?: true
    value?: true
  }

  export type OptionValueCountAggregateInputType = {
    id?: true
    optionId?: true
    value?: true
    _all?: true
  }

  export type OptionValueAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which optionValue to aggregate.
     */
    where?: optionValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionValues to fetch.
     */
    orderBy?: optionValueOrderByWithRelationInput | optionValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: optionValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned optionValues
    **/
    _count?: true | OptionValueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OptionValueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OptionValueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OptionValueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OptionValueMaxAggregateInputType
  }

  export type GetOptionValueAggregateType<T extends OptionValueAggregateArgs> = {
        [P in keyof T & keyof AggregateOptionValue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOptionValue[P]>
      : GetScalarType<T[P], AggregateOptionValue[P]>
  }




  export type optionValueGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: optionValueWhereInput
    orderBy?: optionValueOrderByWithAggregationInput | optionValueOrderByWithAggregationInput[]
    by: OptionValueScalarFieldEnum[] | OptionValueScalarFieldEnum
    having?: optionValueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OptionValueCountAggregateInputType | true
    _avg?: OptionValueAvgAggregateInputType
    _sum?: OptionValueSumAggregateInputType
    _min?: OptionValueMinAggregateInputType
    _max?: OptionValueMaxAggregateInputType
  }

  export type OptionValueGroupByOutputType = {
    id: number
    optionId: number | null
    value: string | null
    _count: OptionValueCountAggregateOutputType | null
    _avg: OptionValueAvgAggregateOutputType | null
    _sum: OptionValueSumAggregateOutputType | null
    _min: OptionValueMinAggregateOutputType | null
    _max: OptionValueMaxAggregateOutputType | null
  }

  type GetOptionValueGroupByPayload<T extends optionValueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OptionValueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OptionValueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OptionValueGroupByOutputType[P]>
            : GetScalarType<T[P], OptionValueGroupByOutputType[P]>
        }
      >
    >


  export type optionValueSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    optionId?: boolean
    value?: boolean
  }, ExtArgs["result"]["optionValue"]>

  export type optionValueSelectScalar = {
    id?: boolean
    optionId?: boolean
    value?: boolean
  }


  export type $optionValuePayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "optionValue"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      optionId: number | null
      value: string | null
    }, ExtArgs["result"]["optionValue"]>
    composites: {}
  }


  type optionValueGetPayload<S extends boolean | null | undefined | optionValueDefaultArgs> = $Result.GetResult<Prisma.$optionValuePayload, S>

  type optionValueCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<optionValueFindManyArgs, 'select' | 'include'> & {
      select?: OptionValueCountAggregateInputType | true
    }

  export interface optionValueDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['optionValue'], meta: { name: 'optionValue' } }
    /**
     * Find zero or one OptionValue that matches the filter.
     * @param {optionValueFindUniqueArgs} args - Arguments to find a OptionValue
     * @example
     * // Get one OptionValue
     * const optionValue = await prisma.optionValue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends optionValueFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueFindUniqueArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one OptionValue that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {optionValueFindUniqueOrThrowArgs} args - Arguments to find a OptionValue
     * @example
     * // Get one OptionValue
     * const optionValue = await prisma.optionValue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends optionValueFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first OptionValue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueFindFirstArgs} args - Arguments to find a OptionValue
     * @example
     * // Get one OptionValue
     * const optionValue = await prisma.optionValue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends optionValueFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueFindFirstArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first OptionValue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueFindFirstOrThrowArgs} args - Arguments to find a OptionValue
     * @example
     * // Get one OptionValue
     * const optionValue = await prisma.optionValue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends optionValueFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more OptionValues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OptionValues
     * const optionValues = await prisma.optionValue.findMany()
     * 
     * // Get first 10 OptionValues
     * const optionValues = await prisma.optionValue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const optionValueWithIdOnly = await prisma.optionValue.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends optionValueFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a OptionValue.
     * @param {optionValueCreateArgs} args - Arguments to create a OptionValue.
     * @example
     * // Create one OptionValue
     * const OptionValue = await prisma.optionValue.create({
     *   data: {
     *     // ... data to create a OptionValue
     *   }
     * })
     * 
    **/
    create<T extends optionValueCreateArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueCreateArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many OptionValues.
     *     @param {optionValueCreateManyArgs} args - Arguments to create many OptionValues.
     *     @example
     *     // Create many OptionValues
     *     const optionValue = await prisma.optionValue.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends optionValueCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OptionValue.
     * @param {optionValueDeleteArgs} args - Arguments to delete one OptionValue.
     * @example
     * // Delete one OptionValue
     * const OptionValue = await prisma.optionValue.delete({
     *   where: {
     *     // ... filter to delete one OptionValue
     *   }
     * })
     * 
    **/
    delete<T extends optionValueDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueDeleteArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one OptionValue.
     * @param {optionValueUpdateArgs} args - Arguments to update one OptionValue.
     * @example
     * // Update one OptionValue
     * const optionValue = await prisma.optionValue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends optionValueUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueUpdateArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more OptionValues.
     * @param {optionValueDeleteManyArgs} args - Arguments to filter OptionValues to delete.
     * @example
     * // Delete a few OptionValues
     * const { count } = await prisma.optionValue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends optionValueDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, optionValueDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OptionValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OptionValues
     * const optionValue = await prisma.optionValue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends optionValueUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OptionValue.
     * @param {optionValueUpsertArgs} args - Arguments to update or create a OptionValue.
     * @example
     * // Update or create a OptionValue
     * const optionValue = await prisma.optionValue.upsert({
     *   create: {
     *     // ... data to create a OptionValue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OptionValue we want to update
     *   }
     * })
    **/
    upsert<T extends optionValueUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, optionValueUpsertArgs<ExtArgs>>
    ): Prisma__optionValueClient<$Result.GetResult<Prisma.$optionValuePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of OptionValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueCountArgs} args - Arguments to filter OptionValues to count.
     * @example
     * // Count the number of OptionValues
     * const count = await prisma.optionValue.count({
     *   where: {
     *     // ... the filter for the OptionValues we want to count
     *   }
     * })
    **/
    count<T extends optionValueCountArgs>(
      args?: Subset<T, optionValueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OptionValueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OptionValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OptionValueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OptionValueAggregateArgs>(args: Subset<T, OptionValueAggregateArgs>): Prisma.PrismaPromise<GetOptionValueAggregateType<T>>

    /**
     * Group by OptionValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {optionValueGroupByArgs} args - Group by arguments.
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
      T extends optionValueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: optionValueGroupByArgs['orderBy'] }
        : { orderBy?: optionValueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, optionValueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOptionValueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the optionValue model
   */
  readonly fields: optionValueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for optionValue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__optionValueClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the optionValue model
   */ 
  interface optionValueFieldRefs {
    readonly id: FieldRef<"optionValue", 'Int'>
    readonly optionId: FieldRef<"optionValue", 'Int'>
    readonly value: FieldRef<"optionValue", 'String'>
  }
    

  // Custom InputTypes

  /**
   * optionValue findUnique
   */
  export type optionValueFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter, which optionValue to fetch.
     */
    where: optionValueWhereUniqueInput
  }


  /**
   * optionValue findUniqueOrThrow
   */
  export type optionValueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter, which optionValue to fetch.
     */
    where: optionValueWhereUniqueInput
  }


  /**
   * optionValue findFirst
   */
  export type optionValueFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter, which optionValue to fetch.
     */
    where?: optionValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionValues to fetch.
     */
    orderBy?: optionValueOrderByWithRelationInput | optionValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for optionValues.
     */
    cursor?: optionValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of optionValues.
     */
    distinct?: OptionValueScalarFieldEnum | OptionValueScalarFieldEnum[]
  }


  /**
   * optionValue findFirstOrThrow
   */
  export type optionValueFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter, which optionValue to fetch.
     */
    where?: optionValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionValues to fetch.
     */
    orderBy?: optionValueOrderByWithRelationInput | optionValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for optionValues.
     */
    cursor?: optionValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of optionValues.
     */
    distinct?: OptionValueScalarFieldEnum | OptionValueScalarFieldEnum[]
  }


  /**
   * optionValue findMany
   */
  export type optionValueFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter, which optionValues to fetch.
     */
    where?: optionValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of optionValues to fetch.
     */
    orderBy?: optionValueOrderByWithRelationInput | optionValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing optionValues.
     */
    cursor?: optionValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` optionValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` optionValues.
     */
    skip?: number
    distinct?: OptionValueScalarFieldEnum | OptionValueScalarFieldEnum[]
  }


  /**
   * optionValue create
   */
  export type optionValueCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * The data needed to create a optionValue.
     */
    data?: XOR<optionValueCreateInput, optionValueUncheckedCreateInput>
  }


  /**
   * optionValue createMany
   */
  export type optionValueCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many optionValues.
     */
    data: optionValueCreateManyInput | optionValueCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * optionValue update
   */
  export type optionValueUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * The data needed to update a optionValue.
     */
    data: XOR<optionValueUpdateInput, optionValueUncheckedUpdateInput>
    /**
     * Choose, which optionValue to update.
     */
    where: optionValueWhereUniqueInput
  }


  /**
   * optionValue updateMany
   */
  export type optionValueUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update optionValues.
     */
    data: XOR<optionValueUpdateManyMutationInput, optionValueUncheckedUpdateManyInput>
    /**
     * Filter which optionValues to update
     */
    where?: optionValueWhereInput
  }


  /**
   * optionValue upsert
   */
  export type optionValueUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * The filter to search for the optionValue to update in case it exists.
     */
    where: optionValueWhereUniqueInput
    /**
     * In case the optionValue found by the `where` argument doesn't exist, create a new optionValue with this data.
     */
    create: XOR<optionValueCreateInput, optionValueUncheckedCreateInput>
    /**
     * In case the optionValue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<optionValueUpdateInput, optionValueUncheckedUpdateInput>
  }


  /**
   * optionValue delete
   */
  export type optionValueDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
    /**
     * Filter which optionValue to delete.
     */
    where: optionValueWhereUniqueInput
  }


  /**
   * optionValue deleteMany
   */
  export type optionValueDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which optionValues to delete
     */
    where?: optionValueWhereInput
  }


  /**
   * optionValue without action
   */
  export type optionValueDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the optionValue
     */
    select?: optionValueSelect<ExtArgs> | null
  }



  /**
   * Model myfontsImage
   */

  export type AggregateMyfontsImage = {
    _count: MyfontsImageCountAggregateOutputType | null
    _avg: MyfontsImageAvgAggregateOutputType | null
    _sum: MyfontsImageSumAggregateOutputType | null
    _min: MyfontsImageMinAggregateOutputType | null
    _max: MyfontsImageMaxAggregateOutputType | null
  }

  export type MyfontsImageAvgAggregateOutputType = {
    id: number | null
  }

  export type MyfontsImageSumAggregateOutputType = {
    id: number | null
  }

  export type MyfontsImageMinAggregateOutputType = {
    id: number | null
    font: string | null
    color: string | null
    backgroundColor: string | null
    width: string | null
    text: string | null
    precision: string | null
  }

  export type MyfontsImageMaxAggregateOutputType = {
    id: number | null
    font: string | null
    color: string | null
    backgroundColor: string | null
    width: string | null
    text: string | null
    precision: string | null
  }

  export type MyfontsImageCountAggregateOutputType = {
    id: number
    font: number
    color: number
    backgroundColor: number
    width: number
    text: number
    precision: number
    _all: number
  }


  export type MyfontsImageAvgAggregateInputType = {
    id?: true
  }

  export type MyfontsImageSumAggregateInputType = {
    id?: true
  }

  export type MyfontsImageMinAggregateInputType = {
    id?: true
    font?: true
    color?: true
    backgroundColor?: true
    width?: true
    text?: true
    precision?: true
  }

  export type MyfontsImageMaxAggregateInputType = {
    id?: true
    font?: true
    color?: true
    backgroundColor?: true
    width?: true
    text?: true
    precision?: true
  }

  export type MyfontsImageCountAggregateInputType = {
    id?: true
    font?: true
    color?: true
    backgroundColor?: true
    width?: true
    text?: true
    precision?: true
    _all?: true
  }

  export type MyfontsImageAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which myfontsImage to aggregate.
     */
    where?: myfontsImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of myfontsImages to fetch.
     */
    orderBy?: myfontsImageOrderByWithRelationInput | myfontsImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: myfontsImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` myfontsImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` myfontsImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned myfontsImages
    **/
    _count?: true | MyfontsImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MyfontsImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MyfontsImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MyfontsImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MyfontsImageMaxAggregateInputType
  }

  export type GetMyfontsImageAggregateType<T extends MyfontsImageAggregateArgs> = {
        [P in keyof T & keyof AggregateMyfontsImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMyfontsImage[P]>
      : GetScalarType<T[P], AggregateMyfontsImage[P]>
  }




  export type myfontsImageGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: myfontsImageWhereInput
    orderBy?: myfontsImageOrderByWithAggregationInput | myfontsImageOrderByWithAggregationInput[]
    by: MyfontsImageScalarFieldEnum[] | MyfontsImageScalarFieldEnum
    having?: myfontsImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MyfontsImageCountAggregateInputType | true
    _avg?: MyfontsImageAvgAggregateInputType
    _sum?: MyfontsImageSumAggregateInputType
    _min?: MyfontsImageMinAggregateInputType
    _max?: MyfontsImageMaxAggregateInputType
  }

  export type MyfontsImageGroupByOutputType = {
    id: number
    font: string | null
    color: string | null
    backgroundColor: string | null
    width: string | null
    text: string | null
    precision: string | null
    _count: MyfontsImageCountAggregateOutputType | null
    _avg: MyfontsImageAvgAggregateOutputType | null
    _sum: MyfontsImageSumAggregateOutputType | null
    _min: MyfontsImageMinAggregateOutputType | null
    _max: MyfontsImageMaxAggregateOutputType | null
  }

  type GetMyfontsImageGroupByPayload<T extends myfontsImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MyfontsImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MyfontsImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MyfontsImageGroupByOutputType[P]>
            : GetScalarType<T[P], MyfontsImageGroupByOutputType[P]>
        }
      >
    >


  export type myfontsImageSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    font?: boolean
    color?: boolean
    backgroundColor?: boolean
    width?: boolean
    text?: boolean
    precision?: boolean
  }, ExtArgs["result"]["myfontsImage"]>

  export type myfontsImageSelectScalar = {
    id?: boolean
    font?: boolean
    color?: boolean
    backgroundColor?: boolean
    width?: boolean
    text?: boolean
    precision?: boolean
  }


  export type $myfontsImagePayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "myfontsImage"
    objects: {}
    scalars: $Extensions.GetResult<{
      id: number
      font: string | null
      color: string | null
      backgroundColor: string | null
      width: string | null
      text: string | null
      precision: string | null
    }, ExtArgs["result"]["myfontsImage"]>
    composites: {}
  }


  type myfontsImageGetPayload<S extends boolean | null | undefined | myfontsImageDefaultArgs> = $Result.GetResult<Prisma.$myfontsImagePayload, S>

  type myfontsImageCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<myfontsImageFindManyArgs, 'select' | 'include'> & {
      select?: MyfontsImageCountAggregateInputType | true
    }

  export interface myfontsImageDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['myfontsImage'], meta: { name: 'myfontsImage' } }
    /**
     * Find zero or one MyfontsImage that matches the filter.
     * @param {myfontsImageFindUniqueArgs} args - Arguments to find a MyfontsImage
     * @example
     * // Get one MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends myfontsImageFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageFindUniqueArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one MyfontsImage that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {myfontsImageFindUniqueOrThrowArgs} args - Arguments to find a MyfontsImage
     * @example
     * // Get one MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends myfontsImageFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first MyfontsImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageFindFirstArgs} args - Arguments to find a MyfontsImage
     * @example
     * // Get one MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends myfontsImageFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageFindFirstArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first MyfontsImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageFindFirstOrThrowArgs} args - Arguments to find a MyfontsImage
     * @example
     * // Get one MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends myfontsImageFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more MyfontsImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MyfontsImages
     * const myfontsImages = await prisma.myfontsImage.findMany()
     * 
     * // Get first 10 MyfontsImages
     * const myfontsImages = await prisma.myfontsImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const myfontsImageWithIdOnly = await prisma.myfontsImage.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends myfontsImageFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a MyfontsImage.
     * @param {myfontsImageCreateArgs} args - Arguments to create a MyfontsImage.
     * @example
     * // Create one MyfontsImage
     * const MyfontsImage = await prisma.myfontsImage.create({
     *   data: {
     *     // ... data to create a MyfontsImage
     *   }
     * })
     * 
    **/
    create<T extends myfontsImageCreateArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageCreateArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many MyfontsImages.
     *     @param {myfontsImageCreateManyArgs} args - Arguments to create many MyfontsImages.
     *     @example
     *     // Create many MyfontsImages
     *     const myfontsImage = await prisma.myfontsImage.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends myfontsImageCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a MyfontsImage.
     * @param {myfontsImageDeleteArgs} args - Arguments to delete one MyfontsImage.
     * @example
     * // Delete one MyfontsImage
     * const MyfontsImage = await prisma.myfontsImage.delete({
     *   where: {
     *     // ... filter to delete one MyfontsImage
     *   }
     * })
     * 
    **/
    delete<T extends myfontsImageDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageDeleteArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one MyfontsImage.
     * @param {myfontsImageUpdateArgs} args - Arguments to update one MyfontsImage.
     * @example
     * // Update one MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends myfontsImageUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageUpdateArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more MyfontsImages.
     * @param {myfontsImageDeleteManyArgs} args - Arguments to filter MyfontsImages to delete.
     * @example
     * // Delete a few MyfontsImages
     * const { count } = await prisma.myfontsImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends myfontsImageDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, myfontsImageDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MyfontsImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MyfontsImages
     * const myfontsImage = await prisma.myfontsImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends myfontsImageUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MyfontsImage.
     * @param {myfontsImageUpsertArgs} args - Arguments to update or create a MyfontsImage.
     * @example
     * // Update or create a MyfontsImage
     * const myfontsImage = await prisma.myfontsImage.upsert({
     *   create: {
     *     // ... data to create a MyfontsImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MyfontsImage we want to update
     *   }
     * })
    **/
    upsert<T extends myfontsImageUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, myfontsImageUpsertArgs<ExtArgs>>
    ): Prisma__myfontsImageClient<$Result.GetResult<Prisma.$myfontsImagePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of MyfontsImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageCountArgs} args - Arguments to filter MyfontsImages to count.
     * @example
     * // Count the number of MyfontsImages
     * const count = await prisma.myfontsImage.count({
     *   where: {
     *     // ... the filter for the MyfontsImages we want to count
     *   }
     * })
    **/
    count<T extends myfontsImageCountArgs>(
      args?: Subset<T, myfontsImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MyfontsImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MyfontsImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MyfontsImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MyfontsImageAggregateArgs>(args: Subset<T, MyfontsImageAggregateArgs>): Prisma.PrismaPromise<GetMyfontsImageAggregateType<T>>

    /**
     * Group by MyfontsImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {myfontsImageGroupByArgs} args - Group by arguments.
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
      T extends myfontsImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: myfontsImageGroupByArgs['orderBy'] }
        : { orderBy?: myfontsImageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, myfontsImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMyfontsImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the myfontsImage model
   */
  readonly fields: myfontsImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for myfontsImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__myfontsImageClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the myfontsImage model
   */ 
  interface myfontsImageFieldRefs {
    readonly id: FieldRef<"myfontsImage", 'Int'>
    readonly font: FieldRef<"myfontsImage", 'String'>
    readonly color: FieldRef<"myfontsImage", 'String'>
    readonly backgroundColor: FieldRef<"myfontsImage", 'String'>
    readonly width: FieldRef<"myfontsImage", 'String'>
    readonly text: FieldRef<"myfontsImage", 'String'>
    readonly precision: FieldRef<"myfontsImage", 'String'>
  }
    

  // Custom InputTypes

  /**
   * myfontsImage findUnique
   */
  export type myfontsImageFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter, which myfontsImage to fetch.
     */
    where: myfontsImageWhereUniqueInput
  }


  /**
   * myfontsImage findUniqueOrThrow
   */
  export type myfontsImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter, which myfontsImage to fetch.
     */
    where: myfontsImageWhereUniqueInput
  }


  /**
   * myfontsImage findFirst
   */
  export type myfontsImageFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter, which myfontsImage to fetch.
     */
    where?: myfontsImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of myfontsImages to fetch.
     */
    orderBy?: myfontsImageOrderByWithRelationInput | myfontsImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for myfontsImages.
     */
    cursor?: myfontsImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` myfontsImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` myfontsImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of myfontsImages.
     */
    distinct?: MyfontsImageScalarFieldEnum | MyfontsImageScalarFieldEnum[]
  }


  /**
   * myfontsImage findFirstOrThrow
   */
  export type myfontsImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter, which myfontsImage to fetch.
     */
    where?: myfontsImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of myfontsImages to fetch.
     */
    orderBy?: myfontsImageOrderByWithRelationInput | myfontsImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for myfontsImages.
     */
    cursor?: myfontsImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` myfontsImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` myfontsImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of myfontsImages.
     */
    distinct?: MyfontsImageScalarFieldEnum | MyfontsImageScalarFieldEnum[]
  }


  /**
   * myfontsImage findMany
   */
  export type myfontsImageFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter, which myfontsImages to fetch.
     */
    where?: myfontsImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of myfontsImages to fetch.
     */
    orderBy?: myfontsImageOrderByWithRelationInput | myfontsImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing myfontsImages.
     */
    cursor?: myfontsImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` myfontsImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` myfontsImages.
     */
    skip?: number
    distinct?: MyfontsImageScalarFieldEnum | MyfontsImageScalarFieldEnum[]
  }


  /**
   * myfontsImage create
   */
  export type myfontsImageCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * The data needed to create a myfontsImage.
     */
    data?: XOR<myfontsImageCreateInput, myfontsImageUncheckedCreateInput>
  }


  /**
   * myfontsImage createMany
   */
  export type myfontsImageCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many myfontsImages.
     */
    data: myfontsImageCreateManyInput | myfontsImageCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * myfontsImage update
   */
  export type myfontsImageUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * The data needed to update a myfontsImage.
     */
    data: XOR<myfontsImageUpdateInput, myfontsImageUncheckedUpdateInput>
    /**
     * Choose, which myfontsImage to update.
     */
    where: myfontsImageWhereUniqueInput
  }


  /**
   * myfontsImage updateMany
   */
  export type myfontsImageUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update myfontsImages.
     */
    data: XOR<myfontsImageUpdateManyMutationInput, myfontsImageUncheckedUpdateManyInput>
    /**
     * Filter which myfontsImages to update
     */
    where?: myfontsImageWhereInput
  }


  /**
   * myfontsImage upsert
   */
  export type myfontsImageUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * The filter to search for the myfontsImage to update in case it exists.
     */
    where: myfontsImageWhereUniqueInput
    /**
     * In case the myfontsImage found by the `where` argument doesn't exist, create a new myfontsImage with this data.
     */
    create: XOR<myfontsImageCreateInput, myfontsImageUncheckedCreateInput>
    /**
     * In case the myfontsImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<myfontsImageUpdateInput, myfontsImageUncheckedUpdateInput>
  }


  /**
   * myfontsImage delete
   */
  export type myfontsImageDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
    /**
     * Filter which myfontsImage to delete.
     */
    where: myfontsImageWhereUniqueInput
  }


  /**
   * myfontsImage deleteMany
   */
  export type myfontsImageDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which myfontsImages to delete
     */
    where?: myfontsImageWhereInput
  }


  /**
   * myfontsImage without action
   */
  export type myfontsImageDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the myfontsImage
     */
    select?: myfontsImageSelect<ExtArgs> | null
  }



  /**
   * Model elementImage
   */

  export type AggregateElementImage = {
    _count: ElementImageCountAggregateOutputType | null
    _avg: ElementImageAvgAggregateOutputType | null
    _sum: ElementImageSumAggregateOutputType | null
    _min: ElementImageMinAggregateOutputType | null
    _max: ElementImageMaxAggregateOutputType | null
  }

  export type ElementImageAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ElementImageSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type ElementImageMinAggregateOutputType = {
    id: number | null
    userId: number | null
    hash: string | null
    createdAt: Date | null
    fileName: string | null
  }

  export type ElementImageMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    hash: string | null
    createdAt: Date | null
    fileName: string | null
  }

  export type ElementImageCountAggregateOutputType = {
    id: number
    userId: number
    hash: number
    createdAt: number
    fileName: number
    _all: number
  }


  export type ElementImageAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ElementImageSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type ElementImageMinAggregateInputType = {
    id?: true
    userId?: true
    hash?: true
    createdAt?: true
    fileName?: true
  }

  export type ElementImageMaxAggregateInputType = {
    id?: true
    userId?: true
    hash?: true
    createdAt?: true
    fileName?: true
  }

  export type ElementImageCountAggregateInputType = {
    id?: true
    userId?: true
    hash?: true
    createdAt?: true
    fileName?: true
    _all?: true
  }

  export type ElementImageAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which elementImage to aggregate.
     */
    where?: elementImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of elementImages to fetch.
     */
    orderBy?: elementImageOrderByWithRelationInput | elementImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: elementImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` elementImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` elementImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned elementImages
    **/
    _count?: true | ElementImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ElementImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ElementImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ElementImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ElementImageMaxAggregateInputType
  }

  export type GetElementImageAggregateType<T extends ElementImageAggregateArgs> = {
        [P in keyof T & keyof AggregateElementImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateElementImage[P]>
      : GetScalarType<T[P], AggregateElementImage[P]>
  }




  export type elementImageGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: elementImageWhereInput
    orderBy?: elementImageOrderByWithAggregationInput | elementImageOrderByWithAggregationInput[]
    by: ElementImageScalarFieldEnum[] | ElementImageScalarFieldEnum
    having?: elementImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ElementImageCountAggregateInputType | true
    _avg?: ElementImageAvgAggregateInputType
    _sum?: ElementImageSumAggregateInputType
    _min?: ElementImageMinAggregateInputType
    _max?: ElementImageMaxAggregateInputType
  }

  export type ElementImageGroupByOutputType = {
    id: number
    userId: number | null
    hash: string | null
    createdAt: Date | null
    fileName: string
    _count: ElementImageCountAggregateOutputType | null
    _avg: ElementImageAvgAggregateOutputType | null
    _sum: ElementImageSumAggregateOutputType | null
    _min: ElementImageMinAggregateOutputType | null
    _max: ElementImageMaxAggregateOutputType | null
  }

  type GetElementImageGroupByPayload<T extends elementImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ElementImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ElementImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ElementImageGroupByOutputType[P]>
            : GetScalarType<T[P], ElementImageGroupByOutputType[P]>
        }
      >
    >


  export type elementImageSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    hash?: boolean
    createdAt?: boolean
    fileName?: boolean
    tranches_en_cours_modeles_images?: boolean | elementImage$tranches_en_cours_modeles_imagesArgs<ExtArgs>
    _count?: boolean | ElementImageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["elementImage"]>

  export type elementImageSelectScalar = {
    id?: boolean
    userId?: boolean
    hash?: boolean
    createdAt?: boolean
    fileName?: boolean
  }

  export type elementImageInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    tranches_en_cours_modeles_images?: boolean | elementImage$tranches_en_cours_modeles_imagesArgs<ExtArgs>
    _count?: boolean | ElementImageCountOutputTypeDefaultArgs<ExtArgs>
  }


  export type $elementImagePayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "elementImage"
    objects: {
      tranches_en_cours_modeles_images: Prisma.$edgePhotoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetResult<{
      id: number
      userId: number | null
      hash: string | null
      createdAt: Date | null
      fileName: string
    }, ExtArgs["result"]["elementImage"]>
    composites: {}
  }


  type elementImageGetPayload<S extends boolean | null | undefined | elementImageDefaultArgs> = $Result.GetResult<Prisma.$elementImagePayload, S>

  type elementImageCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<elementImageFindManyArgs, 'select' | 'include'> & {
      select?: ElementImageCountAggregateInputType | true
    }

  export interface elementImageDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['elementImage'], meta: { name: 'elementImage' } }
    /**
     * Find zero or one ElementImage that matches the filter.
     * @param {elementImageFindUniqueArgs} args - Arguments to find a ElementImage
     * @example
     * // Get one ElementImage
     * const elementImage = await prisma.elementImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends elementImageFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageFindUniqueArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one ElementImage that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {elementImageFindUniqueOrThrowArgs} args - Arguments to find a ElementImage
     * @example
     * // Get one ElementImage
     * const elementImage = await prisma.elementImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends elementImageFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first ElementImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageFindFirstArgs} args - Arguments to find a ElementImage
     * @example
     * // Get one ElementImage
     * const elementImage = await prisma.elementImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends elementImageFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageFindFirstArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first ElementImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageFindFirstOrThrowArgs} args - Arguments to find a ElementImage
     * @example
     * // Get one ElementImage
     * const elementImage = await prisma.elementImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends elementImageFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more ElementImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ElementImages
     * const elementImages = await prisma.elementImage.findMany()
     * 
     * // Get first 10 ElementImages
     * const elementImages = await prisma.elementImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const elementImageWithIdOnly = await prisma.elementImage.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends elementImageFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a ElementImage.
     * @param {elementImageCreateArgs} args - Arguments to create a ElementImage.
     * @example
     * // Create one ElementImage
     * const ElementImage = await prisma.elementImage.create({
     *   data: {
     *     // ... data to create a ElementImage
     *   }
     * })
     * 
    **/
    create<T extends elementImageCreateArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageCreateArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many ElementImages.
     *     @param {elementImageCreateManyArgs} args - Arguments to create many ElementImages.
     *     @example
     *     // Create many ElementImages
     *     const elementImage = await prisma.elementImage.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends elementImageCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ElementImage.
     * @param {elementImageDeleteArgs} args - Arguments to delete one ElementImage.
     * @example
     * // Delete one ElementImage
     * const ElementImage = await prisma.elementImage.delete({
     *   where: {
     *     // ... filter to delete one ElementImage
     *   }
     * })
     * 
    **/
    delete<T extends elementImageDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageDeleteArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one ElementImage.
     * @param {elementImageUpdateArgs} args - Arguments to update one ElementImage.
     * @example
     * // Update one ElementImage
     * const elementImage = await prisma.elementImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends elementImageUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageUpdateArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more ElementImages.
     * @param {elementImageDeleteManyArgs} args - Arguments to filter ElementImages to delete.
     * @example
     * // Delete a few ElementImages
     * const { count } = await prisma.elementImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends elementImageDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, elementImageDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ElementImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ElementImages
     * const elementImage = await prisma.elementImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends elementImageUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ElementImage.
     * @param {elementImageUpsertArgs} args - Arguments to update or create a ElementImage.
     * @example
     * // Update or create a ElementImage
     * const elementImage = await prisma.elementImage.upsert({
     *   create: {
     *     // ... data to create a ElementImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ElementImage we want to update
     *   }
     * })
    **/
    upsert<T extends elementImageUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, elementImageUpsertArgs<ExtArgs>>
    ): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of ElementImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageCountArgs} args - Arguments to filter ElementImages to count.
     * @example
     * // Count the number of ElementImages
     * const count = await prisma.elementImage.count({
     *   where: {
     *     // ... the filter for the ElementImages we want to count
     *   }
     * })
    **/
    count<T extends elementImageCountArgs>(
      args?: Subset<T, elementImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ElementImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ElementImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ElementImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ElementImageAggregateArgs>(args: Subset<T, ElementImageAggregateArgs>): Prisma.PrismaPromise<GetElementImageAggregateType<T>>

    /**
     * Group by ElementImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {elementImageGroupByArgs} args - Group by arguments.
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
      T extends elementImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: elementImageGroupByArgs['orderBy'] }
        : { orderBy?: elementImageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, elementImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetElementImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the elementImage model
   */
  readonly fields: elementImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for elementImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__elementImageClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    tranches_en_cours_modeles_images<T extends elementImage$tranches_en_cours_modeles_imagesArgs<ExtArgs> = {}>(args?: Subset<T, elementImage$tranches_en_cours_modeles_imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findMany'> | Null>;

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
   * Fields of the elementImage model
   */ 
  interface elementImageFieldRefs {
    readonly id: FieldRef<"elementImage", 'Int'>
    readonly userId: FieldRef<"elementImage", 'Int'>
    readonly hash: FieldRef<"elementImage", 'String'>
    readonly createdAt: FieldRef<"elementImage", 'DateTime'>
    readonly fileName: FieldRef<"elementImage", 'String'>
  }
    

  // Custom InputTypes

  /**
   * elementImage findUnique
   */
  export type elementImageFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter, which elementImage to fetch.
     */
    where: elementImageWhereUniqueInput
  }


  /**
   * elementImage findUniqueOrThrow
   */
  export type elementImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter, which elementImage to fetch.
     */
    where: elementImageWhereUniqueInput
  }


  /**
   * elementImage findFirst
   */
  export type elementImageFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter, which elementImage to fetch.
     */
    where?: elementImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of elementImages to fetch.
     */
    orderBy?: elementImageOrderByWithRelationInput | elementImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for elementImages.
     */
    cursor?: elementImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` elementImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` elementImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of elementImages.
     */
    distinct?: ElementImageScalarFieldEnum | ElementImageScalarFieldEnum[]
  }


  /**
   * elementImage findFirstOrThrow
   */
  export type elementImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter, which elementImage to fetch.
     */
    where?: elementImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of elementImages to fetch.
     */
    orderBy?: elementImageOrderByWithRelationInput | elementImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for elementImages.
     */
    cursor?: elementImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` elementImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` elementImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of elementImages.
     */
    distinct?: ElementImageScalarFieldEnum | ElementImageScalarFieldEnum[]
  }


  /**
   * elementImage findMany
   */
  export type elementImageFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter, which elementImages to fetch.
     */
    where?: elementImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of elementImages to fetch.
     */
    orderBy?: elementImageOrderByWithRelationInput | elementImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing elementImages.
     */
    cursor?: elementImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` elementImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` elementImages.
     */
    skip?: number
    distinct?: ElementImageScalarFieldEnum | ElementImageScalarFieldEnum[]
  }


  /**
   * elementImage create
   */
  export type elementImageCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * The data needed to create a elementImage.
     */
    data: XOR<elementImageCreateInput, elementImageUncheckedCreateInput>
  }


  /**
   * elementImage createMany
   */
  export type elementImageCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many elementImages.
     */
    data: elementImageCreateManyInput | elementImageCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * elementImage update
   */
  export type elementImageUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * The data needed to update a elementImage.
     */
    data: XOR<elementImageUpdateInput, elementImageUncheckedUpdateInput>
    /**
     * Choose, which elementImage to update.
     */
    where: elementImageWhereUniqueInput
  }


  /**
   * elementImage updateMany
   */
  export type elementImageUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update elementImages.
     */
    data: XOR<elementImageUpdateManyMutationInput, elementImageUncheckedUpdateManyInput>
    /**
     * Filter which elementImages to update
     */
    where?: elementImageWhereInput
  }


  /**
   * elementImage upsert
   */
  export type elementImageUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * The filter to search for the elementImage to update in case it exists.
     */
    where: elementImageWhereUniqueInput
    /**
     * In case the elementImage found by the `where` argument doesn't exist, create a new elementImage with this data.
     */
    create: XOR<elementImageCreateInput, elementImageUncheckedCreateInput>
    /**
     * In case the elementImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<elementImageUpdateInput, elementImageUncheckedUpdateInput>
  }


  /**
   * elementImage delete
   */
  export type elementImageDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
    /**
     * Filter which elementImage to delete.
     */
    where: elementImageWhereUniqueInput
  }


  /**
   * elementImage deleteMany
   */
  export type elementImageDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which elementImages to delete
     */
    where?: elementImageWhereInput
  }


  /**
   * elementImage.tranches_en_cours_modeles_images
   */
  export type elementImage$tranches_en_cours_modeles_imagesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    where?: edgePhotoWhereInput
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    cursor?: edgePhotoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EdgePhotoScalarFieldEnum | EdgePhotoScalarFieldEnum[]
  }


  /**
   * elementImage without action
   */
  export type elementImageDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the elementImage
     */
    select?: elementImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: elementImageInclude<ExtArgs> | null
  }



  /**
   * Model edgeModel
   */

  export type AggregateEdgeModel = {
    _count: EdgeModelCountAggregateOutputType | null
    _avg: EdgeModelAvgAggregateOutputType | null
    _sum: EdgeModelSumAggregateOutputType | null
    _min: EdgeModelMinAggregateOutputType | null
    _max: EdgeModelMaxAggregateOutputType | null
  }

  export type EdgeModelAvgAggregateOutputType = {
    id: number | null
  }

  export type EdgeModelSumAggregateOutputType = {
    id: number | null
  }

  export type EdgeModelMinAggregateOutputType = {
    id: number | null
    country: string | null
    magazine: string | null
    issuenumber: string | null
    username: string | null
    mainPhotoName: string | null
    photographs: string | null
    creators: string | null
    isActive: boolean | null
  }

  export type EdgeModelMaxAggregateOutputType = {
    id: number | null
    country: string | null
    magazine: string | null
    issuenumber: string | null
    username: string | null
    mainPhotoName: string | null
    photographs: string | null
    creators: string | null
    isActive: boolean | null
  }

  export type EdgeModelCountAggregateOutputType = {
    id: number
    country: number
    magazine: number
    issuenumber: number
    username: number
    mainPhotoName: number
    photographs: number
    creators: number
    isActive: number
    _all: number
  }


  export type EdgeModelAvgAggregateInputType = {
    id?: true
  }

  export type EdgeModelSumAggregateInputType = {
    id?: true
  }

  export type EdgeModelMinAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    issuenumber?: true
    username?: true
    mainPhotoName?: true
    photographs?: true
    creators?: true
    isActive?: true
  }

  export type EdgeModelMaxAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    issuenumber?: true
    username?: true
    mainPhotoName?: true
    photographs?: true
    creators?: true
    isActive?: true
  }

  export type EdgeModelCountAggregateInputType = {
    id?: true
    country?: true
    magazine?: true
    issuenumber?: true
    username?: true
    mainPhotoName?: true
    photographs?: true
    creators?: true
    isActive?: true
    _all?: true
  }

  export type EdgeModelAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeModel to aggregate.
     */
    where?: edgeModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModels to fetch.
     */
    orderBy?: edgeModelOrderByWithRelationInput | edgeModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: edgeModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned edgeModels
    **/
    _count?: true | EdgeModelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EdgeModelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EdgeModelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdgeModelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdgeModelMaxAggregateInputType
  }

  export type GetEdgeModelAggregateType<T extends EdgeModelAggregateArgs> = {
        [P in keyof T & keyof AggregateEdgeModel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdgeModel[P]>
      : GetScalarType<T[P], AggregateEdgeModel[P]>
  }




  export type edgeModelGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeModelWhereInput
    orderBy?: edgeModelOrderByWithAggregationInput | edgeModelOrderByWithAggregationInput[]
    by: EdgeModelScalarFieldEnum[] | EdgeModelScalarFieldEnum
    having?: edgeModelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdgeModelCountAggregateInputType | true
    _avg?: EdgeModelAvgAggregateInputType
    _sum?: EdgeModelSumAggregateInputType
    _min?: EdgeModelMinAggregateInputType
    _max?: EdgeModelMaxAggregateInputType
  }

  export type EdgeModelGroupByOutputType = {
    id: number
    country: string
    magazine: string
    issuenumber: string
    username: string | null
    mainPhotoName: string | null
    photographs: string | null
    creators: string | null
    isActive: boolean
    _count: EdgeModelCountAggregateOutputType | null
    _avg: EdgeModelAvgAggregateOutputType | null
    _sum: EdgeModelSumAggregateOutputType | null
    _min: EdgeModelMinAggregateOutputType | null
    _max: EdgeModelMaxAggregateOutputType | null
  }

  type GetEdgeModelGroupByPayload<T extends edgeModelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdgeModelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdgeModelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdgeModelGroupByOutputType[P]>
            : GetScalarType<T[P], EdgeModelGroupByOutputType[P]>
        }
      >
    >


  export type edgeModelSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    country?: boolean
    magazine?: boolean
    issuenumber?: boolean
    username?: boolean
    mainPhotoName?: boolean
    photographs?: boolean
    creators?: boolean
    isActive?: boolean
    contributors?: boolean | edgeModel$contributorsArgs<ExtArgs>
    photos?: boolean | edgeModel$photosArgs<ExtArgs>
    values?: boolean | edgeModel$valuesArgs<ExtArgs>
    _count?: boolean | EdgeModelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["edgeModel"]>

  export type edgeModelSelectScalar = {
    id?: boolean
    country?: boolean
    magazine?: boolean
    issuenumber?: boolean
    username?: boolean
    mainPhotoName?: boolean
    photographs?: boolean
    creators?: boolean
    isActive?: boolean
  }

  export type edgeModelInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    contributors?: boolean | edgeModel$contributorsArgs<ExtArgs>
    photos?: boolean | edgeModel$photosArgs<ExtArgs>
    values?: boolean | edgeModel$valuesArgs<ExtArgs>
    _count?: boolean | EdgeModelCountOutputTypeDefaultArgs<ExtArgs>
  }


  export type $edgeModelPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "edgeModel"
    objects: {
      contributors: Prisma.$edgeContributorPayload<ExtArgs>[]
      photos: Prisma.$edgePhotoPayload<ExtArgs>[]
      values: Prisma.$edgeValuePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetResult<{
      id: number
      country: string
      magazine: string
      issuenumber: string
      username: string | null
      mainPhotoName: string | null
      photographs: string | null
      creators: string | null
      isActive: boolean
    }, ExtArgs["result"]["edgeModel"]>
    composites: {}
  }


  type edgeModelGetPayload<S extends boolean | null | undefined | edgeModelDefaultArgs> = $Result.GetResult<Prisma.$edgeModelPayload, S>

  type edgeModelCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<edgeModelFindManyArgs, 'select' | 'include'> & {
      select?: EdgeModelCountAggregateInputType | true
    }

  export interface edgeModelDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['edgeModel'], meta: { name: 'edgeModel' } }
    /**
     * Find zero or one EdgeModel that matches the filter.
     * @param {edgeModelFindUniqueArgs} args - Arguments to find a EdgeModel
     * @example
     * // Get one EdgeModel
     * const edgeModel = await prisma.edgeModel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends edgeModelFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelFindUniqueArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one EdgeModel that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {edgeModelFindUniqueOrThrowArgs} args - Arguments to find a EdgeModel
     * @example
     * // Get one EdgeModel
     * const edgeModel = await prisma.edgeModel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends edgeModelFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first EdgeModel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelFindFirstArgs} args - Arguments to find a EdgeModel
     * @example
     * // Get one EdgeModel
     * const edgeModel = await prisma.edgeModel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends edgeModelFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelFindFirstArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first EdgeModel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelFindFirstOrThrowArgs} args - Arguments to find a EdgeModel
     * @example
     * // Get one EdgeModel
     * const edgeModel = await prisma.edgeModel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends edgeModelFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more EdgeModels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdgeModels
     * const edgeModels = await prisma.edgeModel.findMany()
     * 
     * // Get first 10 EdgeModels
     * const edgeModels = await prisma.edgeModel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edgeModelWithIdOnly = await prisma.edgeModel.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends edgeModelFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a EdgeModel.
     * @param {edgeModelCreateArgs} args - Arguments to create a EdgeModel.
     * @example
     * // Create one EdgeModel
     * const EdgeModel = await prisma.edgeModel.create({
     *   data: {
     *     // ... data to create a EdgeModel
     *   }
     * })
     * 
    **/
    create<T extends edgeModelCreateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelCreateArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many EdgeModels.
     *     @param {edgeModelCreateManyArgs} args - Arguments to create many EdgeModels.
     *     @example
     *     // Create many EdgeModels
     *     const edgeModel = await prisma.edgeModel.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends edgeModelCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EdgeModel.
     * @param {edgeModelDeleteArgs} args - Arguments to delete one EdgeModel.
     * @example
     * // Delete one EdgeModel
     * const EdgeModel = await prisma.edgeModel.delete({
     *   where: {
     *     // ... filter to delete one EdgeModel
     *   }
     * })
     * 
    **/
    delete<T extends edgeModelDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelDeleteArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one EdgeModel.
     * @param {edgeModelUpdateArgs} args - Arguments to update one EdgeModel.
     * @example
     * // Update one EdgeModel
     * const edgeModel = await prisma.edgeModel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends edgeModelUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelUpdateArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more EdgeModels.
     * @param {edgeModelDeleteManyArgs} args - Arguments to filter EdgeModels to delete.
     * @example
     * // Delete a few EdgeModels
     * const { count } = await prisma.edgeModel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends edgeModelDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeModelDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdgeModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdgeModels
     * const edgeModel = await prisma.edgeModel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends edgeModelUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EdgeModel.
     * @param {edgeModelUpsertArgs} args - Arguments to update or create a EdgeModel.
     * @example
     * // Update or create a EdgeModel
     * const edgeModel = await prisma.edgeModel.upsert({
     *   create: {
     *     // ... data to create a EdgeModel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdgeModel we want to update
     *   }
     * })
    **/
    upsert<T extends edgeModelUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, edgeModelUpsertArgs<ExtArgs>>
    ): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of EdgeModels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelCountArgs} args - Arguments to filter EdgeModels to count.
     * @example
     * // Count the number of EdgeModels
     * const count = await prisma.edgeModel.count({
     *   where: {
     *     // ... the filter for the EdgeModels we want to count
     *   }
     * })
    **/
    count<T extends edgeModelCountArgs>(
      args?: Subset<T, edgeModelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdgeModelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdgeModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdgeModelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EdgeModelAggregateArgs>(args: Subset<T, EdgeModelAggregateArgs>): Prisma.PrismaPromise<GetEdgeModelAggregateType<T>>

    /**
     * Group by EdgeModel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeModelGroupByArgs} args - Group by arguments.
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
      T extends edgeModelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: edgeModelGroupByArgs['orderBy'] }
        : { orderBy?: edgeModelGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, edgeModelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdgeModelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the edgeModel model
   */
  readonly fields: edgeModelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for edgeModel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__edgeModelClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    contributors<T extends edgeModel$contributorsArgs<ExtArgs> = {}>(args?: Subset<T, edgeModel$contributorsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findMany'> | Null>;

    photos<T extends edgeModel$photosArgs<ExtArgs> = {}>(args?: Subset<T, edgeModel$photosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findMany'> | Null>;

    values<T extends edgeModel$valuesArgs<ExtArgs> = {}>(args?: Subset<T, edgeModel$valuesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findMany'> | Null>;

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
   * Fields of the edgeModel model
   */ 
  interface edgeModelFieldRefs {
    readonly id: FieldRef<"edgeModel", 'Int'>
    readonly country: FieldRef<"edgeModel", 'String'>
    readonly magazine: FieldRef<"edgeModel", 'String'>
    readonly issuenumber: FieldRef<"edgeModel", 'String'>
    readonly username: FieldRef<"edgeModel", 'String'>
    readonly mainPhotoName: FieldRef<"edgeModel", 'String'>
    readonly photographs: FieldRef<"edgeModel", 'String'>
    readonly creators: FieldRef<"edgeModel", 'String'>
    readonly isActive: FieldRef<"edgeModel", 'Boolean'>
  }
    

  // Custom InputTypes

  /**
   * edgeModel findUnique
   */
  export type edgeModelFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter, which edgeModel to fetch.
     */
    where: edgeModelWhereUniqueInput
  }


  /**
   * edgeModel findUniqueOrThrow
   */
  export type edgeModelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter, which edgeModel to fetch.
     */
    where: edgeModelWhereUniqueInput
  }


  /**
   * edgeModel findFirst
   */
  export type edgeModelFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter, which edgeModel to fetch.
     */
    where?: edgeModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModels to fetch.
     */
    orderBy?: edgeModelOrderByWithRelationInput | edgeModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeModels.
     */
    cursor?: edgeModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeModels.
     */
    distinct?: EdgeModelScalarFieldEnum | EdgeModelScalarFieldEnum[]
  }


  /**
   * edgeModel findFirstOrThrow
   */
  export type edgeModelFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter, which edgeModel to fetch.
     */
    where?: edgeModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModels to fetch.
     */
    orderBy?: edgeModelOrderByWithRelationInput | edgeModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeModels.
     */
    cursor?: edgeModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeModels.
     */
    distinct?: EdgeModelScalarFieldEnum | EdgeModelScalarFieldEnum[]
  }


  /**
   * edgeModel findMany
   */
  export type edgeModelFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter, which edgeModels to fetch.
     */
    where?: edgeModelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeModels to fetch.
     */
    orderBy?: edgeModelOrderByWithRelationInput | edgeModelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing edgeModels.
     */
    cursor?: edgeModelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeModels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeModels.
     */
    skip?: number
    distinct?: EdgeModelScalarFieldEnum | EdgeModelScalarFieldEnum[]
  }


  /**
   * edgeModel create
   */
  export type edgeModelCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * The data needed to create a edgeModel.
     */
    data: XOR<edgeModelCreateInput, edgeModelUncheckedCreateInput>
  }


  /**
   * edgeModel createMany
   */
  export type edgeModelCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many edgeModels.
     */
    data: edgeModelCreateManyInput | edgeModelCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * edgeModel update
   */
  export type edgeModelUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * The data needed to update a edgeModel.
     */
    data: XOR<edgeModelUpdateInput, edgeModelUncheckedUpdateInput>
    /**
     * Choose, which edgeModel to update.
     */
    where: edgeModelWhereUniqueInput
  }


  /**
   * edgeModel updateMany
   */
  export type edgeModelUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update edgeModels.
     */
    data: XOR<edgeModelUpdateManyMutationInput, edgeModelUncheckedUpdateManyInput>
    /**
     * Filter which edgeModels to update
     */
    where?: edgeModelWhereInput
  }


  /**
   * edgeModel upsert
   */
  export type edgeModelUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * The filter to search for the edgeModel to update in case it exists.
     */
    where: edgeModelWhereUniqueInput
    /**
     * In case the edgeModel found by the `where` argument doesn't exist, create a new edgeModel with this data.
     */
    create: XOR<edgeModelCreateInput, edgeModelUncheckedCreateInput>
    /**
     * In case the edgeModel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<edgeModelUpdateInput, edgeModelUncheckedUpdateInput>
  }


  /**
   * edgeModel delete
   */
  export type edgeModelDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    /**
     * Filter which edgeModel to delete.
     */
    where: edgeModelWhereUniqueInput
  }


  /**
   * edgeModel deleteMany
   */
  export type edgeModelDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeModels to delete
     */
    where?: edgeModelWhereInput
  }


  /**
   * edgeModel.contributors
   */
  export type edgeModel$contributorsArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    where?: edgeContributorWhereInput
    orderBy?: edgeContributorOrderByWithRelationInput | edgeContributorOrderByWithRelationInput[]
    cursor?: edgeContributorWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EdgeContributorScalarFieldEnum | EdgeContributorScalarFieldEnum[]
  }


  /**
   * edgeModel.photos
   */
  export type edgeModel$photosArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    where?: edgePhotoWhereInput
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    cursor?: edgePhotoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EdgePhotoScalarFieldEnum | EdgePhotoScalarFieldEnum[]
  }


  /**
   * edgeModel.values
   */
  export type edgeModel$valuesArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    where?: edgeValueWhereInput
    orderBy?: edgeValueOrderByWithRelationInput | edgeValueOrderByWithRelationInput[]
    cursor?: edgeValueWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EdgeValueScalarFieldEnum | EdgeValueScalarFieldEnum[]
  }


  /**
   * edgeModel without action
   */
  export type edgeModelDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
  }



  /**
   * Model edgeContributor
   */

  export type AggregateEdgeContributor = {
    _count: EdgeContributorCountAggregateOutputType | null
    _avg: EdgeContributorAvgAggregateOutputType | null
    _sum: EdgeContributorSumAggregateOutputType | null
    _min: EdgeContributorMinAggregateOutputType | null
    _max: EdgeContributorMaxAggregateOutputType | null
  }

  export type EdgeContributorAvgAggregateOutputType = {
    id: number | null
    modelId: number | null
    userId: number | null
  }

  export type EdgeContributorSumAggregateOutputType = {
    id: number | null
    modelId: number | null
    userId: number | null
  }

  export type EdgeContributorMinAggregateOutputType = {
    id: number | null
    modelId: number | null
    userId: number | null
    contribution: $Enums.contribution | null
  }

  export type EdgeContributorMaxAggregateOutputType = {
    id: number | null
    modelId: number | null
    userId: number | null
    contribution: $Enums.contribution | null
  }

  export type EdgeContributorCountAggregateOutputType = {
    id: number
    modelId: number
    userId: number
    contribution: number
    _all: number
  }


  export type EdgeContributorAvgAggregateInputType = {
    id?: true
    modelId?: true
    userId?: true
  }

  export type EdgeContributorSumAggregateInputType = {
    id?: true
    modelId?: true
    userId?: true
  }

  export type EdgeContributorMinAggregateInputType = {
    id?: true
    modelId?: true
    userId?: true
    contribution?: true
  }

  export type EdgeContributorMaxAggregateInputType = {
    id?: true
    modelId?: true
    userId?: true
    contribution?: true
  }

  export type EdgeContributorCountAggregateInputType = {
    id?: true
    modelId?: true
    userId?: true
    contribution?: true
    _all?: true
  }

  export type EdgeContributorAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeContributor to aggregate.
     */
    where?: edgeContributorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeContributors to fetch.
     */
    orderBy?: edgeContributorOrderByWithRelationInput | edgeContributorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: edgeContributorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeContributors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeContributors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned edgeContributors
    **/
    _count?: true | EdgeContributorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EdgeContributorAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EdgeContributorSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdgeContributorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdgeContributorMaxAggregateInputType
  }

  export type GetEdgeContributorAggregateType<T extends EdgeContributorAggregateArgs> = {
        [P in keyof T & keyof AggregateEdgeContributor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdgeContributor[P]>
      : GetScalarType<T[P], AggregateEdgeContributor[P]>
  }




  export type edgeContributorGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeContributorWhereInput
    orderBy?: edgeContributorOrderByWithAggregationInput | edgeContributorOrderByWithAggregationInput[]
    by: EdgeContributorScalarFieldEnum[] | EdgeContributorScalarFieldEnum
    having?: edgeContributorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdgeContributorCountAggregateInputType | true
    _avg?: EdgeContributorAvgAggregateInputType
    _sum?: EdgeContributorSumAggregateInputType
    _min?: EdgeContributorMinAggregateInputType
    _max?: EdgeContributorMaxAggregateInputType
  }

  export type EdgeContributorGroupByOutputType = {
    id: number
    modelId: number | null
    userId: number
    contribution: $Enums.contribution
    _count: EdgeContributorCountAggregateOutputType | null
    _avg: EdgeContributorAvgAggregateOutputType | null
    _sum: EdgeContributorSumAggregateOutputType | null
    _min: EdgeContributorMinAggregateOutputType | null
    _max: EdgeContributorMaxAggregateOutputType | null
  }

  type GetEdgeContributorGroupByPayload<T extends edgeContributorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdgeContributorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdgeContributorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdgeContributorGroupByOutputType[P]>
            : GetScalarType<T[P], EdgeContributorGroupByOutputType[P]>
        }
      >
    >


  export type edgeContributorSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    modelId?: boolean
    userId?: boolean
    contribution?: boolean
    model?: boolean | edgeContributor$modelArgs<ExtArgs>
  }, ExtArgs["result"]["edgeContributor"]>

  export type edgeContributorSelectScalar = {
    id?: boolean
    modelId?: boolean
    userId?: boolean
    contribution?: boolean
  }

  export type edgeContributorInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    model?: boolean | edgeContributor$modelArgs<ExtArgs>
  }


  export type $edgeContributorPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "edgeContributor"
    objects: {
      model: Prisma.$edgeModelPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetResult<{
      id: number
      modelId: number | null
      userId: number
      contribution: $Enums.contribution
    }, ExtArgs["result"]["edgeContributor"]>
    composites: {}
  }


  type edgeContributorGetPayload<S extends boolean | null | undefined | edgeContributorDefaultArgs> = $Result.GetResult<Prisma.$edgeContributorPayload, S>

  type edgeContributorCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<edgeContributorFindManyArgs, 'select' | 'include'> & {
      select?: EdgeContributorCountAggregateInputType | true
    }

  export interface edgeContributorDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['edgeContributor'], meta: { name: 'edgeContributor' } }
    /**
     * Find zero or one EdgeContributor that matches the filter.
     * @param {edgeContributorFindUniqueArgs} args - Arguments to find a EdgeContributor
     * @example
     * // Get one EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends edgeContributorFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorFindUniqueArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one EdgeContributor that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {edgeContributorFindUniqueOrThrowArgs} args - Arguments to find a EdgeContributor
     * @example
     * // Get one EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends edgeContributorFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first EdgeContributor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorFindFirstArgs} args - Arguments to find a EdgeContributor
     * @example
     * // Get one EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends edgeContributorFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorFindFirstArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first EdgeContributor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorFindFirstOrThrowArgs} args - Arguments to find a EdgeContributor
     * @example
     * // Get one EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends edgeContributorFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more EdgeContributors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdgeContributors
     * const edgeContributors = await prisma.edgeContributor.findMany()
     * 
     * // Get first 10 EdgeContributors
     * const edgeContributors = await prisma.edgeContributor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edgeContributorWithIdOnly = await prisma.edgeContributor.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends edgeContributorFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a EdgeContributor.
     * @param {edgeContributorCreateArgs} args - Arguments to create a EdgeContributor.
     * @example
     * // Create one EdgeContributor
     * const EdgeContributor = await prisma.edgeContributor.create({
     *   data: {
     *     // ... data to create a EdgeContributor
     *   }
     * })
     * 
    **/
    create<T extends edgeContributorCreateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorCreateArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many EdgeContributors.
     *     @param {edgeContributorCreateManyArgs} args - Arguments to create many EdgeContributors.
     *     @example
     *     // Create many EdgeContributors
     *     const edgeContributor = await prisma.edgeContributor.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends edgeContributorCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EdgeContributor.
     * @param {edgeContributorDeleteArgs} args - Arguments to delete one EdgeContributor.
     * @example
     * // Delete one EdgeContributor
     * const EdgeContributor = await prisma.edgeContributor.delete({
     *   where: {
     *     // ... filter to delete one EdgeContributor
     *   }
     * })
     * 
    **/
    delete<T extends edgeContributorDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorDeleteArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one EdgeContributor.
     * @param {edgeContributorUpdateArgs} args - Arguments to update one EdgeContributor.
     * @example
     * // Update one EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends edgeContributorUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorUpdateArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more EdgeContributors.
     * @param {edgeContributorDeleteManyArgs} args - Arguments to filter EdgeContributors to delete.
     * @example
     * // Delete a few EdgeContributors
     * const { count } = await prisma.edgeContributor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends edgeContributorDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeContributorDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdgeContributors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdgeContributors
     * const edgeContributor = await prisma.edgeContributor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends edgeContributorUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EdgeContributor.
     * @param {edgeContributorUpsertArgs} args - Arguments to update or create a EdgeContributor.
     * @example
     * // Update or create a EdgeContributor
     * const edgeContributor = await prisma.edgeContributor.upsert({
     *   create: {
     *     // ... data to create a EdgeContributor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdgeContributor we want to update
     *   }
     * })
    **/
    upsert<T extends edgeContributorUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, edgeContributorUpsertArgs<ExtArgs>>
    ): Prisma__edgeContributorClient<$Result.GetResult<Prisma.$edgeContributorPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of EdgeContributors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorCountArgs} args - Arguments to filter EdgeContributors to count.
     * @example
     * // Count the number of EdgeContributors
     * const count = await prisma.edgeContributor.count({
     *   where: {
     *     // ... the filter for the EdgeContributors we want to count
     *   }
     * })
    **/
    count<T extends edgeContributorCountArgs>(
      args?: Subset<T, edgeContributorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdgeContributorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdgeContributor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdgeContributorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EdgeContributorAggregateArgs>(args: Subset<T, EdgeContributorAggregateArgs>): Prisma.PrismaPromise<GetEdgeContributorAggregateType<T>>

    /**
     * Group by EdgeContributor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeContributorGroupByArgs} args - Group by arguments.
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
      T extends edgeContributorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: edgeContributorGroupByArgs['orderBy'] }
        : { orderBy?: edgeContributorGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, edgeContributorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdgeContributorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the edgeContributor model
   */
  readonly fields: edgeContributorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for edgeContributor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__edgeContributorClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    model<T extends edgeContributor$modelArgs<ExtArgs> = {}>(args?: Subset<T, edgeContributor$modelArgs<ExtArgs>>): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findUniqueOrThrow'> | null, null, ExtArgs>;

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
   * Fields of the edgeContributor model
   */ 
  interface edgeContributorFieldRefs {
    readonly id: FieldRef<"edgeContributor", 'Int'>
    readonly modelId: FieldRef<"edgeContributor", 'Int'>
    readonly userId: FieldRef<"edgeContributor", 'Int'>
    readonly contribution: FieldRef<"edgeContributor", 'contribution'>
  }
    

  // Custom InputTypes

  /**
   * edgeContributor findUnique
   */
  export type edgeContributorFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter, which edgeContributor to fetch.
     */
    where: edgeContributorWhereUniqueInput
  }


  /**
   * edgeContributor findUniqueOrThrow
   */
  export type edgeContributorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter, which edgeContributor to fetch.
     */
    where: edgeContributorWhereUniqueInput
  }


  /**
   * edgeContributor findFirst
   */
  export type edgeContributorFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter, which edgeContributor to fetch.
     */
    where?: edgeContributorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeContributors to fetch.
     */
    orderBy?: edgeContributorOrderByWithRelationInput | edgeContributorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeContributors.
     */
    cursor?: edgeContributorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeContributors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeContributors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeContributors.
     */
    distinct?: EdgeContributorScalarFieldEnum | EdgeContributorScalarFieldEnum[]
  }


  /**
   * edgeContributor findFirstOrThrow
   */
  export type edgeContributorFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter, which edgeContributor to fetch.
     */
    where?: edgeContributorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeContributors to fetch.
     */
    orderBy?: edgeContributorOrderByWithRelationInput | edgeContributorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeContributors.
     */
    cursor?: edgeContributorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeContributors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeContributors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeContributors.
     */
    distinct?: EdgeContributorScalarFieldEnum | EdgeContributorScalarFieldEnum[]
  }


  /**
   * edgeContributor findMany
   */
  export type edgeContributorFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter, which edgeContributors to fetch.
     */
    where?: edgeContributorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeContributors to fetch.
     */
    orderBy?: edgeContributorOrderByWithRelationInput | edgeContributorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing edgeContributors.
     */
    cursor?: edgeContributorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeContributors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeContributors.
     */
    skip?: number
    distinct?: EdgeContributorScalarFieldEnum | EdgeContributorScalarFieldEnum[]
  }


  /**
   * edgeContributor create
   */
  export type edgeContributorCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * The data needed to create a edgeContributor.
     */
    data: XOR<edgeContributorCreateInput, edgeContributorUncheckedCreateInput>
  }


  /**
   * edgeContributor createMany
   */
  export type edgeContributorCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many edgeContributors.
     */
    data: edgeContributorCreateManyInput | edgeContributorCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * edgeContributor update
   */
  export type edgeContributorUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * The data needed to update a edgeContributor.
     */
    data: XOR<edgeContributorUpdateInput, edgeContributorUncheckedUpdateInput>
    /**
     * Choose, which edgeContributor to update.
     */
    where: edgeContributorWhereUniqueInput
  }


  /**
   * edgeContributor updateMany
   */
  export type edgeContributorUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update edgeContributors.
     */
    data: XOR<edgeContributorUpdateManyMutationInput, edgeContributorUncheckedUpdateManyInput>
    /**
     * Filter which edgeContributors to update
     */
    where?: edgeContributorWhereInput
  }


  /**
   * edgeContributor upsert
   */
  export type edgeContributorUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * The filter to search for the edgeContributor to update in case it exists.
     */
    where: edgeContributorWhereUniqueInput
    /**
     * In case the edgeContributor found by the `where` argument doesn't exist, create a new edgeContributor with this data.
     */
    create: XOR<edgeContributorCreateInput, edgeContributorUncheckedCreateInput>
    /**
     * In case the edgeContributor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<edgeContributorUpdateInput, edgeContributorUncheckedUpdateInput>
  }


  /**
   * edgeContributor delete
   */
  export type edgeContributorDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
    /**
     * Filter which edgeContributor to delete.
     */
    where: edgeContributorWhereUniqueInput
  }


  /**
   * edgeContributor deleteMany
   */
  export type edgeContributorDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeContributors to delete
     */
    where?: edgeContributorWhereInput
  }


  /**
   * edgeContributor.model
   */
  export type edgeContributor$modelArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    where?: edgeModelWhereInput
  }


  /**
   * edgeContributor without action
   */
  export type edgeContributorDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeContributor
     */
    select?: edgeContributorSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeContributorInclude<ExtArgs> | null
  }



  /**
   * Model edgePhoto
   */

  export type AggregateEdgePhoto = {
    _count: EdgePhotoCountAggregateOutputType | null
    _avg: EdgePhotoAvgAggregateOutputType | null
    _sum: EdgePhotoSumAggregateOutputType | null
    _min: EdgePhotoMinAggregateOutputType | null
    _max: EdgePhotoMaxAggregateOutputType | null
  }

  export type EdgePhotoAvgAggregateOutputType = {
    id: number | null
    modelId: number | null
    photoId: number | null
  }

  export type EdgePhotoSumAggregateOutputType = {
    id: number | null
    modelId: number | null
    photoId: number | null
  }

  export type EdgePhotoMinAggregateOutputType = {
    id: number | null
    modelId: number | null
    photoId: number | null
    isMainPhoto: boolean | null
  }

  export type EdgePhotoMaxAggregateOutputType = {
    id: number | null
    modelId: number | null
    photoId: number | null
    isMainPhoto: boolean | null
  }

  export type EdgePhotoCountAggregateOutputType = {
    id: number
    modelId: number
    photoId: number
    isMainPhoto: number
    _all: number
  }


  export type EdgePhotoAvgAggregateInputType = {
    id?: true
    modelId?: true
    photoId?: true
  }

  export type EdgePhotoSumAggregateInputType = {
    id?: true
    modelId?: true
    photoId?: true
  }

  export type EdgePhotoMinAggregateInputType = {
    id?: true
    modelId?: true
    photoId?: true
    isMainPhoto?: true
  }

  export type EdgePhotoMaxAggregateInputType = {
    id?: true
    modelId?: true
    photoId?: true
    isMainPhoto?: true
  }

  export type EdgePhotoCountAggregateInputType = {
    id?: true
    modelId?: true
    photoId?: true
    isMainPhoto?: true
    _all?: true
  }

  export type EdgePhotoAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgePhoto to aggregate.
     */
    where?: edgePhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgePhotos to fetch.
     */
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: edgePhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgePhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgePhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned edgePhotos
    **/
    _count?: true | EdgePhotoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EdgePhotoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EdgePhotoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdgePhotoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdgePhotoMaxAggregateInputType
  }

  export type GetEdgePhotoAggregateType<T extends EdgePhotoAggregateArgs> = {
        [P in keyof T & keyof AggregateEdgePhoto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdgePhoto[P]>
      : GetScalarType<T[P], AggregateEdgePhoto[P]>
  }




  export type edgePhotoGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgePhotoWhereInput
    orderBy?: edgePhotoOrderByWithAggregationInput | edgePhotoOrderByWithAggregationInput[]
    by: EdgePhotoScalarFieldEnum[] | EdgePhotoScalarFieldEnum
    having?: edgePhotoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdgePhotoCountAggregateInputType | true
    _avg?: EdgePhotoAvgAggregateInputType
    _sum?: EdgePhotoSumAggregateInputType
    _min?: EdgePhotoMinAggregateInputType
    _max?: EdgePhotoMaxAggregateInputType
  }

  export type EdgePhotoGroupByOutputType = {
    id: number
    modelId: number
    photoId: number
    isMainPhoto: boolean
    _count: EdgePhotoCountAggregateOutputType | null
    _avg: EdgePhotoAvgAggregateOutputType | null
    _sum: EdgePhotoSumAggregateOutputType | null
    _min: EdgePhotoMinAggregateOutputType | null
    _max: EdgePhotoMaxAggregateOutputType | null
  }

  type GetEdgePhotoGroupByPayload<T extends edgePhotoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdgePhotoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdgePhotoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdgePhotoGroupByOutputType[P]>
            : GetScalarType<T[P], EdgePhotoGroupByOutputType[P]>
        }
      >
    >


  export type edgePhotoSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    modelId?: boolean
    photoId?: boolean
    isMainPhoto?: boolean
    elementImage?: boolean | elementImageDefaultArgs<ExtArgs>
    model?: boolean | edgeModelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["edgePhoto"]>

  export type edgePhotoSelectScalar = {
    id?: boolean
    modelId?: boolean
    photoId?: boolean
    isMainPhoto?: boolean
  }

  export type edgePhotoInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    elementImage?: boolean | elementImageDefaultArgs<ExtArgs>
    model?: boolean | edgeModelDefaultArgs<ExtArgs>
  }


  export type $edgePhotoPayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "edgePhoto"
    objects: {
      elementImage: Prisma.$elementImagePayload<ExtArgs>
      model: Prisma.$edgeModelPayload<ExtArgs>
    }
    scalars: $Extensions.GetResult<{
      id: number
      modelId: number
      photoId: number
      isMainPhoto: boolean
    }, ExtArgs["result"]["edgePhoto"]>
    composites: {}
  }


  type edgePhotoGetPayload<S extends boolean | null | undefined | edgePhotoDefaultArgs> = $Result.GetResult<Prisma.$edgePhotoPayload, S>

  type edgePhotoCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<edgePhotoFindManyArgs, 'select' | 'include'> & {
      select?: EdgePhotoCountAggregateInputType | true
    }

  export interface edgePhotoDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['edgePhoto'], meta: { name: 'edgePhoto' } }
    /**
     * Find zero or one EdgePhoto that matches the filter.
     * @param {edgePhotoFindUniqueArgs} args - Arguments to find a EdgePhoto
     * @example
     * // Get one EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends edgePhotoFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoFindUniqueArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one EdgePhoto that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {edgePhotoFindUniqueOrThrowArgs} args - Arguments to find a EdgePhoto
     * @example
     * // Get one EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends edgePhotoFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first EdgePhoto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoFindFirstArgs} args - Arguments to find a EdgePhoto
     * @example
     * // Get one EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends edgePhotoFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoFindFirstArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first EdgePhoto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoFindFirstOrThrowArgs} args - Arguments to find a EdgePhoto
     * @example
     * // Get one EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends edgePhotoFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more EdgePhotos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdgePhotos
     * const edgePhotos = await prisma.edgePhoto.findMany()
     * 
     * // Get first 10 EdgePhotos
     * const edgePhotos = await prisma.edgePhoto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edgePhotoWithIdOnly = await prisma.edgePhoto.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends edgePhotoFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a EdgePhoto.
     * @param {edgePhotoCreateArgs} args - Arguments to create a EdgePhoto.
     * @example
     * // Create one EdgePhoto
     * const EdgePhoto = await prisma.edgePhoto.create({
     *   data: {
     *     // ... data to create a EdgePhoto
     *   }
     * })
     * 
    **/
    create<T extends edgePhotoCreateArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoCreateArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many EdgePhotos.
     *     @param {edgePhotoCreateManyArgs} args - Arguments to create many EdgePhotos.
     *     @example
     *     // Create many EdgePhotos
     *     const edgePhoto = await prisma.edgePhoto.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends edgePhotoCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EdgePhoto.
     * @param {edgePhotoDeleteArgs} args - Arguments to delete one EdgePhoto.
     * @example
     * // Delete one EdgePhoto
     * const EdgePhoto = await prisma.edgePhoto.delete({
     *   where: {
     *     // ... filter to delete one EdgePhoto
     *   }
     * })
     * 
    **/
    delete<T extends edgePhotoDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoDeleteArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one EdgePhoto.
     * @param {edgePhotoUpdateArgs} args - Arguments to update one EdgePhoto.
     * @example
     * // Update one EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends edgePhotoUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoUpdateArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more EdgePhotos.
     * @param {edgePhotoDeleteManyArgs} args - Arguments to filter EdgePhotos to delete.
     * @example
     * // Delete a few EdgePhotos
     * const { count } = await prisma.edgePhoto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends edgePhotoDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgePhotoDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdgePhotos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdgePhotos
     * const edgePhoto = await prisma.edgePhoto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends edgePhotoUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EdgePhoto.
     * @param {edgePhotoUpsertArgs} args - Arguments to update or create a EdgePhoto.
     * @example
     * // Update or create a EdgePhoto
     * const edgePhoto = await prisma.edgePhoto.upsert({
     *   create: {
     *     // ... data to create a EdgePhoto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdgePhoto we want to update
     *   }
     * })
    **/
    upsert<T extends edgePhotoUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, edgePhotoUpsertArgs<ExtArgs>>
    ): Prisma__edgePhotoClient<$Result.GetResult<Prisma.$edgePhotoPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of EdgePhotos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoCountArgs} args - Arguments to filter EdgePhotos to count.
     * @example
     * // Count the number of EdgePhotos
     * const count = await prisma.edgePhoto.count({
     *   where: {
     *     // ... the filter for the EdgePhotos we want to count
     *   }
     * })
    **/
    count<T extends edgePhotoCountArgs>(
      args?: Subset<T, edgePhotoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdgePhotoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdgePhoto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdgePhotoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EdgePhotoAggregateArgs>(args: Subset<T, EdgePhotoAggregateArgs>): Prisma.PrismaPromise<GetEdgePhotoAggregateType<T>>

    /**
     * Group by EdgePhoto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgePhotoGroupByArgs} args - Group by arguments.
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
      T extends edgePhotoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: edgePhotoGroupByArgs['orderBy'] }
        : { orderBy?: edgePhotoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, edgePhotoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdgePhotoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the edgePhoto model
   */
  readonly fields: edgePhotoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for edgePhoto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__edgePhotoClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    elementImage<T extends elementImageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, elementImageDefaultArgs<ExtArgs>>): Prisma__elementImageClient<$Result.GetResult<Prisma.$elementImagePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    model<T extends edgeModelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, edgeModelDefaultArgs<ExtArgs>>): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

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
   * Fields of the edgePhoto model
   */ 
  interface edgePhotoFieldRefs {
    readonly id: FieldRef<"edgePhoto", 'Int'>
    readonly modelId: FieldRef<"edgePhoto", 'Int'>
    readonly photoId: FieldRef<"edgePhoto", 'Int'>
    readonly isMainPhoto: FieldRef<"edgePhoto", 'Boolean'>
  }
    

  // Custom InputTypes

  /**
   * edgePhoto findUnique
   */
  export type edgePhotoFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter, which edgePhoto to fetch.
     */
    where: edgePhotoWhereUniqueInput
  }


  /**
   * edgePhoto findUniqueOrThrow
   */
  export type edgePhotoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter, which edgePhoto to fetch.
     */
    where: edgePhotoWhereUniqueInput
  }


  /**
   * edgePhoto findFirst
   */
  export type edgePhotoFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter, which edgePhoto to fetch.
     */
    where?: edgePhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgePhotos to fetch.
     */
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgePhotos.
     */
    cursor?: edgePhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgePhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgePhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgePhotos.
     */
    distinct?: EdgePhotoScalarFieldEnum | EdgePhotoScalarFieldEnum[]
  }


  /**
   * edgePhoto findFirstOrThrow
   */
  export type edgePhotoFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter, which edgePhoto to fetch.
     */
    where?: edgePhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgePhotos to fetch.
     */
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgePhotos.
     */
    cursor?: edgePhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgePhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgePhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgePhotos.
     */
    distinct?: EdgePhotoScalarFieldEnum | EdgePhotoScalarFieldEnum[]
  }


  /**
   * edgePhoto findMany
   */
  export type edgePhotoFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter, which edgePhotos to fetch.
     */
    where?: edgePhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgePhotos to fetch.
     */
    orderBy?: edgePhotoOrderByWithRelationInput | edgePhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing edgePhotos.
     */
    cursor?: edgePhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgePhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgePhotos.
     */
    skip?: number
    distinct?: EdgePhotoScalarFieldEnum | EdgePhotoScalarFieldEnum[]
  }


  /**
   * edgePhoto create
   */
  export type edgePhotoCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * The data needed to create a edgePhoto.
     */
    data: XOR<edgePhotoCreateInput, edgePhotoUncheckedCreateInput>
  }


  /**
   * edgePhoto createMany
   */
  export type edgePhotoCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many edgePhotos.
     */
    data: edgePhotoCreateManyInput | edgePhotoCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * edgePhoto update
   */
  export type edgePhotoUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * The data needed to update a edgePhoto.
     */
    data: XOR<edgePhotoUpdateInput, edgePhotoUncheckedUpdateInput>
    /**
     * Choose, which edgePhoto to update.
     */
    where: edgePhotoWhereUniqueInput
  }


  /**
   * edgePhoto updateMany
   */
  export type edgePhotoUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update edgePhotos.
     */
    data: XOR<edgePhotoUpdateManyMutationInput, edgePhotoUncheckedUpdateManyInput>
    /**
     * Filter which edgePhotos to update
     */
    where?: edgePhotoWhereInput
  }


  /**
   * edgePhoto upsert
   */
  export type edgePhotoUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * The filter to search for the edgePhoto to update in case it exists.
     */
    where: edgePhotoWhereUniqueInput
    /**
     * In case the edgePhoto found by the `where` argument doesn't exist, create a new edgePhoto with this data.
     */
    create: XOR<edgePhotoCreateInput, edgePhotoUncheckedCreateInput>
    /**
     * In case the edgePhoto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<edgePhotoUpdateInput, edgePhotoUncheckedUpdateInput>
  }


  /**
   * edgePhoto delete
   */
  export type edgePhotoDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
    /**
     * Filter which edgePhoto to delete.
     */
    where: edgePhotoWhereUniqueInput
  }


  /**
   * edgePhoto deleteMany
   */
  export type edgePhotoDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgePhotos to delete
     */
    where?: edgePhotoWhereInput
  }


  /**
   * edgePhoto without action
   */
  export type edgePhotoDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgePhoto
     */
    select?: edgePhotoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgePhotoInclude<ExtArgs> | null
  }



  /**
   * Model edgeValue
   */

  export type AggregateEdgeValue = {
    _count: EdgeValueCountAggregateOutputType | null
    _avg: EdgeValueAvgAggregateOutputType | null
    _sum: EdgeValueSumAggregateOutputType | null
    _min: EdgeValueMinAggregateOutputType | null
    _max: EdgeValueMaxAggregateOutputType | null
  }

  export type EdgeValueAvgAggregateOutputType = {
    id: number | null
    order: number | null
    modelId: number | null
  }

  export type EdgeValueSumAggregateOutputType = {
    id: number | null
    order: number | null
    modelId: number | null
  }

  export type EdgeValueMinAggregateOutputType = {
    id: number | null
    order: number | null
    renderName: string | null
    optionName: string | null
    optionValue: string | null
    modelId: number | null
  }

  export type EdgeValueMaxAggregateOutputType = {
    id: number | null
    order: number | null
    renderName: string | null
    optionName: string | null
    optionValue: string | null
    modelId: number | null
  }

  export type EdgeValueCountAggregateOutputType = {
    id: number
    order: number
    renderName: number
    optionName: number
    optionValue: number
    modelId: number
    _all: number
  }


  export type EdgeValueAvgAggregateInputType = {
    id?: true
    order?: true
    modelId?: true
  }

  export type EdgeValueSumAggregateInputType = {
    id?: true
    order?: true
    modelId?: true
  }

  export type EdgeValueMinAggregateInputType = {
    id?: true
    order?: true
    renderName?: true
    optionName?: true
    optionValue?: true
    modelId?: true
  }

  export type EdgeValueMaxAggregateInputType = {
    id?: true
    order?: true
    renderName?: true
    optionName?: true
    optionValue?: true
    modelId?: true
  }

  export type EdgeValueCountAggregateInputType = {
    id?: true
    order?: true
    renderName?: true
    optionName?: true
    optionValue?: true
    modelId?: true
    _all?: true
  }

  export type EdgeValueAggregateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeValue to aggregate.
     */
    where?: edgeValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeValues to fetch.
     */
    orderBy?: edgeValueOrderByWithRelationInput | edgeValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: edgeValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned edgeValues
    **/
    _count?: true | EdgeValueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EdgeValueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EdgeValueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EdgeValueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EdgeValueMaxAggregateInputType
  }

  export type GetEdgeValueAggregateType<T extends EdgeValueAggregateArgs> = {
        [P in keyof T & keyof AggregateEdgeValue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEdgeValue[P]>
      : GetScalarType<T[P], AggregateEdgeValue[P]>
  }




  export type edgeValueGroupByArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    where?: edgeValueWhereInput
    orderBy?: edgeValueOrderByWithAggregationInput | edgeValueOrderByWithAggregationInput[]
    by: EdgeValueScalarFieldEnum[] | EdgeValueScalarFieldEnum
    having?: edgeValueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EdgeValueCountAggregateInputType | true
    _avg?: EdgeValueAvgAggregateInputType
    _sum?: EdgeValueSumAggregateInputType
    _min?: EdgeValueMinAggregateInputType
    _max?: EdgeValueMaxAggregateInputType
  }

  export type EdgeValueGroupByOutputType = {
    id: number
    order: number
    renderName: string
    optionName: string | null
    optionValue: string | null
    modelId: number | null
    _count: EdgeValueCountAggregateOutputType | null
    _avg: EdgeValueAvgAggregateOutputType | null
    _sum: EdgeValueSumAggregateOutputType | null
    _min: EdgeValueMinAggregateOutputType | null
    _max: EdgeValueMaxAggregateOutputType | null
  }

  type GetEdgeValueGroupByPayload<T extends edgeValueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EdgeValueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EdgeValueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EdgeValueGroupByOutputType[P]>
            : GetScalarType<T[P], EdgeValueGroupByOutputType[P]>
        }
      >
    >


  export type edgeValueSelect<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    order?: boolean
    renderName?: boolean
    optionName?: boolean
    optionValue?: boolean
    modelId?: boolean
    model?: boolean | edgeValue$modelArgs<ExtArgs>
  }, ExtArgs["result"]["edgeValue"]>

  export type edgeValueSelectScalar = {
    id?: boolean
    order?: boolean
    renderName?: boolean
    optionName?: boolean
    optionValue?: boolean
    modelId?: boolean
  }

  export type edgeValueInclude<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    model?: boolean | edgeValue$modelArgs<ExtArgs>
  }


  export type $edgeValuePayload<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    name: "edgeValue"
    objects: {
      model: Prisma.$edgeModelPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetResult<{
      id: number
      order: number
      renderName: string
      optionName: string | null
      optionValue: string | null
      modelId: number | null
    }, ExtArgs["result"]["edgeValue"]>
    composites: {}
  }


  type edgeValueGetPayload<S extends boolean | null | undefined | edgeValueDefaultArgs> = $Result.GetResult<Prisma.$edgeValuePayload, S>

  type edgeValueCountArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = 
    Omit<edgeValueFindManyArgs, 'select' | 'include'> & {
      select?: EdgeValueCountAggregateInputType | true
    }

  export interface edgeValueDelegate<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['edgeValue'], meta: { name: 'edgeValue' } }
    /**
     * Find zero or one EdgeValue that matches the filter.
     * @param {edgeValueFindUniqueArgs} args - Arguments to find a EdgeValue
     * @example
     * // Get one EdgeValue
     * const edgeValue = await prisma.edgeValue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends edgeValueFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueFindUniqueArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one EdgeValue that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {edgeValueFindUniqueOrThrowArgs} args - Arguments to find a EdgeValue
     * @example
     * // Get one EdgeValue
     * const edgeValue = await prisma.edgeValue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends edgeValueFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first EdgeValue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueFindFirstArgs} args - Arguments to find a EdgeValue
     * @example
     * // Get one EdgeValue
     * const edgeValue = await prisma.edgeValue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends edgeValueFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueFindFirstArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first EdgeValue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueFindFirstOrThrowArgs} args - Arguments to find a EdgeValue
     * @example
     * // Get one EdgeValue
     * const edgeValue = await prisma.edgeValue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends edgeValueFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more EdgeValues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EdgeValues
     * const edgeValues = await prisma.edgeValue.findMany()
     * 
     * // Get first 10 EdgeValues
     * const edgeValues = await prisma.edgeValue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const edgeValueWithIdOnly = await prisma.edgeValue.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends edgeValueFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a EdgeValue.
     * @param {edgeValueCreateArgs} args - Arguments to create a EdgeValue.
     * @example
     * // Create one EdgeValue
     * const EdgeValue = await prisma.edgeValue.create({
     *   data: {
     *     // ... data to create a EdgeValue
     *   }
     * })
     * 
    **/
    create<T extends edgeValueCreateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueCreateArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many EdgeValues.
     *     @param {edgeValueCreateManyArgs} args - Arguments to create many EdgeValues.
     *     @example
     *     // Create many EdgeValues
     *     const edgeValue = await prisma.edgeValue.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends edgeValueCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a EdgeValue.
     * @param {edgeValueDeleteArgs} args - Arguments to delete one EdgeValue.
     * @example
     * // Delete one EdgeValue
     * const EdgeValue = await prisma.edgeValue.delete({
     *   where: {
     *     // ... filter to delete one EdgeValue
     *   }
     * })
     * 
    **/
    delete<T extends edgeValueDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueDeleteArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one EdgeValue.
     * @param {edgeValueUpdateArgs} args - Arguments to update one EdgeValue.
     * @example
     * // Update one EdgeValue
     * const edgeValue = await prisma.edgeValue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends edgeValueUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueUpdateArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more EdgeValues.
     * @param {edgeValueDeleteManyArgs} args - Arguments to filter EdgeValues to delete.
     * @example
     * // Delete a few EdgeValues
     * const { count } = await prisma.edgeValue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends edgeValueDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, edgeValueDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EdgeValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EdgeValues
     * const edgeValue = await prisma.edgeValue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends edgeValueUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EdgeValue.
     * @param {edgeValueUpsertArgs} args - Arguments to update or create a EdgeValue.
     * @example
     * // Update or create a EdgeValue
     * const edgeValue = await prisma.edgeValue.upsert({
     *   create: {
     *     // ... data to create a EdgeValue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EdgeValue we want to update
     *   }
     * })
    **/
    upsert<T extends edgeValueUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, edgeValueUpsertArgs<ExtArgs>>
    ): Prisma__edgeValueClient<$Result.GetResult<Prisma.$edgeValuePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of EdgeValues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueCountArgs} args - Arguments to filter EdgeValues to count.
     * @example
     * // Count the number of EdgeValues
     * const count = await prisma.edgeValue.count({
     *   where: {
     *     // ... the filter for the EdgeValues we want to count
     *   }
     * })
    **/
    count<T extends edgeValueCountArgs>(
      args?: Subset<T, edgeValueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EdgeValueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EdgeValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EdgeValueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EdgeValueAggregateArgs>(args: Subset<T, EdgeValueAggregateArgs>): Prisma.PrismaPromise<GetEdgeValueAggregateType<T>>

    /**
     * Group by EdgeValue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {edgeValueGroupByArgs} args - Group by arguments.
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
      T extends edgeValueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: edgeValueGroupByArgs['orderBy'] }
        : { orderBy?: edgeValueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, edgeValueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEdgeValueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the edgeValue model
   */
  readonly fields: edgeValueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for edgeValue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__edgeValueClient<T, Null = never, ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    model<T extends edgeValue$modelArgs<ExtArgs> = {}>(args?: Subset<T, edgeValue$modelArgs<ExtArgs>>): Prisma__edgeModelClient<$Result.GetResult<Prisma.$edgeModelPayload<ExtArgs>, T, 'findUniqueOrThrow'> | null, null, ExtArgs>;

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
   * Fields of the edgeValue model
   */ 
  interface edgeValueFieldRefs {
    readonly id: FieldRef<"edgeValue", 'Int'>
    readonly order: FieldRef<"edgeValue", 'Float'>
    readonly renderName: FieldRef<"edgeValue", 'String'>
    readonly optionName: FieldRef<"edgeValue", 'String'>
    readonly optionValue: FieldRef<"edgeValue", 'String'>
    readonly modelId: FieldRef<"edgeValue", 'Int'>
  }
    

  // Custom InputTypes

  /**
   * edgeValue findUnique
   */
  export type edgeValueFindUniqueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter, which edgeValue to fetch.
     */
    where: edgeValueWhereUniqueInput
  }


  /**
   * edgeValue findUniqueOrThrow
   */
  export type edgeValueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter, which edgeValue to fetch.
     */
    where: edgeValueWhereUniqueInput
  }


  /**
   * edgeValue findFirst
   */
  export type edgeValueFindFirstArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter, which edgeValue to fetch.
     */
    where?: edgeValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeValues to fetch.
     */
    orderBy?: edgeValueOrderByWithRelationInput | edgeValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeValues.
     */
    cursor?: edgeValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeValues.
     */
    distinct?: EdgeValueScalarFieldEnum | EdgeValueScalarFieldEnum[]
  }


  /**
   * edgeValue findFirstOrThrow
   */
  export type edgeValueFindFirstOrThrowArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter, which edgeValue to fetch.
     */
    where?: edgeValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeValues to fetch.
     */
    orderBy?: edgeValueOrderByWithRelationInput | edgeValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for edgeValues.
     */
    cursor?: edgeValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeValues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of edgeValues.
     */
    distinct?: EdgeValueScalarFieldEnum | EdgeValueScalarFieldEnum[]
  }


  /**
   * edgeValue findMany
   */
  export type edgeValueFindManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter, which edgeValues to fetch.
     */
    where?: edgeValueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of edgeValues to fetch.
     */
    orderBy?: edgeValueOrderByWithRelationInput | edgeValueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing edgeValues.
     */
    cursor?: edgeValueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` edgeValues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` edgeValues.
     */
    skip?: number
    distinct?: EdgeValueScalarFieldEnum | EdgeValueScalarFieldEnum[]
  }


  /**
   * edgeValue create
   */
  export type edgeValueCreateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * The data needed to create a edgeValue.
     */
    data: XOR<edgeValueCreateInput, edgeValueUncheckedCreateInput>
  }


  /**
   * edgeValue createMany
   */
  export type edgeValueCreateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many edgeValues.
     */
    data: edgeValueCreateManyInput | edgeValueCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * edgeValue update
   */
  export type edgeValueUpdateArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * The data needed to update a edgeValue.
     */
    data: XOR<edgeValueUpdateInput, edgeValueUncheckedUpdateInput>
    /**
     * Choose, which edgeValue to update.
     */
    where: edgeValueWhereUniqueInput
  }


  /**
   * edgeValue updateMany
   */
  export type edgeValueUpdateManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * The data used to update edgeValues.
     */
    data: XOR<edgeValueUpdateManyMutationInput, edgeValueUncheckedUpdateManyInput>
    /**
     * Filter which edgeValues to update
     */
    where?: edgeValueWhereInput
  }


  /**
   * edgeValue upsert
   */
  export type edgeValueUpsertArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * The filter to search for the edgeValue to update in case it exists.
     */
    where: edgeValueWhereUniqueInput
    /**
     * In case the edgeValue found by the `where` argument doesn't exist, create a new edgeValue with this data.
     */
    create: XOR<edgeValueCreateInput, edgeValueUncheckedCreateInput>
    /**
     * In case the edgeValue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<edgeValueUpdateInput, edgeValueUncheckedUpdateInput>
  }


  /**
   * edgeValue delete
   */
  export type edgeValueDeleteArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
    /**
     * Filter which edgeValue to delete.
     */
    where: edgeValueWhereUniqueInput
  }


  /**
   * edgeValue deleteMany
   */
  export type edgeValueDeleteManyArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Filter which edgeValues to delete
     */
    where?: edgeValueWhereInput
  }


  /**
   * edgeValue.model
   */
  export type edgeValue$modelArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeModel
     */
    select?: edgeModelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeModelInclude<ExtArgs> | null
    where?: edgeModelWhereInput
  }


  /**
   * edgeValue without action
   */
  export type edgeValueDefaultArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the edgeValue
     */
    select?: edgeValueSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: edgeValueInclude<ExtArgs> | null
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


  export const OptionIntervalScalarFieldEnum: {
    id: 'id',
    valueId: 'valueId',
    issueNumberStart: 'issueNumberStart',
    issueNumberEnd: 'issueNumberEnd',
    username: 'username'
  };

  export type OptionIntervalScalarFieldEnum = (typeof OptionIntervalScalarFieldEnum)[keyof typeof OptionIntervalScalarFieldEnum]


  export const EdgeModelOldScalarFieldEnum: {
    id: 'id',
    country: 'country',
    magazine: 'magazine',
    order: 'order',
    functionName: 'functionName',
    optionName: 'optionName'
  };

  export type EdgeModelOldScalarFieldEnum = (typeof EdgeModelOldScalarFieldEnum)[keyof typeof EdgeModelOldScalarFieldEnum]


  export const OptionValueScalarFieldEnum: {
    id: 'id',
    optionId: 'optionId',
    value: 'value'
  };

  export type OptionValueScalarFieldEnum = (typeof OptionValueScalarFieldEnum)[keyof typeof OptionValueScalarFieldEnum]


  export const MyfontsImageScalarFieldEnum: {
    id: 'id',
    font: 'font',
    color: 'color',
    backgroundColor: 'backgroundColor',
    width: 'width',
    text: 'text',
    precision: 'precision'
  };

  export type MyfontsImageScalarFieldEnum = (typeof MyfontsImageScalarFieldEnum)[keyof typeof MyfontsImageScalarFieldEnum]


  export const ElementImageScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    hash: 'hash',
    createdAt: 'createdAt',
    fileName: 'fileName'
  };

  export type ElementImageScalarFieldEnum = (typeof ElementImageScalarFieldEnum)[keyof typeof ElementImageScalarFieldEnum]


  export const EdgeModelScalarFieldEnum: {
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

  export type EdgeModelScalarFieldEnum = (typeof EdgeModelScalarFieldEnum)[keyof typeof EdgeModelScalarFieldEnum]


  export const EdgeContributorScalarFieldEnum: {
    id: 'id',
    modelId: 'modelId',
    userId: 'userId',
    contribution: 'contribution'
  };

  export type EdgeContributorScalarFieldEnum = (typeof EdgeContributorScalarFieldEnum)[keyof typeof EdgeContributorScalarFieldEnum]


  export const EdgePhotoScalarFieldEnum: {
    id: 'id',
    modelId: 'modelId',
    photoId: 'photoId',
    isMainPhoto: 'isMainPhoto'
  };

  export type EdgePhotoScalarFieldEnum = (typeof EdgePhotoScalarFieldEnum)[keyof typeof EdgePhotoScalarFieldEnum]


  export const EdgeValueScalarFieldEnum: {
    id: 'id',
    order: 'order',
    renderName: 'renderName',
    optionName: 'optionName',
    optionValue: 'optionValue',
    modelId: 'modelId'
  };

  export type EdgeValueScalarFieldEnum = (typeof EdgeValueScalarFieldEnum)[keyof typeof EdgeValueScalarFieldEnum]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'contribution'
   */
  export type EnumcontributionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'contribution'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type optionIntervalWhereInput = {
    AND?: optionIntervalWhereInput | optionIntervalWhereInput[]
    OR?: optionIntervalWhereInput[]
    NOT?: optionIntervalWhereInput | optionIntervalWhereInput[]
    id?: IntFilter<"optionInterval"> | number
    valueId?: IntFilter<"optionInterval"> | number
    issueNumberStart?: StringFilter<"optionInterval"> | string
    issueNumberEnd?: StringFilter<"optionInterval"> | string
    username?: StringFilter<"optionInterval"> | string
  }

  export type optionIntervalOrderByWithRelationInput = {
    id?: SortOrder
    valueId?: SortOrder
    issueNumberStart?: SortOrder
    issueNumberEnd?: SortOrder
    username?: SortOrder
  }

  export type optionIntervalWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: optionIntervalWhereInput | optionIntervalWhereInput[]
    OR?: optionIntervalWhereInput[]
    NOT?: optionIntervalWhereInput | optionIntervalWhereInput[]
    valueId?: IntFilter<"optionInterval"> | number
    issueNumberStart?: StringFilter<"optionInterval"> | string
    issueNumberEnd?: StringFilter<"optionInterval"> | string
    username?: StringFilter<"optionInterval"> | string
  }, "id">

  export type optionIntervalOrderByWithAggregationInput = {
    id?: SortOrder
    valueId?: SortOrder
    issueNumberStart?: SortOrder
    issueNumberEnd?: SortOrder
    username?: SortOrder
    _count?: optionIntervalCountOrderByAggregateInput
    _avg?: optionIntervalAvgOrderByAggregateInput
    _max?: optionIntervalMaxOrderByAggregateInput
    _min?: optionIntervalMinOrderByAggregateInput
    _sum?: optionIntervalSumOrderByAggregateInput
  }

  export type optionIntervalScalarWhereWithAggregatesInput = {
    AND?: optionIntervalScalarWhereWithAggregatesInput | optionIntervalScalarWhereWithAggregatesInput[]
    OR?: optionIntervalScalarWhereWithAggregatesInput[]
    NOT?: optionIntervalScalarWhereWithAggregatesInput | optionIntervalScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"optionInterval"> | number
    valueId?: IntWithAggregatesFilter<"optionInterval"> | number
    issueNumberStart?: StringWithAggregatesFilter<"optionInterval"> | string
    issueNumberEnd?: StringWithAggregatesFilter<"optionInterval"> | string
    username?: StringWithAggregatesFilter<"optionInterval"> | string
  }

  export type edgeModelOldWhereInput = {
    AND?: edgeModelOldWhereInput | edgeModelOldWhereInput[]
    OR?: edgeModelOldWhereInput[]
    NOT?: edgeModelOldWhereInput | edgeModelOldWhereInput[]
    id?: IntFilter<"edgeModelOld"> | number
    country?: StringFilter<"edgeModelOld"> | string
    magazine?: StringFilter<"edgeModelOld"> | string
    order?: IntFilter<"edgeModelOld"> | number
    functionName?: StringFilter<"edgeModelOld"> | string
    optionName?: StringNullableFilter<"edgeModelOld"> | string | null
  }

  export type edgeModelOldOrderByWithRelationInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    order?: SortOrder
    functionName?: SortOrder
    optionName?: SortOrderInput | SortOrder
  }

  export type edgeModelOldWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: edgeModelOldWhereInput | edgeModelOldWhereInput[]
    OR?: edgeModelOldWhereInput[]
    NOT?: edgeModelOldWhereInput | edgeModelOldWhereInput[]
    country?: StringFilter<"edgeModelOld"> | string
    magazine?: StringFilter<"edgeModelOld"> | string
    order?: IntFilter<"edgeModelOld"> | number
    functionName?: StringFilter<"edgeModelOld"> | string
    optionName?: StringNullableFilter<"edgeModelOld"> | string | null
  }, "id">

  export type edgeModelOldOrderByWithAggregationInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    order?: SortOrder
    functionName?: SortOrder
    optionName?: SortOrderInput | SortOrder
    _count?: edgeModelOldCountOrderByAggregateInput
    _avg?: edgeModelOldAvgOrderByAggregateInput
    _max?: edgeModelOldMaxOrderByAggregateInput
    _min?: edgeModelOldMinOrderByAggregateInput
    _sum?: edgeModelOldSumOrderByAggregateInput
  }

  export type edgeModelOldScalarWhereWithAggregatesInput = {
    AND?: edgeModelOldScalarWhereWithAggregatesInput | edgeModelOldScalarWhereWithAggregatesInput[]
    OR?: edgeModelOldScalarWhereWithAggregatesInput[]
    NOT?: edgeModelOldScalarWhereWithAggregatesInput | edgeModelOldScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"edgeModelOld"> | number
    country?: StringWithAggregatesFilter<"edgeModelOld"> | string
    magazine?: StringWithAggregatesFilter<"edgeModelOld"> | string
    order?: IntWithAggregatesFilter<"edgeModelOld"> | number
    functionName?: StringWithAggregatesFilter<"edgeModelOld"> | string
    optionName?: StringNullableWithAggregatesFilter<"edgeModelOld"> | string | null
  }

  export type optionValueWhereInput = {
    AND?: optionValueWhereInput | optionValueWhereInput[]
    OR?: optionValueWhereInput[]
    NOT?: optionValueWhereInput | optionValueWhereInput[]
    id?: IntFilter<"optionValue"> | number
    optionId?: IntNullableFilter<"optionValue"> | number | null
    value?: StringNullableFilter<"optionValue"> | string | null
  }

  export type optionValueOrderByWithRelationInput = {
    id?: SortOrder
    optionId?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
  }

  export type optionValueWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: optionValueWhereInput | optionValueWhereInput[]
    OR?: optionValueWhereInput[]
    NOT?: optionValueWhereInput | optionValueWhereInput[]
    optionId?: IntNullableFilter<"optionValue"> | number | null
    value?: StringNullableFilter<"optionValue"> | string | null
  }, "id">

  export type optionValueOrderByWithAggregationInput = {
    id?: SortOrder
    optionId?: SortOrderInput | SortOrder
    value?: SortOrderInput | SortOrder
    _count?: optionValueCountOrderByAggregateInput
    _avg?: optionValueAvgOrderByAggregateInput
    _max?: optionValueMaxOrderByAggregateInput
    _min?: optionValueMinOrderByAggregateInput
    _sum?: optionValueSumOrderByAggregateInput
  }

  export type optionValueScalarWhereWithAggregatesInput = {
    AND?: optionValueScalarWhereWithAggregatesInput | optionValueScalarWhereWithAggregatesInput[]
    OR?: optionValueScalarWhereWithAggregatesInput[]
    NOT?: optionValueScalarWhereWithAggregatesInput | optionValueScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"optionValue"> | number
    optionId?: IntNullableWithAggregatesFilter<"optionValue"> | number | null
    value?: StringNullableWithAggregatesFilter<"optionValue"> | string | null
  }

  export type myfontsImageWhereInput = {
    AND?: myfontsImageWhereInput | myfontsImageWhereInput[]
    OR?: myfontsImageWhereInput[]
    NOT?: myfontsImageWhereInput | myfontsImageWhereInput[]
    id?: IntFilter<"myfontsImage"> | number
    font?: StringNullableFilter<"myfontsImage"> | string | null
    color?: StringNullableFilter<"myfontsImage"> | string | null
    backgroundColor?: StringNullableFilter<"myfontsImage"> | string | null
    width?: StringNullableFilter<"myfontsImage"> | string | null
    text?: StringNullableFilter<"myfontsImage"> | string | null
    precision?: StringNullableFilter<"myfontsImage"> | string | null
  }

  export type myfontsImageOrderByWithRelationInput = {
    id?: SortOrder
    font?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    backgroundColor?: SortOrderInput | SortOrder
    width?: SortOrderInput | SortOrder
    text?: SortOrderInput | SortOrder
    precision?: SortOrderInput | SortOrder
  }

  export type myfontsImageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: myfontsImageWhereInput | myfontsImageWhereInput[]
    OR?: myfontsImageWhereInput[]
    NOT?: myfontsImageWhereInput | myfontsImageWhereInput[]
    font?: StringNullableFilter<"myfontsImage"> | string | null
    color?: StringNullableFilter<"myfontsImage"> | string | null
    backgroundColor?: StringNullableFilter<"myfontsImage"> | string | null
    width?: StringNullableFilter<"myfontsImage"> | string | null
    text?: StringNullableFilter<"myfontsImage"> | string | null
    precision?: StringNullableFilter<"myfontsImage"> | string | null
  }, "id">

  export type myfontsImageOrderByWithAggregationInput = {
    id?: SortOrder
    font?: SortOrderInput | SortOrder
    color?: SortOrderInput | SortOrder
    backgroundColor?: SortOrderInput | SortOrder
    width?: SortOrderInput | SortOrder
    text?: SortOrderInput | SortOrder
    precision?: SortOrderInput | SortOrder
    _count?: myfontsImageCountOrderByAggregateInput
    _avg?: myfontsImageAvgOrderByAggregateInput
    _max?: myfontsImageMaxOrderByAggregateInput
    _min?: myfontsImageMinOrderByAggregateInput
    _sum?: myfontsImageSumOrderByAggregateInput
  }

  export type myfontsImageScalarWhereWithAggregatesInput = {
    AND?: myfontsImageScalarWhereWithAggregatesInput | myfontsImageScalarWhereWithAggregatesInput[]
    OR?: myfontsImageScalarWhereWithAggregatesInput[]
    NOT?: myfontsImageScalarWhereWithAggregatesInput | myfontsImageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"myfontsImage"> | number
    font?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
    color?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
    backgroundColor?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
    width?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
    text?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
    precision?: StringNullableWithAggregatesFilter<"myfontsImage"> | string | null
  }

  export type elementImageWhereInput = {
    AND?: elementImageWhereInput | elementImageWhereInput[]
    OR?: elementImageWhereInput[]
    NOT?: elementImageWhereInput | elementImageWhereInput[]
    id?: IntFilter<"elementImage"> | number
    userId?: IntNullableFilter<"elementImage"> | number | null
    hash?: StringNullableFilter<"elementImage"> | string | null
    createdAt?: DateTimeNullableFilter<"elementImage"> | Date | string | null
    fileName?: StringFilter<"elementImage"> | string
    tranches_en_cours_modeles_images?: EdgePhotoListRelationFilter
  }

  export type elementImageOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    hash?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    fileName?: SortOrder
    tranches_en_cours_modeles_images?: edgePhotoOrderByRelationAggregateInput
  }

  export type elementImageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    hash?: string
    AND?: elementImageWhereInput | elementImageWhereInput[]
    OR?: elementImageWhereInput[]
    NOT?: elementImageWhereInput | elementImageWhereInput[]
    userId?: IntNullableFilter<"elementImage"> | number | null
    createdAt?: DateTimeNullableFilter<"elementImage"> | Date | string | null
    fileName?: StringFilter<"elementImage"> | string
    tranches_en_cours_modeles_images?: EdgePhotoListRelationFilter
  }, "id" | "hash">

  export type elementImageOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrderInput | SortOrder
    hash?: SortOrderInput | SortOrder
    createdAt?: SortOrderInput | SortOrder
    fileName?: SortOrder
    _count?: elementImageCountOrderByAggregateInput
    _avg?: elementImageAvgOrderByAggregateInput
    _max?: elementImageMaxOrderByAggregateInput
    _min?: elementImageMinOrderByAggregateInput
    _sum?: elementImageSumOrderByAggregateInput
  }

  export type elementImageScalarWhereWithAggregatesInput = {
    AND?: elementImageScalarWhereWithAggregatesInput | elementImageScalarWhereWithAggregatesInput[]
    OR?: elementImageScalarWhereWithAggregatesInput[]
    NOT?: elementImageScalarWhereWithAggregatesInput | elementImageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"elementImage"> | number
    userId?: IntNullableWithAggregatesFilter<"elementImage"> | number | null
    hash?: StringNullableWithAggregatesFilter<"elementImage"> | string | null
    createdAt?: DateTimeNullableWithAggregatesFilter<"elementImage"> | Date | string | null
    fileName?: StringWithAggregatesFilter<"elementImage"> | string
  }

  export type edgeModelWhereInput = {
    AND?: edgeModelWhereInput | edgeModelWhereInput[]
    OR?: edgeModelWhereInput[]
    NOT?: edgeModelWhereInput | edgeModelWhereInput[]
    id?: IntFilter<"edgeModel"> | number
    country?: StringFilter<"edgeModel"> | string
    magazine?: StringFilter<"edgeModel"> | string
    issuenumber?: StringFilter<"edgeModel"> | string
    username?: StringNullableFilter<"edgeModel"> | string | null
    mainPhotoName?: StringNullableFilter<"edgeModel"> | string | null
    photographs?: StringNullableFilter<"edgeModel"> | string | null
    creators?: StringNullableFilter<"edgeModel"> | string | null
    isActive?: BoolFilter<"edgeModel"> | boolean
    contributors?: EdgeContributorListRelationFilter
    photos?: EdgePhotoListRelationFilter
    values?: EdgeValueListRelationFilter
  }

  export type edgeModelOrderByWithRelationInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    issuenumber?: SortOrder
    username?: SortOrderInput | SortOrder
    mainPhotoName?: SortOrderInput | SortOrder
    photographs?: SortOrderInput | SortOrder
    creators?: SortOrderInput | SortOrder
    isActive?: SortOrder
    contributors?: edgeContributorOrderByRelationAggregateInput
    photos?: edgePhotoOrderByRelationAggregateInput
    values?: edgeValueOrderByRelationAggregateInput
  }

  export type edgeModelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    country_magazine_issuenumber_username?: edgeModelCountryMagazineIssuenumberUsernameCompoundUniqueInput
    AND?: edgeModelWhereInput | edgeModelWhereInput[]
    OR?: edgeModelWhereInput[]
    NOT?: edgeModelWhereInput | edgeModelWhereInput[]
    country?: StringFilter<"edgeModel"> | string
    magazine?: StringFilter<"edgeModel"> | string
    issuenumber?: StringFilter<"edgeModel"> | string
    username?: StringNullableFilter<"edgeModel"> | string | null
    mainPhotoName?: StringNullableFilter<"edgeModel"> | string | null
    photographs?: StringNullableFilter<"edgeModel"> | string | null
    creators?: StringNullableFilter<"edgeModel"> | string | null
    isActive?: BoolFilter<"edgeModel"> | boolean
    contributors?: EdgeContributorListRelationFilter
    photos?: EdgePhotoListRelationFilter
    values?: EdgeValueListRelationFilter
  }, "id" | "country_magazine_issuenumber_username">

  export type edgeModelOrderByWithAggregationInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    issuenumber?: SortOrder
    username?: SortOrderInput | SortOrder
    mainPhotoName?: SortOrderInput | SortOrder
    photographs?: SortOrderInput | SortOrder
    creators?: SortOrderInput | SortOrder
    isActive?: SortOrder
    _count?: edgeModelCountOrderByAggregateInput
    _avg?: edgeModelAvgOrderByAggregateInput
    _max?: edgeModelMaxOrderByAggregateInput
    _min?: edgeModelMinOrderByAggregateInput
    _sum?: edgeModelSumOrderByAggregateInput
  }

  export type edgeModelScalarWhereWithAggregatesInput = {
    AND?: edgeModelScalarWhereWithAggregatesInput | edgeModelScalarWhereWithAggregatesInput[]
    OR?: edgeModelScalarWhereWithAggregatesInput[]
    NOT?: edgeModelScalarWhereWithAggregatesInput | edgeModelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"edgeModel"> | number
    country?: StringWithAggregatesFilter<"edgeModel"> | string
    magazine?: StringWithAggregatesFilter<"edgeModel"> | string
    issuenumber?: StringWithAggregatesFilter<"edgeModel"> | string
    username?: StringNullableWithAggregatesFilter<"edgeModel"> | string | null
    mainPhotoName?: StringNullableWithAggregatesFilter<"edgeModel"> | string | null
    photographs?: StringNullableWithAggregatesFilter<"edgeModel"> | string | null
    creators?: StringNullableWithAggregatesFilter<"edgeModel"> | string | null
    isActive?: BoolWithAggregatesFilter<"edgeModel"> | boolean
  }

  export type edgeContributorWhereInput = {
    AND?: edgeContributorWhereInput | edgeContributorWhereInput[]
    OR?: edgeContributorWhereInput[]
    NOT?: edgeContributorWhereInput | edgeContributorWhereInput[]
    id?: IntFilter<"edgeContributor"> | number
    modelId?: IntNullableFilter<"edgeContributor"> | number | null
    userId?: IntFilter<"edgeContributor"> | number
    contribution?: EnumcontributionFilter<"edgeContributor"> | $Enums.contribution
    model?: XOR<EdgeModelNullableRelationFilter, edgeModelWhereInput> | null
  }

  export type edgeContributorOrderByWithRelationInput = {
    id?: SortOrder
    modelId?: SortOrderInput | SortOrder
    userId?: SortOrder
    contribution?: SortOrder
    model?: edgeModelOrderByWithRelationInput
  }

  export type edgeContributorWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    modelId_userId_contribution?: edgeContributorModelIdUserIdContributionCompoundUniqueInput
    AND?: edgeContributorWhereInput | edgeContributorWhereInput[]
    OR?: edgeContributorWhereInput[]
    NOT?: edgeContributorWhereInput | edgeContributorWhereInput[]
    modelId?: IntNullableFilter<"edgeContributor"> | number | null
    userId?: IntFilter<"edgeContributor"> | number
    contribution?: EnumcontributionFilter<"edgeContributor"> | $Enums.contribution
    model?: XOR<EdgeModelNullableRelationFilter, edgeModelWhereInput> | null
  }, "id" | "modelId_userId_contribution">

  export type edgeContributorOrderByWithAggregationInput = {
    id?: SortOrder
    modelId?: SortOrderInput | SortOrder
    userId?: SortOrder
    contribution?: SortOrder
    _count?: edgeContributorCountOrderByAggregateInput
    _avg?: edgeContributorAvgOrderByAggregateInput
    _max?: edgeContributorMaxOrderByAggregateInput
    _min?: edgeContributorMinOrderByAggregateInput
    _sum?: edgeContributorSumOrderByAggregateInput
  }

  export type edgeContributorScalarWhereWithAggregatesInput = {
    AND?: edgeContributorScalarWhereWithAggregatesInput | edgeContributorScalarWhereWithAggregatesInput[]
    OR?: edgeContributorScalarWhereWithAggregatesInput[]
    NOT?: edgeContributorScalarWhereWithAggregatesInput | edgeContributorScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"edgeContributor"> | number
    modelId?: IntNullableWithAggregatesFilter<"edgeContributor"> | number | null
    userId?: IntWithAggregatesFilter<"edgeContributor"> | number
    contribution?: EnumcontributionWithAggregatesFilter<"edgeContributor"> | $Enums.contribution
  }

  export type edgePhotoWhereInput = {
    AND?: edgePhotoWhereInput | edgePhotoWhereInput[]
    OR?: edgePhotoWhereInput[]
    NOT?: edgePhotoWhereInput | edgePhotoWhereInput[]
    id?: IntFilter<"edgePhoto"> | number
    modelId?: IntFilter<"edgePhoto"> | number
    photoId?: IntFilter<"edgePhoto"> | number
    isMainPhoto?: BoolFilter<"edgePhoto"> | boolean
    elementImage?: XOR<ElementImageRelationFilter, elementImageWhereInput>
    model?: XOR<EdgeModelRelationFilter, edgeModelWhereInput>
  }

  export type edgePhotoOrderByWithRelationInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
    isMainPhoto?: SortOrder
    elementImage?: elementImageOrderByWithRelationInput
    model?: edgeModelOrderByWithRelationInput
  }

  export type edgePhotoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: edgePhotoWhereInput | edgePhotoWhereInput[]
    OR?: edgePhotoWhereInput[]
    NOT?: edgePhotoWhereInput | edgePhotoWhereInput[]
    modelId?: IntFilter<"edgePhoto"> | number
    photoId?: IntFilter<"edgePhoto"> | number
    isMainPhoto?: BoolFilter<"edgePhoto"> | boolean
    elementImage?: XOR<ElementImageRelationFilter, elementImageWhereInput>
    model?: XOR<EdgeModelRelationFilter, edgeModelWhereInput>
  }, "id">

  export type edgePhotoOrderByWithAggregationInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
    isMainPhoto?: SortOrder
    _count?: edgePhotoCountOrderByAggregateInput
    _avg?: edgePhotoAvgOrderByAggregateInput
    _max?: edgePhotoMaxOrderByAggregateInput
    _min?: edgePhotoMinOrderByAggregateInput
    _sum?: edgePhotoSumOrderByAggregateInput
  }

  export type edgePhotoScalarWhereWithAggregatesInput = {
    AND?: edgePhotoScalarWhereWithAggregatesInput | edgePhotoScalarWhereWithAggregatesInput[]
    OR?: edgePhotoScalarWhereWithAggregatesInput[]
    NOT?: edgePhotoScalarWhereWithAggregatesInput | edgePhotoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"edgePhoto"> | number
    modelId?: IntWithAggregatesFilter<"edgePhoto"> | number
    photoId?: IntWithAggregatesFilter<"edgePhoto"> | number
    isMainPhoto?: BoolWithAggregatesFilter<"edgePhoto"> | boolean
  }

  export type edgeValueWhereInput = {
    AND?: edgeValueWhereInput | edgeValueWhereInput[]
    OR?: edgeValueWhereInput[]
    NOT?: edgeValueWhereInput | edgeValueWhereInput[]
    id?: IntFilter<"edgeValue"> | number
    order?: FloatFilter<"edgeValue"> | number
    renderName?: StringFilter<"edgeValue"> | string
    optionName?: StringNullableFilter<"edgeValue"> | string | null
    optionValue?: StringNullableFilter<"edgeValue"> | string | null
    modelId?: IntNullableFilter<"edgeValue"> | number | null
    model?: XOR<EdgeModelNullableRelationFilter, edgeModelWhereInput> | null
  }

  export type edgeValueOrderByWithRelationInput = {
    id?: SortOrder
    order?: SortOrder
    renderName?: SortOrder
    optionName?: SortOrderInput | SortOrder
    optionValue?: SortOrderInput | SortOrder
    modelId?: SortOrderInput | SortOrder
    model?: edgeModelOrderByWithRelationInput
  }

  export type edgeValueWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: edgeValueWhereInput | edgeValueWhereInput[]
    OR?: edgeValueWhereInput[]
    NOT?: edgeValueWhereInput | edgeValueWhereInput[]
    order?: FloatFilter<"edgeValue"> | number
    renderName?: StringFilter<"edgeValue"> | string
    optionName?: StringNullableFilter<"edgeValue"> | string | null
    optionValue?: StringNullableFilter<"edgeValue"> | string | null
    modelId?: IntNullableFilter<"edgeValue"> | number | null
    model?: XOR<EdgeModelNullableRelationFilter, edgeModelWhereInput> | null
  }, "id">

  export type edgeValueOrderByWithAggregationInput = {
    id?: SortOrder
    order?: SortOrder
    renderName?: SortOrder
    optionName?: SortOrderInput | SortOrder
    optionValue?: SortOrderInput | SortOrder
    modelId?: SortOrderInput | SortOrder
    _count?: edgeValueCountOrderByAggregateInput
    _avg?: edgeValueAvgOrderByAggregateInput
    _max?: edgeValueMaxOrderByAggregateInput
    _min?: edgeValueMinOrderByAggregateInput
    _sum?: edgeValueSumOrderByAggregateInput
  }

  export type edgeValueScalarWhereWithAggregatesInput = {
    AND?: edgeValueScalarWhereWithAggregatesInput | edgeValueScalarWhereWithAggregatesInput[]
    OR?: edgeValueScalarWhereWithAggregatesInput[]
    NOT?: edgeValueScalarWhereWithAggregatesInput | edgeValueScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"edgeValue"> | number
    order?: FloatWithAggregatesFilter<"edgeValue"> | number
    renderName?: StringWithAggregatesFilter<"edgeValue"> | string
    optionName?: StringNullableWithAggregatesFilter<"edgeValue"> | string | null
    optionValue?: StringNullableWithAggregatesFilter<"edgeValue"> | string | null
    modelId?: IntNullableWithAggregatesFilter<"edgeValue"> | number | null
  }

  export type optionIntervalCreateInput = {
    valueId: number
    issueNumberStart: string
    issueNumberEnd: string
    username: string
  }

  export type optionIntervalUncheckedCreateInput = {
    id?: number
    valueId: number
    issueNumberStart: string
    issueNumberEnd: string
    username: string
  }

  export type optionIntervalUpdateInput = {
    valueId?: IntFieldUpdateOperationsInput | number
    issueNumberStart?: StringFieldUpdateOperationsInput | string
    issueNumberEnd?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type optionIntervalUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    valueId?: IntFieldUpdateOperationsInput | number
    issueNumberStart?: StringFieldUpdateOperationsInput | string
    issueNumberEnd?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type optionIntervalCreateManyInput = {
    id?: number
    valueId: number
    issueNumberStart: string
    issueNumberEnd: string
    username: string
  }

  export type optionIntervalUpdateManyMutationInput = {
    valueId?: IntFieldUpdateOperationsInput | number
    issueNumberStart?: StringFieldUpdateOperationsInput | string
    issueNumberEnd?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type optionIntervalUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    valueId?: IntFieldUpdateOperationsInput | number
    issueNumberStart?: StringFieldUpdateOperationsInput | string
    issueNumberEnd?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
  }

  export type edgeModelOldCreateInput = {
    country: string
    magazine: string
    order: number
    functionName: string
    optionName?: string | null
  }

  export type edgeModelOldUncheckedCreateInput = {
    id?: number
    country: string
    magazine: string
    order: number
    functionName: string
    optionName?: string | null
  }

  export type edgeModelOldUpdateInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    functionName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeModelOldUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    functionName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeModelOldCreateManyInput = {
    id?: number
    country: string
    magazine: string
    order: number
    functionName: string
    optionName?: string | null
  }

  export type edgeModelOldUpdateManyMutationInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    functionName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeModelOldUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    functionName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type optionValueCreateInput = {
    optionId?: number | null
    value?: string | null
  }

  export type optionValueUncheckedCreateInput = {
    id?: number
    optionId?: number | null
    value?: string | null
  }

  export type optionValueUpdateInput = {
    optionId?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type optionValueUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    optionId?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type optionValueCreateManyInput = {
    id?: number
    optionId?: number | null
    value?: string | null
  }

  export type optionValueUpdateManyMutationInput = {
    optionId?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type optionValueUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    optionId?: NullableIntFieldUpdateOperationsInput | number | null
    value?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type myfontsImageCreateInput = {
    font?: string | null
    color?: string | null
    backgroundColor?: string | null
    width?: string | null
    text?: string | null
    precision?: string | null
  }

  export type myfontsImageUncheckedCreateInput = {
    id?: number
    font?: string | null
    color?: string | null
    backgroundColor?: string | null
    width?: string | null
    text?: string | null
    precision?: string | null
  }

  export type myfontsImageUpdateInput = {
    font?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    backgroundColor?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableStringFieldUpdateOperationsInput | string | null
    text?: NullableStringFieldUpdateOperationsInput | string | null
    precision?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type myfontsImageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    font?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    backgroundColor?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableStringFieldUpdateOperationsInput | string | null
    text?: NullableStringFieldUpdateOperationsInput | string | null
    precision?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type myfontsImageCreateManyInput = {
    id?: number
    font?: string | null
    color?: string | null
    backgroundColor?: string | null
    width?: string | null
    text?: string | null
    precision?: string | null
  }

  export type myfontsImageUpdateManyMutationInput = {
    font?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    backgroundColor?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableStringFieldUpdateOperationsInput | string | null
    text?: NullableStringFieldUpdateOperationsInput | string | null
    precision?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type myfontsImageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    font?: NullableStringFieldUpdateOperationsInput | string | null
    color?: NullableStringFieldUpdateOperationsInput | string | null
    backgroundColor?: NullableStringFieldUpdateOperationsInput | string | null
    width?: NullableStringFieldUpdateOperationsInput | string | null
    text?: NullableStringFieldUpdateOperationsInput | string | null
    precision?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type elementImageCreateInput = {
    userId?: number | null
    hash?: string | null
    createdAt?: Date | string | null
    fileName: string
    tranches_en_cours_modeles_images?: edgePhotoCreateNestedManyWithoutElementImageInput
  }

  export type elementImageUncheckedCreateInput = {
    id?: number
    userId?: number | null
    hash?: string | null
    createdAt?: Date | string | null
    fileName: string
    tranches_en_cours_modeles_images?: edgePhotoUncheckedCreateNestedManyWithoutElementImageInput
  }

  export type elementImageUpdateInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    tranches_en_cours_modeles_images?: edgePhotoUpdateManyWithoutElementImageNestedInput
  }

  export type elementImageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
    tranches_en_cours_modeles_images?: edgePhotoUncheckedUpdateManyWithoutElementImageNestedInput
  }

  export type elementImageCreateManyInput = {
    id?: number
    userId?: number | null
    hash?: string | null
    createdAt?: Date | string | null
    fileName: string
  }

  export type elementImageUpdateManyMutationInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
  }

  export type elementImageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
  }

  export type edgeModelCreateInput = {
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorCreateNestedManyWithoutModelInput
    photos?: edgePhotoCreateNestedManyWithoutModelInput
    values?: edgeValueCreateNestedManyWithoutModelInput
  }

  export type edgeModelUncheckedCreateInput = {
    id?: number
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorUncheckedCreateNestedManyWithoutModelInput
    photos?: edgePhotoUncheckedCreateNestedManyWithoutModelInput
    values?: edgeValueUncheckedCreateNestedManyWithoutModelInput
  }

  export type edgeModelUpdateInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUpdateManyWithoutModelNestedInput
    photos?: edgePhotoUpdateManyWithoutModelNestedInput
    values?: edgeValueUpdateManyWithoutModelNestedInput
  }

  export type edgeModelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUncheckedUpdateManyWithoutModelNestedInput
    photos?: edgePhotoUncheckedUpdateManyWithoutModelNestedInput
    values?: edgeValueUncheckedUpdateManyWithoutModelNestedInput
  }

  export type edgeModelCreateManyInput = {
    id?: number
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
  }

  export type edgeModelUpdateManyMutationInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgeModelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgeContributorCreateInput = {
    userId: number
    contribution: $Enums.contribution
    model?: edgeModelCreateNestedOneWithoutContributorsInput
  }

  export type edgeContributorUncheckedCreateInput = {
    id?: number
    modelId?: number | null
    userId: number
    contribution: $Enums.contribution
  }

  export type edgeContributorUpdateInput = {
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
    model?: edgeModelUpdateOneWithoutContributorsNestedInput
  }

  export type edgeContributorUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgeContributorCreateManyInput = {
    id?: number
    modelId?: number | null
    userId: number
    contribution: $Enums.contribution
  }

  export type edgeContributorUpdateManyMutationInput = {
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgeContributorUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgePhotoCreateInput = {
    isMainPhoto: boolean
    elementImage: elementImageCreateNestedOneWithoutTranches_en_cours_modeles_imagesInput
    model: edgeModelCreateNestedOneWithoutPhotosInput
  }

  export type edgePhotoUncheckedCreateInput = {
    id?: number
    modelId: number
    photoId: number
    isMainPhoto: boolean
  }

  export type edgePhotoUpdateInput = {
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
    elementImage?: elementImageUpdateOneRequiredWithoutTranches_en_cours_modeles_imagesNestedInput
    model?: edgeModelUpdateOneRequiredWithoutPhotosNestedInput
  }

  export type edgePhotoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: IntFieldUpdateOperationsInput | number
    photoId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgePhotoCreateManyInput = {
    id?: number
    modelId: number
    photoId: number
    isMainPhoto: boolean
  }

  export type edgePhotoUpdateManyMutationInput = {
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgePhotoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: IntFieldUpdateOperationsInput | number
    photoId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgeValueCreateInput = {
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
    model?: edgeModelCreateNestedOneWithoutValuesInput
  }

  export type edgeValueUncheckedCreateInput = {
    id?: number
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
    modelId?: number | null
  }

  export type edgeValueUpdateInput = {
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
    model?: edgeModelUpdateOneWithoutValuesNestedInput
  }

  export type edgeValueUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
    modelId?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type edgeValueCreateManyInput = {
    id?: number
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
    modelId?: number | null
  }

  export type edgeValueUpdateManyMutationInput = {
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeValueUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
    modelId?: NullableIntFieldUpdateOperationsInput | number | null
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

  export type optionIntervalCountOrderByAggregateInput = {
    id?: SortOrder
    valueId?: SortOrder
    issueNumberStart?: SortOrder
    issueNumberEnd?: SortOrder
    username?: SortOrder
  }

  export type optionIntervalAvgOrderByAggregateInput = {
    id?: SortOrder
    valueId?: SortOrder
  }

  export type optionIntervalMaxOrderByAggregateInput = {
    id?: SortOrder
    valueId?: SortOrder
    issueNumberStart?: SortOrder
    issueNumberEnd?: SortOrder
    username?: SortOrder
  }

  export type optionIntervalMinOrderByAggregateInput = {
    id?: SortOrder
    valueId?: SortOrder
    issueNumberStart?: SortOrder
    issueNumberEnd?: SortOrder
    username?: SortOrder
  }

  export type optionIntervalSumOrderByAggregateInput = {
    id?: SortOrder
    valueId?: SortOrder
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

  export type edgeModelOldCountOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    order?: SortOrder
    functionName?: SortOrder
    optionName?: SortOrder
  }

  export type edgeModelOldAvgOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
  }

  export type edgeModelOldMaxOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    order?: SortOrder
    functionName?: SortOrder
    optionName?: SortOrder
  }

  export type edgeModelOldMinOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    order?: SortOrder
    functionName?: SortOrder
    optionName?: SortOrder
  }

  export type edgeModelOldSumOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
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

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type optionValueCountOrderByAggregateInput = {
    id?: SortOrder
    optionId?: SortOrder
    value?: SortOrder
  }

  export type optionValueAvgOrderByAggregateInput = {
    id?: SortOrder
    optionId?: SortOrder
  }

  export type optionValueMaxOrderByAggregateInput = {
    id?: SortOrder
    optionId?: SortOrder
    value?: SortOrder
  }

  export type optionValueMinOrderByAggregateInput = {
    id?: SortOrder
    optionId?: SortOrder
    value?: SortOrder
  }

  export type optionValueSumOrderByAggregateInput = {
    id?: SortOrder
    optionId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type myfontsImageCountOrderByAggregateInput = {
    id?: SortOrder
    font?: SortOrder
    color?: SortOrder
    backgroundColor?: SortOrder
    width?: SortOrder
    text?: SortOrder
    precision?: SortOrder
  }

  export type myfontsImageAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type myfontsImageMaxOrderByAggregateInput = {
    id?: SortOrder
    font?: SortOrder
    color?: SortOrder
    backgroundColor?: SortOrder
    width?: SortOrder
    text?: SortOrder
    precision?: SortOrder
  }

  export type myfontsImageMinOrderByAggregateInput = {
    id?: SortOrder
    font?: SortOrder
    color?: SortOrder
    backgroundColor?: SortOrder
    width?: SortOrder
    text?: SortOrder
    precision?: SortOrder
  }

  export type myfontsImageSumOrderByAggregateInput = {
    id?: SortOrder
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

  export type EdgePhotoListRelationFilter = {
    every?: edgePhotoWhereInput
    some?: edgePhotoWhereInput
    none?: edgePhotoWhereInput
  }

  export type edgePhotoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type elementImageCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    hash?: SortOrder
    createdAt?: SortOrder
    fileName?: SortOrder
  }

  export type elementImageAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type elementImageMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    hash?: SortOrder
    createdAt?: SortOrder
    fileName?: SortOrder
  }

  export type elementImageMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    hash?: SortOrder
    createdAt?: SortOrder
    fileName?: SortOrder
  }

  export type elementImageSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EdgeContributorListRelationFilter = {
    every?: edgeContributorWhereInput
    some?: edgeContributorWhereInput
    none?: edgeContributorWhereInput
  }

  export type EdgeValueListRelationFilter = {
    every?: edgeValueWhereInput
    some?: edgeValueWhereInput
    none?: edgeValueWhereInput
  }

  export type edgeContributorOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type edgeValueOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type edgeModelCountryMagazineIssuenumberUsernameCompoundUniqueInput = {
    country: string
    magazine: string
    issuenumber: string
    username: string
  }

  export type edgeModelCountOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    issuenumber?: SortOrder
    username?: SortOrder
    mainPhotoName?: SortOrder
    photographs?: SortOrder
    creators?: SortOrder
    isActive?: SortOrder
  }

  export type edgeModelAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type edgeModelMaxOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    issuenumber?: SortOrder
    username?: SortOrder
    mainPhotoName?: SortOrder
    photographs?: SortOrder
    creators?: SortOrder
    isActive?: SortOrder
  }

  export type edgeModelMinOrderByAggregateInput = {
    id?: SortOrder
    country?: SortOrder
    magazine?: SortOrder
    issuenumber?: SortOrder
    username?: SortOrder
    mainPhotoName?: SortOrder
    photographs?: SortOrder
    creators?: SortOrder
    isActive?: SortOrder
  }

  export type edgeModelSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumcontributionFilter<$PrismaModel = never> = {
    equals?: $Enums.contribution | EnumcontributionFieldRefInput<$PrismaModel>
    in?: $Enums.contribution[]
    notIn?: $Enums.contribution[]
    not?: NestedEnumcontributionFilter<$PrismaModel> | $Enums.contribution
  }

  export type EdgeModelNullableRelationFilter = {
    is?: edgeModelWhereInput | null
    isNot?: edgeModelWhereInput | null
  }

  export type edgeContributorModelIdUserIdContributionCompoundUniqueInput = {
    modelId: number
    userId: number
    contribution: $Enums.contribution
  }

  export type edgeContributorCountOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    userId?: SortOrder
    contribution?: SortOrder
  }

  export type edgeContributorAvgOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    userId?: SortOrder
  }

  export type edgeContributorMaxOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    userId?: SortOrder
    contribution?: SortOrder
  }

  export type edgeContributorMinOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    userId?: SortOrder
    contribution?: SortOrder
  }

  export type edgeContributorSumOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    userId?: SortOrder
  }

  export type EnumcontributionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.contribution | EnumcontributionFieldRefInput<$PrismaModel>
    in?: $Enums.contribution[]
    notIn?: $Enums.contribution[]
    not?: NestedEnumcontributionWithAggregatesFilter<$PrismaModel> | $Enums.contribution
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumcontributionFilter<$PrismaModel>
    _max?: NestedEnumcontributionFilter<$PrismaModel>
  }

  export type ElementImageRelationFilter = {
    is?: elementImageWhereInput
    isNot?: elementImageWhereInput
  }

  export type EdgeModelRelationFilter = {
    is?: edgeModelWhereInput
    isNot?: edgeModelWhereInput
  }

  export type edgePhotoCountOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
    isMainPhoto?: SortOrder
  }

  export type edgePhotoAvgOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
  }

  export type edgePhotoMaxOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
    isMainPhoto?: SortOrder
  }

  export type edgePhotoMinOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
    isMainPhoto?: SortOrder
  }

  export type edgePhotoSumOrderByAggregateInput = {
    id?: SortOrder
    modelId?: SortOrder
    photoId?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type edgeValueCountOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
    renderName?: SortOrder
    optionName?: SortOrder
    optionValue?: SortOrder
    modelId?: SortOrder
  }

  export type edgeValueAvgOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
    modelId?: SortOrder
  }

  export type edgeValueMaxOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
    renderName?: SortOrder
    optionName?: SortOrder
    optionValue?: SortOrder
    modelId?: SortOrder
  }

  export type edgeValueMinOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
    renderName?: SortOrder
    optionName?: SortOrder
    optionValue?: SortOrder
    modelId?: SortOrder
  }

  export type edgeValueSumOrderByAggregateInput = {
    id?: SortOrder
    order?: SortOrder
    modelId?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
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

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type edgePhotoCreateNestedManyWithoutElementImageInput = {
    create?: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput> | edgePhotoCreateWithoutElementImageInput[] | edgePhotoUncheckedCreateWithoutElementImageInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutElementImageInput | edgePhotoCreateOrConnectWithoutElementImageInput[]
    createMany?: edgePhotoCreateManyElementImageInputEnvelope
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
  }

  export type edgePhotoUncheckedCreateNestedManyWithoutElementImageInput = {
    create?: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput> | edgePhotoCreateWithoutElementImageInput[] | edgePhotoUncheckedCreateWithoutElementImageInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutElementImageInput | edgePhotoCreateOrConnectWithoutElementImageInput[]
    createMany?: edgePhotoCreateManyElementImageInputEnvelope
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type edgePhotoUpdateManyWithoutElementImageNestedInput = {
    create?: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput> | edgePhotoCreateWithoutElementImageInput[] | edgePhotoUncheckedCreateWithoutElementImageInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutElementImageInput | edgePhotoCreateOrConnectWithoutElementImageInput[]
    upsert?: edgePhotoUpsertWithWhereUniqueWithoutElementImageInput | edgePhotoUpsertWithWhereUniqueWithoutElementImageInput[]
    createMany?: edgePhotoCreateManyElementImageInputEnvelope
    set?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    disconnect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    delete?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    update?: edgePhotoUpdateWithWhereUniqueWithoutElementImageInput | edgePhotoUpdateWithWhereUniqueWithoutElementImageInput[]
    updateMany?: edgePhotoUpdateManyWithWhereWithoutElementImageInput | edgePhotoUpdateManyWithWhereWithoutElementImageInput[]
    deleteMany?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
  }

  export type edgePhotoUncheckedUpdateManyWithoutElementImageNestedInput = {
    create?: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput> | edgePhotoCreateWithoutElementImageInput[] | edgePhotoUncheckedCreateWithoutElementImageInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutElementImageInput | edgePhotoCreateOrConnectWithoutElementImageInput[]
    upsert?: edgePhotoUpsertWithWhereUniqueWithoutElementImageInput | edgePhotoUpsertWithWhereUniqueWithoutElementImageInput[]
    createMany?: edgePhotoCreateManyElementImageInputEnvelope
    set?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    disconnect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    delete?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    update?: edgePhotoUpdateWithWhereUniqueWithoutElementImageInput | edgePhotoUpdateWithWhereUniqueWithoutElementImageInput[]
    updateMany?: edgePhotoUpdateManyWithWhereWithoutElementImageInput | edgePhotoUpdateManyWithWhereWithoutElementImageInput[]
    deleteMany?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
  }

  export type edgeContributorCreateNestedManyWithoutModelInput = {
    create?: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput> | edgeContributorCreateWithoutModelInput[] | edgeContributorUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeContributorCreateOrConnectWithoutModelInput | edgeContributorCreateOrConnectWithoutModelInput[]
    createMany?: edgeContributorCreateManyModelInputEnvelope
    connect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
  }

  export type edgePhotoCreateNestedManyWithoutModelInput = {
    create?: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput> | edgePhotoCreateWithoutModelInput[] | edgePhotoUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutModelInput | edgePhotoCreateOrConnectWithoutModelInput[]
    createMany?: edgePhotoCreateManyModelInputEnvelope
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
  }

  export type edgeValueCreateNestedManyWithoutModelInput = {
    create?: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput> | edgeValueCreateWithoutModelInput[] | edgeValueUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeValueCreateOrConnectWithoutModelInput | edgeValueCreateOrConnectWithoutModelInput[]
    createMany?: edgeValueCreateManyModelInputEnvelope
    connect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
  }

  export type edgeContributorUncheckedCreateNestedManyWithoutModelInput = {
    create?: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput> | edgeContributorCreateWithoutModelInput[] | edgeContributorUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeContributorCreateOrConnectWithoutModelInput | edgeContributorCreateOrConnectWithoutModelInput[]
    createMany?: edgeContributorCreateManyModelInputEnvelope
    connect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
  }

  export type edgePhotoUncheckedCreateNestedManyWithoutModelInput = {
    create?: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput> | edgePhotoCreateWithoutModelInput[] | edgePhotoUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutModelInput | edgePhotoCreateOrConnectWithoutModelInput[]
    createMany?: edgePhotoCreateManyModelInputEnvelope
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
  }

  export type edgeValueUncheckedCreateNestedManyWithoutModelInput = {
    create?: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput> | edgeValueCreateWithoutModelInput[] | edgeValueUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeValueCreateOrConnectWithoutModelInput | edgeValueCreateOrConnectWithoutModelInput[]
    createMany?: edgeValueCreateManyModelInputEnvelope
    connect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type edgeContributorUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput> | edgeContributorCreateWithoutModelInput[] | edgeContributorUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeContributorCreateOrConnectWithoutModelInput | edgeContributorCreateOrConnectWithoutModelInput[]
    upsert?: edgeContributorUpsertWithWhereUniqueWithoutModelInput | edgeContributorUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgeContributorCreateManyModelInputEnvelope
    set?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    disconnect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    delete?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    connect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    update?: edgeContributorUpdateWithWhereUniqueWithoutModelInput | edgeContributorUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgeContributorUpdateManyWithWhereWithoutModelInput | edgeContributorUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgeContributorScalarWhereInput | edgeContributorScalarWhereInput[]
  }

  export type edgePhotoUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput> | edgePhotoCreateWithoutModelInput[] | edgePhotoUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutModelInput | edgePhotoCreateOrConnectWithoutModelInput[]
    upsert?: edgePhotoUpsertWithWhereUniqueWithoutModelInput | edgePhotoUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgePhotoCreateManyModelInputEnvelope
    set?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    disconnect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    delete?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    update?: edgePhotoUpdateWithWhereUniqueWithoutModelInput | edgePhotoUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgePhotoUpdateManyWithWhereWithoutModelInput | edgePhotoUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
  }

  export type edgeValueUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput> | edgeValueCreateWithoutModelInput[] | edgeValueUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeValueCreateOrConnectWithoutModelInput | edgeValueCreateOrConnectWithoutModelInput[]
    upsert?: edgeValueUpsertWithWhereUniqueWithoutModelInput | edgeValueUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgeValueCreateManyModelInputEnvelope
    set?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    disconnect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    delete?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    connect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    update?: edgeValueUpdateWithWhereUniqueWithoutModelInput | edgeValueUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgeValueUpdateManyWithWhereWithoutModelInput | edgeValueUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgeValueScalarWhereInput | edgeValueScalarWhereInput[]
  }

  export type edgeContributorUncheckedUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput> | edgeContributorCreateWithoutModelInput[] | edgeContributorUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeContributorCreateOrConnectWithoutModelInput | edgeContributorCreateOrConnectWithoutModelInput[]
    upsert?: edgeContributorUpsertWithWhereUniqueWithoutModelInput | edgeContributorUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgeContributorCreateManyModelInputEnvelope
    set?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    disconnect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    delete?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    connect?: edgeContributorWhereUniqueInput | edgeContributorWhereUniqueInput[]
    update?: edgeContributorUpdateWithWhereUniqueWithoutModelInput | edgeContributorUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgeContributorUpdateManyWithWhereWithoutModelInput | edgeContributorUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgeContributorScalarWhereInput | edgeContributorScalarWhereInput[]
  }

  export type edgePhotoUncheckedUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput> | edgePhotoCreateWithoutModelInput[] | edgePhotoUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgePhotoCreateOrConnectWithoutModelInput | edgePhotoCreateOrConnectWithoutModelInput[]
    upsert?: edgePhotoUpsertWithWhereUniqueWithoutModelInput | edgePhotoUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgePhotoCreateManyModelInputEnvelope
    set?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    disconnect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    delete?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    connect?: edgePhotoWhereUniqueInput | edgePhotoWhereUniqueInput[]
    update?: edgePhotoUpdateWithWhereUniqueWithoutModelInput | edgePhotoUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgePhotoUpdateManyWithWhereWithoutModelInput | edgePhotoUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
  }

  export type edgeValueUncheckedUpdateManyWithoutModelNestedInput = {
    create?: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput> | edgeValueCreateWithoutModelInput[] | edgeValueUncheckedCreateWithoutModelInput[]
    connectOrCreate?: edgeValueCreateOrConnectWithoutModelInput | edgeValueCreateOrConnectWithoutModelInput[]
    upsert?: edgeValueUpsertWithWhereUniqueWithoutModelInput | edgeValueUpsertWithWhereUniqueWithoutModelInput[]
    createMany?: edgeValueCreateManyModelInputEnvelope
    set?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    disconnect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    delete?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    connect?: edgeValueWhereUniqueInput | edgeValueWhereUniqueInput[]
    update?: edgeValueUpdateWithWhereUniqueWithoutModelInput | edgeValueUpdateWithWhereUniqueWithoutModelInput[]
    updateMany?: edgeValueUpdateManyWithWhereWithoutModelInput | edgeValueUpdateManyWithWhereWithoutModelInput[]
    deleteMany?: edgeValueScalarWhereInput | edgeValueScalarWhereInput[]
  }

  export type edgeModelCreateNestedOneWithoutContributorsInput = {
    create?: XOR<edgeModelCreateWithoutContributorsInput, edgeModelUncheckedCreateWithoutContributorsInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutContributorsInput
    connect?: edgeModelWhereUniqueInput
  }

  export type EnumcontributionFieldUpdateOperationsInput = {
    set?: $Enums.contribution
  }

  export type edgeModelUpdateOneWithoutContributorsNestedInput = {
    create?: XOR<edgeModelCreateWithoutContributorsInput, edgeModelUncheckedCreateWithoutContributorsInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutContributorsInput
    upsert?: edgeModelUpsertWithoutContributorsInput
    disconnect?: edgeModelWhereInput | boolean
    delete?: edgeModelWhereInput | boolean
    connect?: edgeModelWhereUniqueInput
    update?: XOR<XOR<edgeModelUpdateToOneWithWhereWithoutContributorsInput, edgeModelUpdateWithoutContributorsInput>, edgeModelUncheckedUpdateWithoutContributorsInput>
  }

  export type elementImageCreateNestedOneWithoutTranches_en_cours_modeles_imagesInput = {
    create?: XOR<elementImageCreateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedCreateWithoutTranches_en_cours_modeles_imagesInput>
    connectOrCreate?: elementImageCreateOrConnectWithoutTranches_en_cours_modeles_imagesInput
    connect?: elementImageWhereUniqueInput
  }

  export type edgeModelCreateNestedOneWithoutPhotosInput = {
    create?: XOR<edgeModelCreateWithoutPhotosInput, edgeModelUncheckedCreateWithoutPhotosInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutPhotosInput
    connect?: edgeModelWhereUniqueInput
  }

  export type elementImageUpdateOneRequiredWithoutTranches_en_cours_modeles_imagesNestedInput = {
    create?: XOR<elementImageCreateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedCreateWithoutTranches_en_cours_modeles_imagesInput>
    connectOrCreate?: elementImageCreateOrConnectWithoutTranches_en_cours_modeles_imagesInput
    upsert?: elementImageUpsertWithoutTranches_en_cours_modeles_imagesInput
    connect?: elementImageWhereUniqueInput
    update?: XOR<XOR<elementImageUpdateToOneWithWhereWithoutTranches_en_cours_modeles_imagesInput, elementImageUpdateWithoutTranches_en_cours_modeles_imagesInput>, elementImageUncheckedUpdateWithoutTranches_en_cours_modeles_imagesInput>
  }

  export type edgeModelUpdateOneRequiredWithoutPhotosNestedInput = {
    create?: XOR<edgeModelCreateWithoutPhotosInput, edgeModelUncheckedCreateWithoutPhotosInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutPhotosInput
    upsert?: edgeModelUpsertWithoutPhotosInput
    connect?: edgeModelWhereUniqueInput
    update?: XOR<XOR<edgeModelUpdateToOneWithWhereWithoutPhotosInput, edgeModelUpdateWithoutPhotosInput>, edgeModelUncheckedUpdateWithoutPhotosInput>
  }

  export type edgeModelCreateNestedOneWithoutValuesInput = {
    create?: XOR<edgeModelCreateWithoutValuesInput, edgeModelUncheckedCreateWithoutValuesInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutValuesInput
    connect?: edgeModelWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type edgeModelUpdateOneWithoutValuesNestedInput = {
    create?: XOR<edgeModelCreateWithoutValuesInput, edgeModelUncheckedCreateWithoutValuesInput>
    connectOrCreate?: edgeModelCreateOrConnectWithoutValuesInput
    upsert?: edgeModelUpsertWithoutValuesInput
    disconnect?: edgeModelWhereInput | boolean
    delete?: edgeModelWhereInput | boolean
    connect?: edgeModelWhereUniqueInput
    update?: XOR<XOR<edgeModelUpdateToOneWithWhereWithoutValuesInput, edgeModelUpdateWithoutValuesInput>, edgeModelUncheckedUpdateWithoutValuesInput>
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

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumcontributionFilter<$PrismaModel = never> = {
    equals?: $Enums.contribution | EnumcontributionFieldRefInput<$PrismaModel>
    in?: $Enums.contribution[]
    notIn?: $Enums.contribution[]
    not?: NestedEnumcontributionFilter<$PrismaModel> | $Enums.contribution
  }

  export type NestedEnumcontributionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.contribution | EnumcontributionFieldRefInput<$PrismaModel>
    in?: $Enums.contribution[]
    notIn?: $Enums.contribution[]
    not?: NestedEnumcontributionWithAggregatesFilter<$PrismaModel> | $Enums.contribution
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumcontributionFilter<$PrismaModel>
    _max?: NestedEnumcontributionFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type edgePhotoCreateWithoutElementImageInput = {
    isMainPhoto: boolean
    model: edgeModelCreateNestedOneWithoutPhotosInput
  }

  export type edgePhotoUncheckedCreateWithoutElementImageInput = {
    id?: number
    modelId: number
    isMainPhoto: boolean
  }

  export type edgePhotoCreateOrConnectWithoutElementImageInput = {
    where: edgePhotoWhereUniqueInput
    create: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput>
  }

  export type edgePhotoCreateManyElementImageInputEnvelope = {
    data: edgePhotoCreateManyElementImageInput | edgePhotoCreateManyElementImageInput[]
    skipDuplicates?: boolean
  }

  export type edgePhotoUpsertWithWhereUniqueWithoutElementImageInput = {
    where: edgePhotoWhereUniqueInput
    update: XOR<edgePhotoUpdateWithoutElementImageInput, edgePhotoUncheckedUpdateWithoutElementImageInput>
    create: XOR<edgePhotoCreateWithoutElementImageInput, edgePhotoUncheckedCreateWithoutElementImageInput>
  }

  export type edgePhotoUpdateWithWhereUniqueWithoutElementImageInput = {
    where: edgePhotoWhereUniqueInput
    data: XOR<edgePhotoUpdateWithoutElementImageInput, edgePhotoUncheckedUpdateWithoutElementImageInput>
  }

  export type edgePhotoUpdateManyWithWhereWithoutElementImageInput = {
    where: edgePhotoScalarWhereInput
    data: XOR<edgePhotoUpdateManyMutationInput, edgePhotoUncheckedUpdateManyWithoutElementImageInput>
  }

  export type edgePhotoScalarWhereInput = {
    AND?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
    OR?: edgePhotoScalarWhereInput[]
    NOT?: edgePhotoScalarWhereInput | edgePhotoScalarWhereInput[]
    id?: IntFilter<"edgePhoto"> | number
    modelId?: IntFilter<"edgePhoto"> | number
    photoId?: IntFilter<"edgePhoto"> | number
    isMainPhoto?: BoolFilter<"edgePhoto"> | boolean
  }

  export type edgeContributorCreateWithoutModelInput = {
    userId: number
    contribution: $Enums.contribution
  }

  export type edgeContributorUncheckedCreateWithoutModelInput = {
    id?: number
    userId: number
    contribution: $Enums.contribution
  }

  export type edgeContributorCreateOrConnectWithoutModelInput = {
    where: edgeContributorWhereUniqueInput
    create: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput>
  }

  export type edgeContributorCreateManyModelInputEnvelope = {
    data: edgeContributorCreateManyModelInput | edgeContributorCreateManyModelInput[]
    skipDuplicates?: boolean
  }

  export type edgePhotoCreateWithoutModelInput = {
    isMainPhoto: boolean
    elementImage: elementImageCreateNestedOneWithoutTranches_en_cours_modeles_imagesInput
  }

  export type edgePhotoUncheckedCreateWithoutModelInput = {
    id?: number
    photoId: number
    isMainPhoto: boolean
  }

  export type edgePhotoCreateOrConnectWithoutModelInput = {
    where: edgePhotoWhereUniqueInput
    create: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput>
  }

  export type edgePhotoCreateManyModelInputEnvelope = {
    data: edgePhotoCreateManyModelInput | edgePhotoCreateManyModelInput[]
    skipDuplicates?: boolean
  }

  export type edgeValueCreateWithoutModelInput = {
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
  }

  export type edgeValueUncheckedCreateWithoutModelInput = {
    id?: number
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
  }

  export type edgeValueCreateOrConnectWithoutModelInput = {
    where: edgeValueWhereUniqueInput
    create: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput>
  }

  export type edgeValueCreateManyModelInputEnvelope = {
    data: edgeValueCreateManyModelInput | edgeValueCreateManyModelInput[]
    skipDuplicates?: boolean
  }

  export type edgeContributorUpsertWithWhereUniqueWithoutModelInput = {
    where: edgeContributorWhereUniqueInput
    update: XOR<edgeContributorUpdateWithoutModelInput, edgeContributorUncheckedUpdateWithoutModelInput>
    create: XOR<edgeContributorCreateWithoutModelInput, edgeContributorUncheckedCreateWithoutModelInput>
  }

  export type edgeContributorUpdateWithWhereUniqueWithoutModelInput = {
    where: edgeContributorWhereUniqueInput
    data: XOR<edgeContributorUpdateWithoutModelInput, edgeContributorUncheckedUpdateWithoutModelInput>
  }

  export type edgeContributorUpdateManyWithWhereWithoutModelInput = {
    where: edgeContributorScalarWhereInput
    data: XOR<edgeContributorUpdateManyMutationInput, edgeContributorUncheckedUpdateManyWithoutModelInput>
  }

  export type edgeContributorScalarWhereInput = {
    AND?: edgeContributorScalarWhereInput | edgeContributorScalarWhereInput[]
    OR?: edgeContributorScalarWhereInput[]
    NOT?: edgeContributorScalarWhereInput | edgeContributorScalarWhereInput[]
    id?: IntFilter<"edgeContributor"> | number
    modelId?: IntNullableFilter<"edgeContributor"> | number | null
    userId?: IntFilter<"edgeContributor"> | number
    contribution?: EnumcontributionFilter<"edgeContributor"> | $Enums.contribution
  }

  export type edgePhotoUpsertWithWhereUniqueWithoutModelInput = {
    where: edgePhotoWhereUniqueInput
    update: XOR<edgePhotoUpdateWithoutModelInput, edgePhotoUncheckedUpdateWithoutModelInput>
    create: XOR<edgePhotoCreateWithoutModelInput, edgePhotoUncheckedCreateWithoutModelInput>
  }

  export type edgePhotoUpdateWithWhereUniqueWithoutModelInput = {
    where: edgePhotoWhereUniqueInput
    data: XOR<edgePhotoUpdateWithoutModelInput, edgePhotoUncheckedUpdateWithoutModelInput>
  }

  export type edgePhotoUpdateManyWithWhereWithoutModelInput = {
    where: edgePhotoScalarWhereInput
    data: XOR<edgePhotoUpdateManyMutationInput, edgePhotoUncheckedUpdateManyWithoutModelInput>
  }

  export type edgeValueUpsertWithWhereUniqueWithoutModelInput = {
    where: edgeValueWhereUniqueInput
    update: XOR<edgeValueUpdateWithoutModelInput, edgeValueUncheckedUpdateWithoutModelInput>
    create: XOR<edgeValueCreateWithoutModelInput, edgeValueUncheckedCreateWithoutModelInput>
  }

  export type edgeValueUpdateWithWhereUniqueWithoutModelInput = {
    where: edgeValueWhereUniqueInput
    data: XOR<edgeValueUpdateWithoutModelInput, edgeValueUncheckedUpdateWithoutModelInput>
  }

  export type edgeValueUpdateManyWithWhereWithoutModelInput = {
    where: edgeValueScalarWhereInput
    data: XOR<edgeValueUpdateManyMutationInput, edgeValueUncheckedUpdateManyWithoutModelInput>
  }

  export type edgeValueScalarWhereInput = {
    AND?: edgeValueScalarWhereInput | edgeValueScalarWhereInput[]
    OR?: edgeValueScalarWhereInput[]
    NOT?: edgeValueScalarWhereInput | edgeValueScalarWhereInput[]
    id?: IntFilter<"edgeValue"> | number
    order?: FloatFilter<"edgeValue"> | number
    renderName?: StringFilter<"edgeValue"> | string
    optionName?: StringNullableFilter<"edgeValue"> | string | null
    optionValue?: StringNullableFilter<"edgeValue"> | string | null
    modelId?: IntNullableFilter<"edgeValue"> | number | null
  }

  export type edgeModelCreateWithoutContributorsInput = {
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    photos?: edgePhotoCreateNestedManyWithoutModelInput
    values?: edgeValueCreateNestedManyWithoutModelInput
  }

  export type edgeModelUncheckedCreateWithoutContributorsInput = {
    id?: number
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    photos?: edgePhotoUncheckedCreateNestedManyWithoutModelInput
    values?: edgeValueUncheckedCreateNestedManyWithoutModelInput
  }

  export type edgeModelCreateOrConnectWithoutContributorsInput = {
    where: edgeModelWhereUniqueInput
    create: XOR<edgeModelCreateWithoutContributorsInput, edgeModelUncheckedCreateWithoutContributorsInput>
  }

  export type edgeModelUpsertWithoutContributorsInput = {
    update: XOR<edgeModelUpdateWithoutContributorsInput, edgeModelUncheckedUpdateWithoutContributorsInput>
    create: XOR<edgeModelCreateWithoutContributorsInput, edgeModelUncheckedCreateWithoutContributorsInput>
    where?: edgeModelWhereInput
  }

  export type edgeModelUpdateToOneWithWhereWithoutContributorsInput = {
    where?: edgeModelWhereInput
    data: XOR<edgeModelUpdateWithoutContributorsInput, edgeModelUncheckedUpdateWithoutContributorsInput>
  }

  export type edgeModelUpdateWithoutContributorsInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    photos?: edgePhotoUpdateManyWithoutModelNestedInput
    values?: edgeValueUpdateManyWithoutModelNestedInput
  }

  export type edgeModelUncheckedUpdateWithoutContributorsInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    photos?: edgePhotoUncheckedUpdateManyWithoutModelNestedInput
    values?: edgeValueUncheckedUpdateManyWithoutModelNestedInput
  }

  export type elementImageCreateWithoutTranches_en_cours_modeles_imagesInput = {
    userId?: number | null
    hash?: string | null
    createdAt?: Date | string | null
    fileName: string
  }

  export type elementImageUncheckedCreateWithoutTranches_en_cours_modeles_imagesInput = {
    id?: number
    userId?: number | null
    hash?: string | null
    createdAt?: Date | string | null
    fileName: string
  }

  export type elementImageCreateOrConnectWithoutTranches_en_cours_modeles_imagesInput = {
    where: elementImageWhereUniqueInput
    create: XOR<elementImageCreateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedCreateWithoutTranches_en_cours_modeles_imagesInput>
  }

  export type edgeModelCreateWithoutPhotosInput = {
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorCreateNestedManyWithoutModelInput
    values?: edgeValueCreateNestedManyWithoutModelInput
  }

  export type edgeModelUncheckedCreateWithoutPhotosInput = {
    id?: number
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorUncheckedCreateNestedManyWithoutModelInput
    values?: edgeValueUncheckedCreateNestedManyWithoutModelInput
  }

  export type edgeModelCreateOrConnectWithoutPhotosInput = {
    where: edgeModelWhereUniqueInput
    create: XOR<edgeModelCreateWithoutPhotosInput, edgeModelUncheckedCreateWithoutPhotosInput>
  }

  export type elementImageUpsertWithoutTranches_en_cours_modeles_imagesInput = {
    update: XOR<elementImageUpdateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedUpdateWithoutTranches_en_cours_modeles_imagesInput>
    create: XOR<elementImageCreateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedCreateWithoutTranches_en_cours_modeles_imagesInput>
    where?: elementImageWhereInput
  }

  export type elementImageUpdateToOneWithWhereWithoutTranches_en_cours_modeles_imagesInput = {
    where?: elementImageWhereInput
    data: XOR<elementImageUpdateWithoutTranches_en_cours_modeles_imagesInput, elementImageUncheckedUpdateWithoutTranches_en_cours_modeles_imagesInput>
  }

  export type elementImageUpdateWithoutTranches_en_cours_modeles_imagesInput = {
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
  }

  export type elementImageUncheckedUpdateWithoutTranches_en_cours_modeles_imagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    fileName?: StringFieldUpdateOperationsInput | string
  }

  export type edgeModelUpsertWithoutPhotosInput = {
    update: XOR<edgeModelUpdateWithoutPhotosInput, edgeModelUncheckedUpdateWithoutPhotosInput>
    create: XOR<edgeModelCreateWithoutPhotosInput, edgeModelUncheckedCreateWithoutPhotosInput>
    where?: edgeModelWhereInput
  }

  export type edgeModelUpdateToOneWithWhereWithoutPhotosInput = {
    where?: edgeModelWhereInput
    data: XOR<edgeModelUpdateWithoutPhotosInput, edgeModelUncheckedUpdateWithoutPhotosInput>
  }

  export type edgeModelUpdateWithoutPhotosInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUpdateManyWithoutModelNestedInput
    values?: edgeValueUpdateManyWithoutModelNestedInput
  }

  export type edgeModelUncheckedUpdateWithoutPhotosInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUncheckedUpdateManyWithoutModelNestedInput
    values?: edgeValueUncheckedUpdateManyWithoutModelNestedInput
  }

  export type edgeModelCreateWithoutValuesInput = {
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorCreateNestedManyWithoutModelInput
    photos?: edgePhotoCreateNestedManyWithoutModelInput
  }

  export type edgeModelUncheckedCreateWithoutValuesInput = {
    id?: number
    country: string
    magazine: string
    issuenumber: string
    username?: string | null
    mainPhotoName?: string | null
    photographs?: string | null
    creators?: string | null
    isActive: boolean
    contributors?: edgeContributorUncheckedCreateNestedManyWithoutModelInput
    photos?: edgePhotoUncheckedCreateNestedManyWithoutModelInput
  }

  export type edgeModelCreateOrConnectWithoutValuesInput = {
    where: edgeModelWhereUniqueInput
    create: XOR<edgeModelCreateWithoutValuesInput, edgeModelUncheckedCreateWithoutValuesInput>
  }

  export type edgeModelUpsertWithoutValuesInput = {
    update: XOR<edgeModelUpdateWithoutValuesInput, edgeModelUncheckedUpdateWithoutValuesInput>
    create: XOR<edgeModelCreateWithoutValuesInput, edgeModelUncheckedCreateWithoutValuesInput>
    where?: edgeModelWhereInput
  }

  export type edgeModelUpdateToOneWithWhereWithoutValuesInput = {
    where?: edgeModelWhereInput
    data: XOR<edgeModelUpdateWithoutValuesInput, edgeModelUncheckedUpdateWithoutValuesInput>
  }

  export type edgeModelUpdateWithoutValuesInput = {
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUpdateManyWithoutModelNestedInput
    photos?: edgePhotoUpdateManyWithoutModelNestedInput
  }

  export type edgeModelUncheckedUpdateWithoutValuesInput = {
    id?: IntFieldUpdateOperationsInput | number
    country?: StringFieldUpdateOperationsInput | string
    magazine?: StringFieldUpdateOperationsInput | string
    issuenumber?: StringFieldUpdateOperationsInput | string
    username?: NullableStringFieldUpdateOperationsInput | string | null
    mainPhotoName?: NullableStringFieldUpdateOperationsInput | string | null
    photographs?: NullableStringFieldUpdateOperationsInput | string | null
    creators?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    contributors?: edgeContributorUncheckedUpdateManyWithoutModelNestedInput
    photos?: edgePhotoUncheckedUpdateManyWithoutModelNestedInput
  }

  export type edgePhotoCreateManyElementImageInput = {
    id?: number
    modelId: number
    isMainPhoto: boolean
  }

  export type edgePhotoUpdateWithoutElementImageInput = {
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
    model?: edgeModelUpdateOneRequiredWithoutPhotosNestedInput
  }

  export type edgePhotoUncheckedUpdateWithoutElementImageInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgePhotoUncheckedUpdateManyWithoutElementImageInput = {
    id?: IntFieldUpdateOperationsInput | number
    modelId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgeContributorCreateManyModelInput = {
    id?: number
    userId: number
    contribution: $Enums.contribution
  }

  export type edgePhotoCreateManyModelInput = {
    id?: number
    photoId: number
    isMainPhoto: boolean
  }

  export type edgeValueCreateManyModelInput = {
    id?: number
    order: number
    renderName: string
    optionName?: string | null
    optionValue?: string | null
  }

  export type edgeContributorUpdateWithoutModelInput = {
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgeContributorUncheckedUpdateWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgeContributorUncheckedUpdateManyWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    contribution?: EnumcontributionFieldUpdateOperationsInput | $Enums.contribution
  }

  export type edgePhotoUpdateWithoutModelInput = {
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
    elementImage?: elementImageUpdateOneRequiredWithoutTranches_en_cours_modeles_imagesNestedInput
  }

  export type edgePhotoUncheckedUpdateWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    photoId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgePhotoUncheckedUpdateManyWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    photoId?: IntFieldUpdateOperationsInput | number
    isMainPhoto?: BoolFieldUpdateOperationsInput | boolean
  }

  export type edgeValueUpdateWithoutModelInput = {
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeValueUncheckedUpdateWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type edgeValueUncheckedUpdateManyWithoutModelInput = {
    id?: IntFieldUpdateOperationsInput | number
    order?: FloatFieldUpdateOperationsInput | number
    renderName?: StringFieldUpdateOperationsInput | string
    optionName?: NullableStringFieldUpdateOperationsInput | string | null
    optionValue?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ElementImageCountOutputTypeDefaultArgs instead
     */
    export type ElementImageCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = ElementImageCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EdgeModelCountOutputTypeDefaultArgs instead
     */
    export type EdgeModelCountOutputTypeArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = EdgeModelCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use optionIntervalDefaultArgs instead
     */
    export type optionIntervalArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = optionIntervalDefaultArgs<ExtArgs>
    /**
     * @deprecated Use edgeModelOldDefaultArgs instead
     */
    export type edgeModelOldArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = edgeModelOldDefaultArgs<ExtArgs>
    /**
     * @deprecated Use optionValueDefaultArgs instead
     */
    export type optionValueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = optionValueDefaultArgs<ExtArgs>
    /**
     * @deprecated Use myfontsImageDefaultArgs instead
     */
    export type myfontsImageArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = myfontsImageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use elementImageDefaultArgs instead
     */
    export type elementImageArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = elementImageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use edgeModelDefaultArgs instead
     */
    export type edgeModelArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = edgeModelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use edgeContributorDefaultArgs instead
     */
    export type edgeContributorArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = edgeContributorDefaultArgs<ExtArgs>
    /**
     * @deprecated Use edgePhotoDefaultArgs instead
     */
    export type edgePhotoArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = edgePhotoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use edgeValueDefaultArgs instead
     */
    export type edgeValueArgs<ExtArgs extends $Extensions.Args = $Extensions.DefaultArgs> = edgeValueDefaultArgs<ExtArgs>

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