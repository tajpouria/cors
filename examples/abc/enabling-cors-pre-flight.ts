import { Application } from "https://deno.land/x/abc/mod.ts";
import { abcCors } from "../../mod.ts";

const app = new Application();

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app
  .options("/book/:id", (c) => c, abcCors()) // enable pre-flight request for OPTIONS request
  .delete(
    "/book/:id",
    (c) => {
      if (c.params && c.params.id && books.has(c.params.id)) {
        books.delete(c.params.id);
        return { ok: true };
      }
    },
    abcCors(),
  )
  .start({ port: 8000 });

console.info("CORS-enabled web server listening on port 8000");
