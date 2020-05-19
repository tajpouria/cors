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

export type OriginDelegate = (
  requestOrigin: string | undefined | null,
) => CorsOptions["origin"] | void | Promise<CorsOptions["origin"] | void>;

export type CorsOptionsDelegate<RequestT = any> = (
  request: RequestT,
) => CorsOptions | void | Promise<CorsOptions | void>;
