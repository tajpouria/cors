import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors, OakCorsOptionsDelegate, CorsOptions } from "../../mod.ts";

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
