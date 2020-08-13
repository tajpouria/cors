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
  .get("/book", (_req, res) => {
    res.send(Array.from(books));
  })
  .get("/book/:id", opineCors(), (req, res) => {
    // Enable CORS for a Single Route
    if (req.params?.id && books.has(req.params.id)) {
      res.send(books.get(req.params.id));
    }
  })
  .listen(
    { port: 8000 },
    () => console.info("CORS-enabled web server listening on port 8000"),
  );
