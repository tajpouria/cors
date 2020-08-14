import { App } from "https://deno.land/x/attain/mod.ts";
import { attainCors } from "../../mod.ts";

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const app = new App();
app.use(
  attainCors({
    origin: /^.+localhost:(3000|1234)$/,
  }),
);
app.get("/book", (req, res) => {
  res.status(200).send(Array.from(books.values()));
});

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
