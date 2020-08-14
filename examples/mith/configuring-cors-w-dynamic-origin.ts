import { Mith } from "https://deno.land/x/mith@v0.7.0/mod.ts";
import { Router } from "https://deno.land/x/mith_router@v0.2.0/mod.ts";
import { mithCors, CorsOptions } from "../../mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const loadOriginsFromDataBase = async () => {
  await sleep(100);
  return ["http://localhost:1234", "http://localhost:3000"];
};

const app = new Mith();
const router = new Router();

router.use("GET", "/book", (req, res, next) => {
  res.body = Array.from(books);
  next();
});

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const corsOptions: CorsOptions = {
  origin: async (requestOrigin) => {
    const origins = await loadOriginsFromDataBase(); // Simulate asynchronous task

    return origins; //  Reflect (enable) the requested origin in the CORS response for this origins
  },
};

app.use(mithCors(corsOptions));
app.use(router.getRoutes());

app.listen({ port: 8000 });
console.info("CORS-enabled web server listening on port 8000");
