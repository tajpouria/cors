import { Mith } from "https://deno.land/x/mith@v0.1.1/mod.ts";
import { Router } from "https://deno.land/x/mith_router@v0.0.6/mod.ts";
import { mithCors } from "../../mod.ts";

const app = new Mith();
const router = new Router();

router.use("GET", "/book", (req, res, next) => {
  res.body = Array.from(books);
  next();
});
router.use("GET", "/book/:id", [
  mithCors(),
  (req, res, next) => {
    if (req.params?.id && books.has(req.params.id)) {
      res.body = books.get(req.params.id);
      next();
    }
  },
]);

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app.use(router.getRoutes());

app.listen({ port: 8000 });
