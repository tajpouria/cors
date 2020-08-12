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
  .get("/book", (c) => {
    return Array.from(books.values());
  })
  .get(
    "/book/:id",
    (c) => {
      if (c.params?.id && books.has(c.params.id)) {
        return books.get(c.params.id);
      }
    },
    opineCors(), // Enable CORS for a Single Route
  )
  .start({ port: 8000 });
