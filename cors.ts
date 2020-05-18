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
    corsOptions?: CorsOptions | OptionsCallbackT,
  ) =>
    typeof corsOptions === "function"
      ? (corsOptions as OptionsCallbackT)
      : ((((_: any, callback: any) => {
          callback(null, corsOptions);
        }) as unknown) as OptionsCallbackT);

  public static produceOriginCallback = (
    corsOptions: CorsProps["corsOptions"],
  ) => {
    if (corsOptions.origin) {
      if (typeof corsOptions.origin === "function")
        return corsOptions.origin as OriginDelegate;

      return ((_, callback) => {
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
    else if (allowedOrigin instanceof RegExp)
      return allowedOrigin.test(origin as string);
    else return !!allowedOrigin;
  };

  public configureHeaders = () => {
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

    if (!corsOptions.origin || corsOptions.origin === "*")
      setHeader("Access-Control-Allow-Origin", "*");
    else if (typeof corsOptions.origin === "string") {
      setHeader("Access-Control-Allow-Origin", corsOptions.origin);
      setHeader("Vary", "Origin");
    } else {
      isAllowed = Cors.isOriginAllowed(responseOrigin, corsOptions.origin);

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
      allowedHeaders = responseAllowedHeaders ?? undefined;

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

  private appendVaryHeader = (header: string, field: string | string[]) => {
    const { parseVaryHeader } = this;

    if (header === "*") return header;

    let headerTemp = header;
    const fields = Array.isArray(field) ? field : parseVaryHeader(field);

    if (fields.includes("*")) return "*";

    const currentValues = parseVaryHeader(header.toLowerCase());

    fields.forEach((field) => {
      const fld = field.toLowerCase();

      if (currentValues.includes(fld)) {
        currentValues.push(fld);
        headerTemp = headerTemp ? `${headerTemp}, ${field}` : field;
      }
    });

    return headerTemp;
  };

  private parseVaryHeader = (header: string) => {
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
