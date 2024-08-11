import { chunkifyString } from "./utils";
import { expect, describe, it } from "bun:test";

describe("utils", () => {
  it("chunkifyString", () => {
    expect(chunkifyString("aabbc", 2)).toMatchObject(["aa", "bb", "c"]);
    expect(chunkifyString("aabbc", 3)).toMatchObject(["aab", "bc"]);
    expect(chunkifyString("aabbc", 10)).toMatchObject(["aabbc"]);
  });
});
