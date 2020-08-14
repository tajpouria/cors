import { Mith } from "https://deno.land/x/mith@v0.7.0/mod.ts";
import { Router } from "https://deno.land/x/mith_router@v0.2.0/mod.ts";
import { mithCors } from "../../mod.ts";

const app = new Mith();
const router = new Router();

router.use("GET", "/book", (req, res, next) => {
  res.body = Array.from(books);
  next();
});
router.use("GET", "/book/:id", (req, res, next) => {
  if (req.params?.id && books.has(req.params.id)) {
    res.body = books.get(req.params.id);
    next();
  }
});

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app.use(mithCors());
app.use(router.getRoutes());

app.listen({ port: 8000 });
console.info("CORS-enabled web server listening on port 8000");
