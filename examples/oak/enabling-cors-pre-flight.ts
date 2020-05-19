import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "../../mod.ts";

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

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
