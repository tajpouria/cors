import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { exampleServerAPI } from "./example-server-api.ts";

Deno.test(
  "Set 'access-control-allow-origin' response header to '*' on DeleteBookById",
  async () => {
    const res = await exampleServerAPI.deleteBookById();

    assertEquals(res.headers.get("access-control-allow-origin"), "*");
  },
);
