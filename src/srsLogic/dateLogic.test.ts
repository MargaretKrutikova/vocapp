import { test, expect } from "vitest";
import { daysFromMinutes, getLateness } from "./dateLogic";

test("Lateness is zero", () => {
  const lateness = getLateness(
    new Date(2020, 1, 1, 12, 0, 0),
    1,
    new Date(2020, 1, 1, 12, 0, 0)
  );

  expect(lateness).toBe(0);
});

test("Lateness is half", () => {
  const lateness = getLateness(
    new Date(2020, 1, 1, 12, 0, 0),
    2,
    new Date(2020, 1, 2, 12, 0, 0)
  );

  expect(lateness).toBe(0.5);
});

test("Lateness is one", () => {
  const lateness = getLateness(
    new Date(2020, 1, 1, 12, 0, 0),
    1,
    new Date(2020, 1, 2, 12, 0, 0)
  );

  expect(lateness).toBe(1);
});

test("Lateness is negative one", () => {
  const lateness = getLateness(
    new Date(2020, 1, 2, 12, 0, 0),
    1,
    new Date(2020, 1, 1, 12, 0, 0)
  );

  expect(lateness).toBe(-1);
});

test("Lateness is 1 for 1 minute", () => {
  const lateness = getLateness(
    new Date(2020, 1, 1, 14, 0, 0),
    daysFromMinutes(1),
    new Date(2020, 1, 1, 14, 1, 0)
  );

  expect(lateness).toBe(1);
});
