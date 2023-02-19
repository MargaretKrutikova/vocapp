import { test, expect } from "vitest";
import { getLatenessInDays } from "./dateLogic";

test("Lateness is zero", () => {
  const latenessInDays = getLatenessInDays(
    new Date(2020, 1, 1, 12, 0, 0),
    1,
    new Date(2020, 1, 1, 12, 0, 0)
  );

  expect(latenessInDays).toBe(0);
});

test("Lateness is half", () => {
  const latenessInDays = getLatenessInDays(
    new Date(2020, 1, 1, 12, 0, 0),
    2,
    new Date(2020, 1, 2, 12, 0, 0)
  );

  expect(latenessInDays).toBe(0.5);
});

test("Lateness is one", () => {
  const latenessInDays = getLatenessInDays(
    new Date(2020, 1, 1, 12, 0, 0),
    1,
    new Date(2020, 1, 2, 12, 0, 0)
  );

  expect(latenessInDays).toBe(1);
});

test("Lateness is negative one", () => {
  const latenessInDays = getLatenessInDays(
    new Date(2020, 1, 2, 12, 0, 0),
    1,
    new Date(2020, 1, 1, 12, 0, 0)
  );

  expect(latenessInDays).toBe(-1);
});
