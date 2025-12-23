import { expect, it } from "vitest";
import { cn } from "./utils";

it("should merge class names", () => {
  expect(cn("text-bold text-bold")).toBe("text-bold");
});
