import { Mith } from "https://deno.land/x/mith@v0.1.1/mod.ts";
import { Router } from "https://deno.land/x/mith_router@v0.0.6/mod.ts";
import { mithCors } from "../../mod.ts";

const app = new Mith();
const router = new Router();

router.use('OPTIONS', '/book/:id',
  mithCors()
)
router.use('DELETE', '/book/:id', [
  (req, res, next) => {
    if (req.params && req.params.id && books.has(req.params.id)) {
      books.delete(req.params.id);
      res.body = { ok: true };
      next()
    }
  },
  mithCors()
])

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

app.use(router.getRoutes())

app.listen({ port: 8000 });
