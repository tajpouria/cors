import { Application } from "https://deno.land/x/opine/mod.ts";
import { opineCors, CorsOptionsDelegate } from "../../mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const app = new Application();

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

  await sleep(3000); // Simulate asynchronous task

  return { origin: isOriginAllowed }; //  Reflect (enable) the requested origin in the CORS response if isOriginAllowed is true
};

app
  .use(opineCors(corsOptionsDelegate))
  .get("/book", (c) => {
    return Array.from(books);
  })
  .start({ port: 8000 });
