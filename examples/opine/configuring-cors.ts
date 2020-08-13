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
  .use(
    opineCors({
      origin: /^.+localhost:(3000|1234)$/,
      optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    }),
  )
  .get("/book", (_req, res) => {
    res.send(Array.from(books));
  })
  .get("/book/:id", (req, res) => {
    if (req.params?.id && books.has(req.params.id)) {
      res.send(books.get(req.params.id));
    }
  })
  .listen(
    { port: 8000 },
    () => console.info("CORS-enabled web server listening on port 8000"),
  );
