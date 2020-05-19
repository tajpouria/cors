/**
 * @link https://github.com/tajpouria/cors#configuration-options
 */
export type CorsOptions = {
  allowedHeaders?: string | string[];
  credentials?: boolean;
  exposedHeaders?: string | string[];
  maxAge?: number;
  methods?: string | string[];
  optionsSuccessStatus?: number;
  origin?: boolean | string | RegExp | (string | RegExp)[] | OriginDelegate;
  preflightContinue?: boolean;
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
