import { opine } from "https://deno.land/x/opine/mod.ts";
import { opineCors } from "../../mod.ts";

const app = opine();

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app
  .use(opineCors({ origin: false })) // Disable CORS for a all Routes
  .options("/book/:id", opineCors()) // enable pre-flight request for OPTIONS request
  .delete("/book/:id", opineCors(), (req, res) => {
    if (req.params && req.params.id && books.has(req.params.id)) {
      books.delete(req.params.id);
      res.send({ ok: true });
    }
  })
  .listen(
    { port: 8000 },
    () => console.info("CORS-enabled web server listening on port 8000"),
  );
