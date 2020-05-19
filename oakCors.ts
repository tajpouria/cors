import { OakMiddleware, OakRequest } from "./deps.ts";

import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

export type OakCorsOptionsDelegate = CorsOptionsDelegate<OakRequest>;

/**
 * OakCors middleware
 * @param o CorsOptions | OakCorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const oakCors = (
  o?: CorsOptions | OakCorsOptionsDelegate,
): OakMiddleware => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    OakCorsOptionsDelegate
  >(o);

  return async ({ request, response }, next) => {
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

          new Cors({
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
  };
};
