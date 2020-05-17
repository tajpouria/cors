import { Middleware, Response } from "./deps.ts";

type CustomOrigin = (
  requestOrigin: string | undefined | null,
  callback: (err: Error | null, allow?: boolean) => void,
) => void;

interface DefaultCorsOptions {
  origin: string;
  methods: string;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export type CorsOptions = {
  allowedHeaders?: string | string[];
  credentials?: boolean;
  exposedHeaders?: string | string[];
  maxAge?: number;
  methods?: string | string[];
  optionsSuccessStatus?: number;
  origin?: boolean | string | RegExp | (string | RegExp)[] | CustomOrigin;
  preflightContinue?: boolean;
};

export type CorsOptionsDelegate = (
  response: Response,
  callback: (error: Error | null, options?: CorsOptions) => void,
) => void;

export default (options?: CorsOptions | CorsOptionsDelegate): Middleware => {
  let optionsCallback: CorsOptionsDelegate | null = null;

  if (typeof options === "function") optionsCallback = options;
  else
    optionsCallback = ((_, callback) => {
      callback(null, options);
    }) as CorsOptionsDelegate;

  const corsMiddleware: Middleware = ({ request, response }, next) => {
    optionsCallback!(response, (err, options) => {
      if (err) next();
      else {
        const defaultCorsOptions = {
          origin: "*",
          methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
          preflightContinue: false,
          optionsSuccessStatus: 204,
        };

        const corsOptions = Cors.produceCorsOptions(
          defaultCorsOptions,
          options,
        );
        let originCallback = null;

        if (corsOptions.origin && typeof corsOptions.origin === "function")
          originCallback = corsOptions.origin;
        else if (corsOptions.origin)
          originCallback = (origin: any, cb: any) => {
            cb(null, corsOptions.origin);
          };

        if (originCallback)
          originCallback(response.headers.get("origin"), (err2, origin) => {
            if (err2 || !origin) next();
            else {
              corsOptions.origin = origin;

              new Cors({
                corsOptions,
                requestMethod: request.method,
                getHeader: (headerKey) => response.headers.get(headerKey),
                setHeader: (headerKey, headerValue) =>
                  response.headers.set(headerKey, headerValue),
                setStatus: (statusCode) => (response.status = statusCode),
                next,
              }).action();
            }
          });
        else next();
      }
    });
  };

  return corsMiddleware;
};

interface CorsProps {
  corsOptions: ReturnType<typeof Cors.produceCorsOptions>;
  requestMethod: string;
  getHeader: (headerKey: string) => any;
  setHeader: (headerKey: string, headerValue: string) => any;
  setStatus: (statusCode: number | number) => any;
  next: (...args: any) => any;
}

class Cors {
  constructor(private props: CorsProps) {}

  public static produceCorsOptions = (
    defaultCorsOptions: DefaultCorsOptions,
    corsOptions: CorsOptions = {},
  ) => ({
    ...defaultCorsOptions,
    ...corsOptions,
  });

  public action = () => {
    const {
      props: { corsOptions, requestMethod, setHeader, setStatus, next },
      configureOrigin,
    } = this;

    const method =
      typeof requestMethod === "string" && requestMethod.toUpperCase();

    if (method === "OPTIONS") {
      configureOrigin()
        .configureCredentials()
        .configureMethods()
        .configureAllowedHeaders()
        .configureMaxAge()
        .configureExposedHeaders();

      if (corsOptions.preflightContinue) next();
      else {
        setStatus(corsOptions.optionsSuccessStatus);
        setHeader("Content-Length", "0");
      }
    } else {
      configureOrigin().configureCredentials().configureExposedHeaders();

      next();
    }
  };

  private configureOrigin = () => {
    const { corsOptions, getHeader, setHeader } = this.props;

    const responseOrigin = getHeader("origin");
    let isAllowed: boolean = false;

    if (!corsOptions.origin || corsOptions.origin === "*") {
      setHeader("Access-Control-Allow-Origin", "*");
    } else if (typeof corsOptions.origin === "string") {
      setHeader("Access-Control-Allow-Origin", corsOptions.origin);
      setHeader("Vary", "Origin");
    } else {
      isAllowed = isOriginAllowed(responseOrigin, corsOptions.origin);

      setHeader(
        "Access-Control-Allow-Origin",
        isAllowed ? (responseOrigin as string) : "false",
      );
      setHeader("Vary", "Origin");
    }

    return this;
  };

  private configureCredentials = () => {
    const { corsOptions, setHeader } = this.props;

    if (corsOptions.credentials === true)
      setHeader("Access-Control-Allow-Credentials", "true");

    return this;
  };

  private configureMethods = () => {
    const { corsOptions, setHeader } = this.props;

    let methods = corsOptions.methods;

    setHeader(
      "Access-Control-Allow-Methods",
      Array.isArray(methods) ? methods.join(",") : methods,
    );

    return this;
  };

  private configureAllowedHeaders = () => {
    const {
      props: { corsOptions, getHeader, setHeader },
      setVaryHeader,
    } = this;

    const responseAllowedHeaders = getHeader("access-control-request-headers");
    let allowedHeaders = corsOptions.allowedHeaders;

    if (!allowedHeaders) {
      allowedHeaders = responseAllowedHeaders;

      setVaryHeader("Access-Control-request-Headers");
    }

    if (allowedHeaders?.length) {
      setHeader(
        "Access-Control-Allow-Headers",
        Array.isArray(allowedHeaders)
          ? allowedHeaders.join(",")
          : allowedHeaders,
      );
    }

    return this;
  };

  private configureMaxAge = () => {
    const { corsOptions, setHeader } = this.props;

    const maxAge =
      (typeof corsOptions.maxAge === "number" ||
        typeof corsOptions.maxAge === "string") &&
      corsOptions.maxAge.toString();

    if (maxAge && maxAge.length) setHeader("Access-Control-Max-Age", maxAge);

    return this;
  };

  private setVaryHeader = (field: string) => {
    const {
      props: { getHeader, setHeader },
      appendVaryHeader,
    } = this;

    let existingHeader = getHeader("Vary") || "";

    if (
      (existingHeader = appendVaryHeader(
        Array.isArray(existingHeader)
          ? existingHeader.join(", ")
          : existingHeader,
        field,
      ))
    )
      setHeader("Vary", existingHeader);
  };

  private configureExposedHeaders = () => {
    const { corsOptions, setHeader } = this.props;

    let exposedHeaders = corsOptions.exposedHeaders;

    if (exposedHeaders?.length)
      setHeader(
        "Access-Control-Expose-Headers",
        Array.isArray(exposedHeaders)
          ? exposedHeaders.join(",")
          : exposedHeaders,
      );

    return this;
  };

  appendVaryHeader = (header: string, field: string | string[]) => {
    const { parseVaryHeader } = this;

    if (header === "*") return header;

    let headerTemp = header;
    const fields = Array.isArray(field) ? field : parseVaryHeader(field);

    if (fields.includes("*")) return "*";

    var currentValues = parseVaryHeader(header.toLowerCase());

    fields.forEach((field, i) => {
      var fld = field.toLowerCase();

      if (currentValues.includes(fld)) {
        currentValues.push(fld);
        headerTemp = headerTemp ? `${headerTemp}, ${field}` : field;
      }
    });

    return headerTemp;
  };

  parseVaryHeader = (header: string) => {
    let end = 0;
    const list = [];
    let start = 0;

    for (let i = 0; i < header.length; i++) {
      switch (header.charCodeAt(i)) {
        case 0x20 /*   */:
          if (start === end) {
            start = end = i + 1;
          }
          break;
        case 0x2c /* , */:
          list.push(header.substring(start, end));
          start = end = i + 1;
          break;
        default:
          end = i + 1;
          break;
      }
    }

    list.push(header.substring(start, end));

    return list;
  };
}

function isOriginAllowed(
  origin: string | null,
  allowedOrigin: CorsOptions["origin"],
): boolean {
  if (Array.isArray(allowedOrigin))
    return allowedOrigin.some((ao) => isOriginAllowed(origin, ao));
  else if (typeof allowedOrigin === "string") return origin === allowedOrigin;
  else if (allowedOrigin instanceof RegExp)
    return allowedOrigin.test(origin as string);
  else return !!allowedOrigin;
}
