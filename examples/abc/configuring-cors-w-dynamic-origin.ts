import { Application } from "https://deno.land/x/abc/mod.ts";
import { abcCors, CorsOptions } from "../../mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const loadOriginsFromDataBase = async () => {
  await sleep(3000);
  return ["http://localhost:1234", "http://localhost:3000"];
};

const app = new Application();

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

app
  .use(abcCors(corsOptions))
  .get("/book", (c) => {
    return Array.from(books);
  })
  .start({ port: 8000 });
