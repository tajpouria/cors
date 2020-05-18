import { OakMiddleware, OakResponse } from "./deps.ts";

import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

export type OakCorsOptionsDelegate = CorsOptionsDelegate<OakResponse>;

export const oakCors = (
  o?: CorsOptions | OakCorsOptionsDelegate,
): OakMiddleware => {
  const optionsCallback = Cors.produceOptionsCallback<OakCorsOptionsDelegate>(
    o,
  );

  return ({ request, response }, next) => {
    optionsCallback(response, (optionsError, options) => {
      if (optionsError) next();
      else {
        const corsOptions = Cors.produceCorsOptions(options);
        const originCallback = Cors.produceOriginCallback(corsOptions);

        if (originCallback) {
          const requestMethod = request.method;
          const getHeader = (headerKey: string) =>
            response.headers.get(headerKey);
          const setHeader = (headerKey: string, headerValue: string) =>
            response.headers.set(headerKey, headerValue);
          const setStatus = (statusCode: number) =>
            (response.status = statusCode);

          originCallback(
            getHeader("origin") ?? getHeader("Origin"),
            (originError, origin) => {
              if (originError || !origin) next();
              else {
                corsOptions.origin = origin;

                new Cors({
                  corsOptions,
                  requestMethod,
                  getHeader,
                  setHeader,
                  setStatus,
                  next,
                }).configureHeaders();
              }
            },
          );
        } else next();
      }
    });
  };
};
