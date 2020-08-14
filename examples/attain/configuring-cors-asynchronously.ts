import { App, Request } from "https://deno.land/x/attain/mod.ts";
import { attainCors, CorsOptionsDelegate } from "../../mod.ts";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const books = new Map<string, any>();
books.set("1", {
  id: "1",
  title: "Frankenstein",
  author: "Mary Shelley",
});

const whitelist = ["http://localhost:1234", "http://localhost:3000"];

const corsOptionsDelegate: CorsOptionsDelegate<Request> = async (request) => {
  const isOriginAllowed = whitelist.includes(
    request.headers.get("origin") ?? "",
  );

  await sleep(100); // Simulate asynchronous task

  return { origin: isOriginAllowed }; //  Reflect (enable) the requested origin in the CORS response if isOriginAllowed is true
};

const app = new App();
app.get("/book", attainCors(corsOptionsDelegate), (req, res) => {
  res.status(200).send(Array.from(books.values()));
});

console.info("CORS-enabled web server listening on port 8000");
await app.listen({ port: 8000 });
