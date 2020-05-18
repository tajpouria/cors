import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "../../mod.ts";

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
    origin: /^.+localhost:(3000|1234)$/,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
);
app.use(router.routes());

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
