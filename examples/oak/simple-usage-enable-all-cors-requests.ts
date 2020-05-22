import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "../../mod.ts";

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

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
