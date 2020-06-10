import { App } from "https://deno.land/x/attain/mod.ts";
import { attainCors } from "../../mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const app = new App();
app.get("/book", attainCors(), (req, res) => {
  // Enable CORS for a Single Route
  res.status(200).send(Array.from(books.values()));
})
app.get("/book/:id", (req, res) => {
  if (req.params && req.params.id && books.has(req.params.id)) {
    res.status(200).send(books.get(req.params.id));
  }
})

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
