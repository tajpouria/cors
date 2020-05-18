import { CorsOptions, OriginDelegate, CorsOptionsDelegate } from "./types.ts";

interface DefaultCorsOptions {
  origin: string;
  methods: string;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

interface CorsProps {
  corsOptions: ReturnType<typeof Cors.produceCorsOptions>;
  requestMethod: string;
  getHeader: (headerKey: string) => string | null | undefined;
  setHeader: (headerKey: string, headerValue: string) => any;
  setStatus: (statusCode: number) => any;
  next: (...args: any) => any;
}

export class Cors {
  constructor(private props: CorsProps) {}

  public static produceCorsOptions = (
    corsOptions: CorsOptions = {},
    defaultCorsOptions: DefaultCorsOptions = {
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  ) => ({
    ...defaultCorsOptions,
    ...corsOptions,
  });

  public static produceOptionsCallback = <
    OptionsCallbackT = CorsOptionsDelegate<any>
  >(
    o?: CorsOptions | OptionsCallbackT,
  ) =>
    typeof o === "function"
      ? (o as OptionsCallbackT)
      : ((((_r: any, callback: any) => {
          callback(null, o);
        }) as unknown) as OptionsCallbackT);

  public static produceOriginCallback = (
    corsOptions: CorsProps["corsOptions"],
  ) => {
    if (corsOptions.origin) {
      if (typeof corsOptions.origin === "function")
        return corsOptions.origin as OriginDelegate;

      return ((_origin, callback) => {
        callback(null, corsOptions.origin);
      }) as OriginDelegate;
    }
  };

  public static isOriginAllowed = (
    origin: string | null | undefined,
    allowedOrigin: CorsOptions["origin"],
  ): boolean => {
    if (Array.isArray(allowedOrigin))
      return allowedOrigin.some((ao) => Cors.isOriginAllowed(origin, ao));
    else if (typeof allowedOrigin === "string") return origin === allowedOrigin;
    else if (allowedOrigin instanceof RegExp && typeof origin === "string")
      return allowedOrigin.test(origin);
    else return !!allowedOrigin;
  };

  public configureHeaders = () => {
    const {
      props: { corsOptions, requestMethod, setHeader, setStatus, next },
      configureOrigin,
    } = this;

    if (
      requestMethod === "string" &&
      requestMethod.toUpperCase() === "OPTIONS"
    ) {
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
        next();
      }
    } else {
      configureOrigin().configureCredentials().configureExposedHeaders();

      next();
    }
  };

  private configureOrigin = () => {
    const {
      props: { corsOptions, getHeader, setHeader },
      setVaryHeader,
    } = this;

    const requestOrigin = getHeader("origin") ?? getHeader("Origin");

    if (!corsOptions.origin || corsOptions.origin === "*")
      setHeader("Access-Control-Allow-Origin", "*");
    else if (typeof corsOptions.origin === "string") {
      setHeader("Access-Control-Allow-Origin", corsOptions.origin);
      setVaryHeader("Origin");
    } else {
      setHeader(
        "Access-Control-Allow-Origin",
        Cors.isOriginAllowed(requestOrigin, corsOptions.origin)
          ? (requestOrigin as string)
          : "false",
      );
      setVaryHeader("Origin");
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

    let allowedHeaders = corsOptions.allowedHeaders;

    if (!allowedHeaders) {
      allowedHeaders =
        getHeader("access-control-request-headers") ??
        getHeader("Access-Control-Request-Headers") ??
        undefined;

      setVaryHeader("Access-Control-request-Headers");
    }

    if (allowedHeaders?.length)
      setHeader(
        "Access-Control-Allow-Headers",
        Array.isArray(allowedHeaders)
          ? allowedHeaders.join(",")
          : allowedHeaders,
      );

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

  private setVaryHeader = (field: string) => {
    const {
      props: { getHeader, setHeader },
      appendVaryHeader,
    } = this;

    let existingHeader = getHeader("Vary") ?? "";

    if (
      existingHeader &&
      typeof existingHeader === "string" &&
      (existingHeader = appendVaryHeader(existingHeader, field))
    )
      setHeader("Vary", existingHeader);
  };

  private appendVaryHeader = (header: string, field: string) => {
    const { parseVaryHeader } = this;

    if (header === "*") return header;

    let varyHeader = header;
    const fields = parseVaryHeader(field);
    const headers = parseVaryHeader(header.toLocaleLowerCase());

    if (fields.includes("*") || headers.includes("*")) return "*";

    fields.forEach((field) => {
      const fld = field.toLowerCase();

      if (headers.includes(fld)) {
        headers.push(fld);
        varyHeader = varyHeader ? `${varyHeader}, ${field}` : field;
      }
    });

    return varyHeader;
  };

  private parseVaryHeader = (header: string) => {
    let end = 0;
    const list = [];
    let start = 0;

    for (let i = 0, len = header.length; i < len; i++) {
      switch (header.charCodeAt(i)) {
        case 0x20 /*   */:
          if (start === end) start = end = i + 1;
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
