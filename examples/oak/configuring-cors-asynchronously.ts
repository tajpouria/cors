import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors, OakCorsOptionsDelegate } from "../../mod.ts";

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

const whitelist = ["http://localhost:123", "http://localhost:3000"];

const corsOptionsDelegate: OakCorsOptionsDelegate = async (request) => {
  const isOriginAllowed = whitelist.includes(
    request.headers.get("origin") ?? "",
  );

  await sleep(3000); // Simulate asynchronous task

  return { origin: isOriginAllowed }; //  Reflect (enable) the requested origin in the CORS response if isOriginAllowed is true
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
