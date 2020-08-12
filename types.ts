/**
 * CorsOptions
 *
 * An Object that describes how CORS middleware should behave. The default configuration is the equivalent of:
 *
 * ```ts
 * {
 *  "origin": "*",
 *  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
 *  "preflightContinue": false,
 *  "optionsSuccessStatus": 204,
 * }
 * ```
 *
 * @link https://github.com/tajpouria/cors#configuration-options
 */
export type CorsOptions = {
  /**
   * Configures the Access-Control-Allow-Origin CORS header.
   *
   * Examples:
   *
   * - Boolean
   *
   * set origin to true to reflect the request origin, as defined by req.header('Origin'):
   *
   * ```ts
   * app.use(cors({ origin: true }));
   *
   * ```
   * or set it to false to disable CORS:
   *
   * ```ts
   * app.use(cors({ origin: false }));
   *
   * ```
   *
   * - String
   *
   * set origin to a specific origin. For example if you set it to "http://example.com" only requests from "http://example.com" will be allowed:
   *
   * ```ts
   * app.use(cors({ origin: 'http://example.com' }));
   *
   * ```
   *
   * - RegExp
   *
   * set origin to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern /example\.com$/ will reflect any request that is coming from an origin ending with "example.com":
   *
   * ```ts
   * app.use(cors({ origin: /example\.com$/ }));
   *
   * ```
   *
   * - Array
   *
   * set origin to an array of valid origins. Each origin can be a String or a RegExp. For example ["http://example1.com", /\.example2\.com$/] will accept any request from "http://example1.com" or from a subdomain of "example2.com":
   *
   * ```ts
   * app.use(cors({ origin: ["http://example1.com", /\.example2\.com$/] }));
   *
   * ```
   *
   * - Function
   *
   * set origin to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (called as callback(err, origin), where origin is a non-function value of the origin option) as the second:
   *
   * ```ts
   * app.use(cors({
   *   origin: async (requestOrigin) => {
   *     await loadOriginsFromDataBase(); // Simulate asynchronous task
   *     return ["http://example1.com", /\.example2\.com$/];
   *    },
   *  }));
   *
   * ```
   *
   */
  origin?: boolean | string | RegExp | (string | RegExp)[] | OriginDelegate;

  /**
   * Configures the Access-Control-Allow-Methods CORS header.
   *
   * Examples:
   *
   * - String
   *
   * Expects a comma-delimited string (ex: 'GET,PUT,POST'):
   *
   * ```ts
   * app.use(cors({ methods: 'GET,PUT,POST' }));
   *
   * ```
   *
   * - Array
   *
   * or an array (ex: ['GET', 'PUT', 'POST'])
   *
   * ```ts
   * app.use(cors({ methods: ['GET', 'PUT', 'POST'] }));
   *
   * ```
   *
   */
  methods?: string | string[];

  /**
   * Configures the Access-Control-Allow-Headers CORS header. If not specified, defaults to reflecting the headers specified in the request's Access-Control-Request-Headers header.
   *
   * Examples:
   *
   * - String
   *
   * Expects a comma-delimited string (ex: 'Content-Type,Authorization'):
   *
   * ```ts
   * app.use(cors({ allowedHeaders: 'Content-Type,Authorization' }));
   *
   * ```
   *
   * - Array
   *
   * or an array (ex: ['Content-Type', 'Authorization']):
   *
   * ```ts
   * app.use(cors({ allowedHeaders: ['Content-Type', 'Authorization'] }));
   *
   * ```
   *
   */
  allowedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Expose-Headers CORS header. If not specified, no custom headers are exposed.
   *
   * Examples:
   *
   * - String
   *
   * Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range'):
   *
   * ```ts
   * app.use(cors({ exposedHeaders: 'Content-Range,X-Content-Range' }));
   *
   * ```
   *
   */
  exposedHeaders?: string | string[];

  /**
   * Configures the Access-Control-Allow-Credentials CORS header. It is omitted by default.
   *
   * Examples:
   *
   * - Boolean
   *
   * Set to true to pass the header:
   *
   * ```ts
   * app.use(cors({ credentials: true }));
   *
   * ```
   *
   */
  credentials?: boolean;

  /**
   * Configures the Access-Control-Max-Age CORS header. It is omitted by default.
   *
   * Examples:
   *
   * - Number
   *
   * Set to an integer to pass the header:
   *
   * ```ts
   * app.use(cors({ maxAge: 1 }));
   *
   * ```
   *
   */
  maxAge?: number;

  /**
   * Pass the CORS preflight response to the next handler:
   *
   * Examples:
   *
   * - Boolean
   *
   * ```ts
   * app.use(cors({ preflightContinue: true }));
   *
   * ```
   *
   */
  preflightContinue?: boolean;

  /**
   * Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
   *
   * Examples:
   *
   * - Number
   *
   * ```ts
   * app.use(cors({ optionsSuccessStatus: 200 }));
   *
   * ```
   *
   */
  optionsSuccessStatus?: number;
};

/**
 * @link https://github.com/tajpouria/cors#configuring-cors-w-dynamic-origin
 */
export type OriginDelegate = (
  requestOrigin: string | undefined | null,
) => CorsOptions["origin"] | void | Promise<CorsOptions["origin"] | void>;

/**
 * @link https://github.com/tajpouria/cors#configuring-cors-asynchronously
 */
export type CorsOptionsDelegate<RequestT = any> = (
  request: RequestT,
) => CorsOptions | void | Promise<CorsOptions | void>;
