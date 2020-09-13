# cors

[![Actions Status](https://github.com/tajpouria/cors/workflows/ci/badge.svg)](https://github.com/tajpouria/cors/actions) [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/cors/mod.ts) [![nest badge](https://nest.land/badge.svg)](https://nest.land/package/cors)

CORS is a Deno.js module for providing a [Oak](https://github.com/oakserver/oak)/[Opine](https://github.com/asos-craigmorten/opine)/[Abc](https://github.com/zhmushan/abc)/[Attain](https://github.com/aaronwlee/Attain)/[Mith](https://github.com/jwebcoder/mith) middleware that can be used to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) with various options.

- [Usage](#usage)
  - [Simple Usage](#simple-usage-enable-all-cors-requests)
  - [Enable CORS for a Single Route](#enable-cors-for-a-single-route)
  - [Configuring CORS](#configuring-cors)
  - [Configuring CORS w/ Dynamic Origin](#configuring-cors-w-dynamic-origin)
  - [Enabling CORS Pre-Flight](#enabling-cors-pre-flight)
  - [Configuring CORS Asynchronously](#configuring-cors-asynchronously)
- [Configuration Options](#configuration-options)
- [Examples](#examples)

## Usage

### Simple Usage (Enable All CORS Requests)

```typescript
import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const router = new Router();
router
  .get("/", async (context) => {
    await send(context, context.request.url.pathname, {
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    });
  })
  .get("/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  .get("/book/:id", (context) => {
    if (context.params && context.params.id && books.has(context.params.id)) {
      context.response.body = books.get(context.params.id);
    }
  });

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

### Enable CORS for a Single Route

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const router = new Router();
router
  .get("/book", (context) => {
    context.response.body = Array.from(books.values());
  })
  // Enable CORS for a Single Route
  .get("/book/:id", oakCors(), (context) => {
    if (context.params.id && books.has(context.params.id)) {
      context.response.body = books.get(context.params.id);
    }
  });

const app = new Application();
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

### Configuring CORS

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const router = new Router();
router.get("/book", (context) => {
  context.response.body = Array.from(books.values());
});

const app = new Application();
app.use(
  oakCors({
    origin: /^.+localhost:(1234|3000)$/,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
);
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

### Configuring CORS w/ Dynamic Origin

This module supports validating the origin dynamically using a function provided
to the `origin` option. This function will be passed a string that is the origin
(or `undefined` if the request has no origin), and a `callback` with the signature
`callback(error, origin)`.

The `origin` argument to the callback can be any value allowed for the `origin`
option of the middleware, except a function. See the
[configuration options](#configuration-options) section for more information on all
the possible value types.

This function is designed to allow the dynamic loading of allowed origin(s) from
a backing dataSource, like a database.

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const loadOriginsFromDataBase = async () => {
  await sleep(3000);
  return ["http://localhost:1234", "http://localhost:3000"];
};

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const corsOptions: CorsOptions = {
  origin: async (requestOrigin) => {
    const origins = await loadOriginsFromDataBase(); // Simulate asynchronous task

    return origins; //  Reflect (enable) the requested origin in the CORS response for this origins
  },
};

const router = new Router();
router.get("/book", oakCors(corsOptions), (context) => {
  context.response.body = Array.from(books.values());
});

const app = new Application();
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

If you do not want to block REST tools or server-to-server requests, add a !requestOrigin check in the origin function like so:

```typescript
const corsOptions = {
  origin: (requestOrigin) => {
    if (!requestOrigin) {
      return true;
    } else {
      thrown new Error("Not allowed by CORS");
    }
  },
};
```

### Enabling CORS Pre-Flight

Certain CORS requests are considered 'complex' and require an initial
`OPTIONS` request (called the "pre-flight request"). An example of a
'complex' CORS request is one that uses an HTTP verb other than
GET/HEAD/POST (such as DELETE) or that uses custom headers. To enable
pre-flighting, you must add a new OPTIONS handler for the route you want
to support:

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const router = new Router();
router
  .options("/book/:id", oakCors()) // enable pre-flight request for OPTIONS request
  .delete("/book/:id", oakCors(), (context) => {
    if (context.params && context.params.id && books.has(context.params.id)) {
      books.delete(context.params.id);
      context.response.body = { ok: true };
    }
  });

const app = new Application();
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

NOTE: When using this middleware as an application level middleware (for
example, `app.use(oakCors())`), pre-flight requests are already handled for all
routes.

### Configuring CORS Asynchronously

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const whitelist = ["http://localhost:1234", "http://localhost:3000"];

const corsOptionsDelegate: CorsOptionsDelegate<Request> = async (request) => {
  const isOriginAllowed = whitelist.includes(
    request.headers.get("origin") ?? "",
  );

  await sleep(3000); // Simulate asynchronous task

  return { origin: isOriginAllowed }; //  Reflect (enable) the requested origin in the CORS response if isOriginAllowed is true
};

const router = new Router();
router.get("/book/:id", oakCors(corsOptionsDelegate), (context) => {
  context.response.body = Array.from(books.values());
});

const app = new Application();
app.use(router.routes());

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
```

## Configuration Options

- `origin`: Configures the **Access-Control-Allow-Origin** CORS header. Possible values:
  - `Boolean` - set `origin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), as defined by `req.header('Origin')`, or set it to `false` to disable CORS.
  - `String` - set `origin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
  - `RegExp` - set `origin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
  - `Array` - set `origin` to an array of valid origins. Each origin can be a `String` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
  - `Function` - set `origin` to a function implementing some custom logic. The function takes the request origin as the first parameter and a callback (called as `callback(err, origin)`, where `origin` is a non-function value of the `origin` option) as the second.
- `methods`: Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: 'GET,PUT,POST') or an array (ex: `['GET', 'PUT', 'POST']`).
- `allowedHeaders`: Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Type,Authorization') or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to reflecting the headers specified in the request's **Access-Control-Request-Headers** header.
- `exposedHeaders`: Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range') or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.
- `credentials`: Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.
- `maxAge`: Configures the **Access-Control-Max-Age** CORS header. Set to an integer to pass the header, otherwise it is omitted.
- `preflightContinue`: Pass the CORS preflight response to the next handler.
- `optionsSuccessStatus`: Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.

The default configuration is the equivalent of:

```json
{
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}
```

## Examples

Document example can be found here:

- [ Oak ](./examples/oak)
- [ Opine ](./examples/opine)
- [ Abc ](./examples/abc)
- [ Attain ](./examples/attain)
- [ Mith ](./examples/mith)

## License

[MIT License](LICENSE)
