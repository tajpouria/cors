import { AbcMiddleWare, AbcRequest } from "./deps.ts";

import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

export type AbcCorsOptionsDelegate = CorsOptionsDelegate<AbcRequest>;

/**
 * abcCors middleware wrapper
 * @param o CorsOptions | AbcCorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const abcCors = (
  o?: CorsOptions | AbcCorsOptionsDelegate,
): AbcMiddleWare => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    AbcCorsOptionsDelegate
  >(o);

  return (abcNext) => async (c) => {
    const next = () => abcNext(c);

    try {
      const { request, response } = c;

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
      return next();
    }
  };
};
