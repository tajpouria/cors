import { OakMiddleware, OakRequest } from "./deps.ts";

import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

export type OakCorsOptionsDelegate = CorsOptionsDelegate<OakRequest>;

export const oakCors = (
  o?: CorsOptions | OakCorsOptionsDelegate,
): OakMiddleware => {
  const optionsCallback = Cors.produceOptionsCallback<OakCorsOptionsDelegate>(
    o,
  );

  return ({ request, response }, next) => {
    optionsCallback(request, (optionsError, options) => {
      debugger;
      if (optionsError) next();
      else {
        const corsOptions = Cors.produceCorsOptions(options);
        const originCallback = Cors.produceOriginCallback(corsOptions);

        if (originCallback) {
          const requestMethod = request.method;
          const getRequestHeader = (headerKey: string) =>
            request.headers.get(headerKey);
          const getResponseHeader = (headerKey: string) =>
            request.headers.get(headerKey);
          const setResponseHeader = (headerKey: string, headerValue: string) =>
            response.headers.set(headerKey, headerValue);
          const setStatus = (statusCode: number) =>
            (response.status = statusCode);

          originCallback(getRequestHeader("origin"), (originError, origin) => {
            if (originError || !origin) next();
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
          });
        } else next();
      }
    });
  };
};
