import type { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

interface Req {
  method: string;
  headers: {
    get(name: string): string | null | undefined;
  };
}

interface Res {
  setStatus(code: any): this;
  set(headerKey: string, headerValue: string): this;
  get(headerKey: string): string | null | undefined;
}

/**
 * opineCors middleware wrapper
 * @param o CorsOptions | CorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const opineCors = <
  RequestT extends Req = Req,
  ResponseT extends Res = any,
  MiddlewareT extends (
    request: RequestT,
    response: ResponseT,
    next: (...args: any) => any,
  ) => any = any,
>(
  o?: CorsOptions | CorsOptionsDelegate<RequestT>,
) => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    CorsOptionsDelegate<RequestT>
  >(o);

  return (async (request, response, next) => {
    try {
      const options = await corsOptionsDelegate(request);

      const corsOptions = Cors.produceCorsOptions(options || {});
      const originDelegate = Cors.produceOriginDelegate(corsOptions);

      if (originDelegate) {
        const requestMethod = request.method;
        const getRequestHeader = (headerKey: string) =>
          request.headers.get(headerKey);
        const getResponseHeader = (headerKey: string) =>
          response.get(headerKey);
        const setResponseHeader = (headerKey: string, headerValue: string) =>
          response.set(headerKey, headerValue);
        const setStatus = (statusCode: number) =>
          response.setStatus(statusCode);

        const origin = await originDelegate(getRequestHeader("origin"));

        if (!origin) return next();
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
      console.error(error);
    }

    return next();
  }) as MiddlewareT;
};
