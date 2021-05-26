import type {
  CorsOptions,
  CorsOptionsDelegate,
  OriginDelegate,
} from "./types.ts";

interface DefaultCorsOptions {
  origin: string;
  methods: string;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

interface CorsProps {
  corsOptions: ReturnType<typeof Cors.produceCorsOptions>;
  requestMethod: string;
  getRequestHeader: (headerKey: string) => string | null | undefined;
  getResponseHeader: (headerKey: string) => string | null | undefined;
  setResponseHeader: (headerKey: string, headerValue: string) => any;
  setStatus: (statusCode: number) => any;
  next: (...args: any) => any;
  end: (...args: any) => any;
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

  public static produceCorsOptionsDelegate = <
    OptionsCallbackT = CorsOptionsDelegate<any>,
  >(
    o?: CorsOptions | OptionsCallbackT,
  ) =>
    typeof o === "function"
      ? (o as OptionsCallbackT)
      : ((((_request: any) => o) as unknown) as OptionsCallbackT);

  public static produceOriginDelegate = (
    corsOptions: CorsProps["corsOptions"],
  ) => {
    if (corsOptions.origin) {
      if (typeof corsOptions.origin === "function") {
        return corsOptions.origin as OriginDelegate;
      }

      return ((_requestOrigin) => corsOptions.origin) as OriginDelegate;
    }
  };

  public static isOriginAllowed = (
    requestOrigin: string | null | undefined,
    allowedOrigin: CorsOptions["origin"],
  ): boolean => {
    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.some((ao) =>
        Cors.isOriginAllowed(requestOrigin, ao)
      );
    } else if (typeof allowedOrigin === "string") {
      return requestOrigin === allowedOrigin;
    } else if (
      allowedOrigin instanceof RegExp &&
      typeof requestOrigin === "string"
    ) {
      return allowedOrigin.test(requestOrigin);
    } else return !!allowedOrigin;
  };

  public configureHeaders = () => {
    const {
      props: {
        corsOptions,
        requestMethod,
        setResponseHeader,
        setStatus,
        next,
        end,
      },
      configureOrigin,
    } = this;

    if (
      typeof requestMethod === "string" &&
      requestMethod.toUpperCase() === "OPTIONS"
    ) {
      configureOrigin()
        .configureCredentials()
        .configureMethods()
        .configureAllowedHeaders()
        .configureMaxAge()
        .configureExposedHeaders();

      if (corsOptions.preflightContinue) return next();
      else {
        setStatus(corsOptions.optionsSuccessStatus);
        setResponseHeader("Content-Length", "0");

        return end();
      }
    } else {
      configureOrigin().configureCredentials().configureExposedHeaders();

      return next();
    }
  };

  private configureOrigin = () => {
    const {
      props: { corsOptions, getRequestHeader, setResponseHeader },
      setVaryHeader,
    } = this;

    if (!corsOptions.origin || corsOptions.origin === "*") {
      setResponseHeader("Access-Control-Allow-Origin", "*");
    } else if (typeof corsOptions.origin === "string") {
      setResponseHeader("Access-Control-Allow-Origin", corsOptions.origin);
      setVaryHeader("Origin");
    } else {
      const requestOrigin = getRequestHeader("origin") ??
        getRequestHeader("Origin");

      setResponseHeader(
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
    const { corsOptions, setResponseHeader } = this.props;

    if (corsOptions.credentials === true) {
      setResponseHeader("Access-Control-Allow-Credentials", "true");
    }

    return this;
  };

  private configureMethods = () => {
    const { corsOptions, setResponseHeader } = this.props;

    let methods = corsOptions.methods;

    setResponseHeader(
      "Access-Control-Allow-Methods",
      Array.isArray(methods) ? methods.join(",") : methods,
    );

    return this;
  };

  private configureAllowedHeaders = () => {
    const {
      props: { corsOptions, getRequestHeader, setResponseHeader },
      setVaryHeader,
    } = this;

    let allowedHeaders = corsOptions.allowedHeaders;

    if (!allowedHeaders) {
      allowedHeaders = getRequestHeader("access-control-request-headers") ??
        getRequestHeader("Access-Control-Request-Headers") ??
        undefined;

      setVaryHeader("Access-Control-request-Headers");
    }

    if (allowedHeaders?.length) {
      setResponseHeader(
        "Access-Control-Allow-Headers",
        Array.isArray(allowedHeaders)
          ? allowedHeaders.join(",")
          : allowedHeaders,
      );
    }

    return this;
  };

  private configureMaxAge = () => {
    const { corsOptions, setResponseHeader } = this.props;

    const maxAge = (typeof corsOptions.maxAge === "number" ||
      typeof corsOptions.maxAge === "string") &&
      corsOptions.maxAge.toString();

    if (maxAge && maxAge.length) {
      setResponseHeader("Access-Control-Max-Age", maxAge);
    }

    return this;
  };

  private configureExposedHeaders = () => {
    const { corsOptions, setResponseHeader } = this.props;

    let exposedHeaders = corsOptions.exposedHeaders;

    if (exposedHeaders?.length) {
      setResponseHeader(
        "Access-Control-Expose-Headers",
        Array.isArray(exposedHeaders)
          ? exposedHeaders.join(",")
          : exposedHeaders,
      );
    }

    return this;
  };

  private setVaryHeader = (field: string) => {
    const {
      props: { getResponseHeader, setResponseHeader },
      appendVaryHeader,
    } = this;

    let existingHeader = getResponseHeader("Vary") ?? "";

    if (
      existingHeader &&
      typeof existingHeader === "string" &&
      (existingHeader = appendVaryHeader(existingHeader, field))
    ) {
      setResponseHeader("Vary", existingHeader);
    }
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
