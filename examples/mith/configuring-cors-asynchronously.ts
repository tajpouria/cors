import { Mith } from "https://deno.land/x/mith@v0.7.0/mod.ts";
import { Router } from "https://deno.land/x/mith_router@v0.2.0/mod.ts";
import { mithCors, CorsOptionsDelegate } from "../../mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

const whitelist = ["http://localhost:1234", "http://localhost:3000"];

const corsOptionsDelegate: CorsOptionsDelegate = async (request) => {
  const isOriginAllowed = whitelist.includes(
    request.headers.get("origin") ?? "",
  );

  await sleep(100); // Simulate asynchronous task

  return { origin: isOriginAllowed }; //  Reflect (enable) the requested origin in the CORS response if isOriginAllowed is true
};

app.use(mithCors(corsOptionsDelegate));
app.use(router.getRoutes());

app.listen({ port: 8000 });
console.info("CORS-enabled web server listening on port 8000");
