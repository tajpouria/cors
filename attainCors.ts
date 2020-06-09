import { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";
import { Request } from "https://deno.land/x/attain/mod.ts";
import { CallBackType } from "https://deno.land/x/attain/types.ts";

export const attainCors = (
  o?: CorsOptions | CorsOptionsDelegate<Request>,
) => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    CorsOptionsDelegate<Request>
  >(o);

  return async function cors(request, response) {
    try {
      const fakeNext = () => undefined;
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
          response.status(statusCode)

        const origin = await originDelegate(getRequestHeader("origin"));

        if (origin) {
          corsOptions.origin = origin;

          new Cors({
            corsOptions,
            requestMethod,
            getRequestHeader,
            getResponseHeader,
            setResponseHeader,
            setStatus,
            next: fakeNext,
          }).configureHeaders();
        }
      }
    } catch (error) {
      throw error
    }
  } as CallBackType;
};