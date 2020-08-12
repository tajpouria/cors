import { Application } from "https://deno.land/x/opine/mod.ts";
import { opineCors } from "../../mod.ts";

const app = new Application();

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app
  .use(
    opineCors({
      origin: /^.+localhost:(3000|1234)$/,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    }),
  )
  .get("/book", (c) => {
    return Array.from(books);
  })
  .get("/book/:id", (c) => {
    if (c.params?.id && books.has(c.params.id)) {
      return books.get(c.params.id);
    }
  })
  .start({ port: 8000 });
