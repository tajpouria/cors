import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { exampleServerAPI } from "./example-server-api.ts";

Deno.test("Response status is ok on getStaticIndex", async () => {
  const res = await exampleServerAPI.getStaticIndex();

  assert(res.ok);
});

Deno.test(
  "Set 'access-control-allow-origin' response header to '*' on getBooks",
  async () => {
    const res = await exampleServerAPI.getBooksResponse();

    assertEquals(res.headers.get("access-control-allow-origin"), "*");
  },
);

Deno.test(
  "Set 'access-control-allow-origin' response header to '*' on getBookById",
  async () => {
    const res = await exampleServerAPI.getBookByIdResponse();

    assertEquals(res.headers.get("access-control-allow-origin"), "*");
  },
);
