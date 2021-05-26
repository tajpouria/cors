import type { CorsOptions, CorsOptionsDelegate } from "./types.ts";
import { Cors } from "./cors.ts";

interface Req {
  method: string;
  headers: {
    get(headerKey: string): string | null | undefined;
  };
}

interface Res {
  status: (status: number) => any;
  headers: {
    get(headerKey: string): string | null | undefined;
    set(headerKey: string, headerValue: string): any;
  };
  send: (body: any) => any;
  end(...args: any): any;
}

/**
 * attainCors middleware wrapper
 * @param o CorsOptions | CorsOptionsDelegate
 * @link https://github.com/tajpouria/cors/blob/master/README.md#cors
 */
export const attainCors = <
  RequestT extends Req = any,
  ResponseT extends Res = any,
  MiddlewareT extends (request: RequestT, response: ResponseT) => any = any,
>(
  o?: CorsOptions | CorsOptionsDelegate<RequestT>,
) => {
  const corsOptionsDelegate = Cors.produceCorsOptionsDelegate<
    CorsOptionsDelegate<RequestT>
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
        const setStatus = (statusCode: number) => response.status(statusCode);
        const end = response.end();

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
            end,
          }).configureHeaders();
        }
      }

      if (request.method === "OPTIONS") {
        response.send("");
      }
    } catch (error) {
      console.error(error);
    }
  } as MiddlewareT;
};
