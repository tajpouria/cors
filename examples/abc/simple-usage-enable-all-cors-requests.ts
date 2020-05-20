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
  .use(abcCors()) // Enable All CORS Requests
  .get("/book", (c) => {
    return Array.from(books);
  })
  .get("/book/:id", (c) => {
    if (c.params?.id && books.has(c.params.id)) {
      return books.get(c.params.id);
    }
  })
  .start({ port: 8000 });
