# cors

CORS providing a [Oak](https://github.com/oakserver/oak) middleware that can be used to enable [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) with various options.

- [Usage](#usage)
  - [Simple Usage](#simple-usage-enable-all-cors-requests)
  - [Enable CORS for a Single Route](#enable-cors-for-a-single-route)
  - [Configuring CORS](#configuring-cors)
  - [Configuring CORS w/ Dynamic Origin](#configuring-cors-w-dynamic-origin)
  - [Enabling CORS Pre-Flight](#enabling-cors-pre-flight)
  - [Configuring CORS Asynchronously](#configuring-cors-asynchronously)
- [Configuration Options](#configuration-options)

## Usage

### Simple Usage (Enable All CORS Requests)

#### Oak

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
  .get("/", (context) => {
    context.response.body = "Hello world!";
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
app.use(oakCors()); // Enable All CORS Requests
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
```

### Enable CORS for a Single Route

#### Oak

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
  .get("/book", oakCors(), (context) => {
    // Enable CORS for a Single Route
    context.response.body = Array.from(books.values());
  })
  .get("/book/:id", (context) => {
    if (context.params && context.params.id && books.has(context.params.id)) {
      context.response.body = books.get(context.params.id);
    }
  });

const app = new Application();
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
```

### Configuring CORS

#### Oak

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

console.info(`CORS-enabled web server listening on port 8000`);
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

#### Oak

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const corsOptions = {
  origin: function (origin, callback) {
    // db.loadOrigins is an example call to load
    // a list of origins from a backing database
    db.loadOrigins(function (error, origins) {
      callback(error, origins);
    });
  },
};

const router = new Router();
router.get("/book", oakCors(corsOptions), (context) => {
  // Enable CORS for a Single Route
  context.response.body = Array.from(books.values());
});

const app = new Application();
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
```

If you do not want to block REST tools or server-to-server requests, add a !origin check in the origin function like so:

```typescript
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || !whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
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

#### Oak

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
      context.response.body = books.get(context.params.id);
    }
  });

const app = new Application();
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
```

NOTE: When using this middleware as an application level middleware (for
example, `app.use(oakCors())`), pre-flight requests are already handled for all
routes.

### Configuring CORS Asynchronously

#### Oak

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const whitelist = ["http://localhost:1234", "http://localhost:3000"];

const corsOptionsDelegate: OakCorsOptionsDelegate = (request, callback) => {
  let corsOptions: CorsOptions = {};
  if (whitelist.includes(request.headers.get("origin") ?? "")) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }

  callback(null, corsOptions); // callback expects two parameters: error and options
};

const router = new Router();
router.get("/book/:id", oakCors(corsOptionsDelegate), (context) => {
  if (context.params && context.params.id && books.has(context.params.id)) {
    context.response.body = books.get(context.params.id);
  }
});

const app = new Application();
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
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

## License

[MIT License](LICENSE)
