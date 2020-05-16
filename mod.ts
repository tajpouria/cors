import { Middleware, Response, HTTPMethods } from "./deps";

type CustomOrigin = (
  requestOrigin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => void;

export interface CorsOptions {
  origin?: boolean | string | RegExp | (string | RegExp)[] | CustomOrigin;
  methods?: HTTPMethods | HTTPMethods[];
  allowedHeaders?: string | string[];
  exposedHeaders?: string | string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

export type CorsOptionsDelegate = (
  request: Response,
  callback: (error: Error | null, options?: CorsOptions) => void,
) => void;

export default (options: CorsOptions | CorsOptionsDelegate): Middleware => {
  let optionsCallback: CorsOptionsDelegate | null = null;

  if (typeof options === "function") optionsCallback = options;
  else
    optionsCallback = ((request, cb) => {
      cb(null, options);
    }) as CorsOptionsDelegate;

  const corsMiddleware: Middleware = ({ request, response }, next) => {
    optionsCallback(request, (err, options) => {
      if (err) next(err);
      else {
        const defaults: CorsOptions = {
          origin: "*",
          methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
          preflightContinue: false,
          optionsSuccessStatus: 204,
        };

        const corsOptions = Object.assign({}, defaults, options);
        // TODO: Type??
        let originCallback = null;

        if (corsOptions.origin && typeof corsOptions.origin === "function")
          originCallback = corsOptions.origin;
        else if (corsOptions.origin)
          originCallback = (origin, cb) => {
            cb(null, !!corsOptions.origin);
          };

        if (originCallback) {
          originCallback(request.headers.origin, (err2, origin) => {
            if (err2 || !origin) {
              next(err2);
            } else {
              corsOptions.origin = origin;
              cors(corsOptions, request, response, next);
            }
          });
        } else {
          next();
        }
      }
    });
  };

  return corsMiddleware;
};

type Next = () => Promise<void>;
interface HeaderKeyVal {
  key: string;
  value: string;
}

function cors(
  options: CorsOptions,
  request: Response,
  response: Response,
  next: Next,
): void {
  const headers: HeaderKeyVal[] = [],
    method =
      request.method &&
      request.method.toUpperCase &&
      request.method.toUpperCase();

  if (method === "OPTIONS") {
    // TODO: Make it not to push null
    configureOrigin(options, request).forEach((h) => headers.push(h));
    headers.push(configureCredentials(options));
    headers.push(configureMethods(options));
    configureAllowedHeaders(options, request).forEach((h) => headers.push(h));
    headers.push(configureMaxAge(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, response);

    if (options.preflightContinue) next();
    else {
      response.statusCode = options.optionsSuccessStatus;
      response.setHeader("Content-Length", "0");
      response.end();
    }
  } else {
    configureOrigin(options, request).forEach((h) => headers.push(h));
    headers.push(configureCredentials(options));
    headers.push(configureExposedHeaders(options));
    applyHeaders(headers, response);
    next();
  }
}

function configureOrigin(
  options: CorsOptions,
  response: Response,
): HeaderKeyVal[] {
  const responseOrigin: string | null = response.headers.get("origin");
  const headers: HeaderKeyVal[] = [];
  let isAllowed: boolean = false;

  if (!options.origin || options.origin === "*") {
    headers.push({
      key: "Access-Control-Allow-Origin",
      value: "*",
    });
  } else if (typeof options.origin === "string") {
    headers.push({
      key: "Access-Control-Allow-Origin",
      value: options.origin,
    });
    headers.push({
      key: "Vary",
      value: "Origin",
    });
  } else {
    isAllowed = isOriginAllowed(responseOrigin, options.origin);

    headers.push({
      key: "Access-Control-Allow-Origin",
      value: isAllowed ? responseOrigin : "false",
    });
    headers.push({
      key: "Vary",
      value: "Origin",
    });
  }

  return headers;
}

function isOriginAllowed(
  origin: string | null,
  allowedOrigin: CorsOptions["origin"],
): boolean {
  if (Array.isArray(allowedOrigin))
    return allowedOrigin.some((ao) => isOriginAllowed(origin, ao));
  else if (typeof allowedOrigin === "string") return origin === allowedOrigin;
  else if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
  else return !!allowedOrigin;
}

function configureCredentials(options: CorsOptions): HeaderKeyVal {
  if (options.credentials === true)
    return {
      key: "Access-Control-Allow-Credentials",
      value: "true",
    };

  return null;
}

function configureMethods(options: CorsOptions): HeaderKeyVal {
  let methods = options.methods;
  if (Array.isArray(methods)) methods = options.methods.join(",");

  return {
    key: "Access-Control-Allow-Methods",
    value: methods,
  };
}

function configureAllowedHeaders(
  options: CorsOptions,
  response: Response,
): HeaderKeyVal[] {
  let allowedHeaders = options.allowedHeaders;
  const headers: HeaderKeyVal[] = [];

  if (!allowedHeaders) {
    allowedHeaders = response.headers.get("access-control-request-headers");
    headers.push({
      key: "Vary",
      value: "Access-Control-request-Headers",
    });
  } else if (Array.isArray(allowedHeaders))
    allowedHeaders = allowedHeaders.join(",");

  if (allowedHeaders && allowedHeaders.length) {
    headers.push({
      key: "Access-Control-Allow-Headers",
      value: allowedHeaders as string,
    });
  }

  return headers;
}

function configureMaxAge(options: CorsOptions): HeaderKeyVal {
  const maxAge =
    (typeof options.maxAge === "number" || options.maxAge) &&
    options.maxAge.toString();

  if (maxAge && maxAge.length)
    return {
      key: "Access-Control-Max-Age",
      value: maxAge,
    };

  return null;
}

function configureExposedHeaders(options: CorsOptions): HeaderKeyVal {
  let headers = options.exposedHeaders;
  if (!headers) return null;
  else if (Array.isArray(headers)) headers = headers.join(",");

  if (headers && headers.length)
    return {
      key: "Access-Control-Expose-Headers",
      value: headers,
    };

  return null;
}

function applyHeaders(headers: HeaderKeyVal[], response: Response): void {
  headers.forEach((h) => {
    if (h.key === "Vary" && h.value) {
      vary(response, h.value);
    } else if (h.value) {
      response.setHeader(h.key, h.value);
    }
  });
}
