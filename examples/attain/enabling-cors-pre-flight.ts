import { App } from "https://deno.land/x/attain/mod.ts";
import { attainCors } from "../../mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const app = new App();
app.options("/book/:id", attainCors()) // enable pre-flight request for OPTIONS request
app.delete("/book/:id", attainCors(), (req, res) => {
  if (req.params && req.params.id && books.has(req.params.id)) {
    books.delete(req.params.id);
    res.status(200).send({ ok: true })
  }
})

console.info(`CORS-enabled web server listening on port 8000`);
await app.listen({ port: 8000 });
