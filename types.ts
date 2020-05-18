export type OriginDelegate = (
  requestOrigin: string | undefined | null,
  callback: (err: Error | null, allow?: CorsOptions["origin"]) => void,
) => void;

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

export type CorsOptionsDelegate<RT> = (
  r: RT,
  callback: (error: Error | null, options?: CorsOptions) => void,
) => void;
