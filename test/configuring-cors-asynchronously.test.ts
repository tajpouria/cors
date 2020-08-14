import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std/testing/asserts.ts";

import { exampleServerAPI } from "./example-server-api.ts";

const REQUEST_ORIGIN_WHITELIST = [
  "http://localhost:3000",
  "http://localhost:1234",
];

Deno.test(
  `Set 'access-control-allow-origin' response header to 'null' on getBooks when request origin IS NOT ${REQUEST_ORIGIN_WHITELIST.join(
    " or ",
  )}`,
  async () => {
    const res = await exampleServerAPI.getBooksResponse();

    assertEquals(res.headers.get("access-control-allow-origin"), null);
  },
);

Deno.test(
  `Set 'access-control-allow-origin' response header to request origin on getBooks when request origin IS ${REQUEST_ORIGIN_WHITELIST.join(
    " or ",
  )}`,
  async () => {
    const responses = await Promise.all(
      REQUEST_ORIGIN_WHITELIST.map((origin) =>
        exampleServerAPI.getBooksResponse({
          headers: { origin },
        }),
      ),
    );

    responses.forEach((res) => {
      assertMatch(
        res.headers.get("access-control-allow-origin") as string,
        new RegExp(REQUEST_ORIGIN_WHITELIST.join("|"), "gi"),
      );
    });
  },
);
