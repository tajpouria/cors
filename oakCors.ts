import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

interface Req {
  method: string;
  headers: {
    get(headerKey: string): string | null | undefined;
  };
}

interface Res {
  status?: number | string;
  headers: {
    get(headerKey: string): string | null | undefined;
    set(headerKey: string, headerValue: string): any;
  };
}

/**
 * oakCors middleware wrapper
 * @param o CorsOptions | CorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const oakCors = <
  RequestT extends Req = any,
  ResponseT extends Res = any,
  MiddlewareT extends (
    context: { request: RequestT; response: ResponseT },
    next: (...args: any) => any,
  ) => any = any
>(
  o?: CorsOptions | CorsOptionsDelegate<RequestT>,
) => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    CorsOptionsDelegate<RequestT>
  >(o);

  return (async ({ request, response }, next) => {
    try {
      const options = await corsOptionsDelegate(request);

      const corsOptions = Cors.produceCorsOptions(options || {});
      const originDelegate = Cors.produceOriginDelegate(corsOptions);

      if (originDelegate) {
        const requestMethod = request.method;
        const getRequestHeader = (headerKey: string) =>
          request.headers.get(headerKey);
        const getResponseHeader = (headerKey: string) =>
          response.headers.get(headerKey);
        const setResponseHeader = (headerKey: string, headerValue: string) =>
          response.headers.set(headerKey, headerValue);
        const setStatus = (statusCode: number) =>
          (response.status = statusCode);

        const origin = await originDelegate(getRequestHeader("origin"));

        if (!origin) next();
        else {
          corsOptions.origin = origin;

          return new Cors({
            corsOptions,
            requestMethod,
            getRequestHeader,
            getResponseHeader,
            setResponseHeader,
            setStatus,
            next,
          }).configureHeaders();
        }
      }
    } catch (error) {
      next();
    }
  }) as MiddlewareT;
};
