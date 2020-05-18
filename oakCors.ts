import { OakMiddleware, OakResponse } from "./deps.ts";

import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

export type OakCorsOptionsDelegate = CorsOptionsDelegate<OakResponse>;

export const oakCors = (
  corsOptions?: CorsOptions | OakCorsOptionsDelegate,
): OakMiddleware => {
  const optionsCallback = Cors.produceOptionsCallback<OakCorsOptionsDelegate>(
    corsOptions,
  );

  return ({ request, response }, next) => {
    optionsCallback(response, (err, options) => {
      if (err) next();
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
            getHeader("origin") || getHeader("Origin"),
            (err2, origin) => {
              if (err2 || !origin) next();
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
