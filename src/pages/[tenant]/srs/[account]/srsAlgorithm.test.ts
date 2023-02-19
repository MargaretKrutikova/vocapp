import { test, expect } from "vitest";
import {
  EvaluationScore,
  CardState,
  srsFunc,
  Evaluation,
  initialCardState,
  daysFromMinutes,
} from "./srsAlgorithm";

const mockedRandom = () => 1;

const funcUnderTest = (previous: CardState, evaluation: Evaluation) =>
  srsFunc(mockedRandom, previous, evaluation);

const minutesFromDays = (days: number) => days * 24 * 60;

function toMinutesIfUnder12Hours(days: number | null | undefined) {
  if (days === null || days === undefined) {
    return "-";
  }
  if (days < 0.5) {
    return `${minutesFromDays(days)}m`;
  }
  return `${Math.round(days)}d`;
}

test("results match the 'Typical' simulator", () => {
  const typicalScores: EvaluationScore[] = [
    3, 4, 5, 3, 4, 3, 4, 4, 3, 4, 3, 2, 3, 4, 4,
  ];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "4d",
    "10d",
    "27d",
    "58d",
    "132d",
    "302d",
    "597d",
    "1272d",
    "2334d",
    "1m",
    "1m",
    "10m",
    "1d",
  ]);
});

test("results match the 'Eventual Lapses' simulator", () => {
  const typicalScores: EvaluationScore[] = [3, 4, 5, 4, 3, 2, 3, 4, 4];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "4d",
    "12d",
    "30d",
    "1m",
    "1m",
    "10m",
    "1d",
  ]);
});

test("results match the 'Initially failed or just barely passed` simulator", () => {
  const typicalScores: EvaluationScore[] = [1, 3, 2, 3, 2, 3, 3, 4, 3, 3];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "1m",
    "1m",
    "1m",
    "1m",
    "1m",
    "10m",
    "1d",
    "4d",
    "9d",
  ]);
});

test("results match the 'Late but right' simulator", () => {
  const scoresWithLateness: Evaluation[] = [
    { score: 3, lateness: 0 },
    { score: 4, lateness: 0 },
    { score: 5, lateness: 0 },
    { score: 3, lateness: 0.5 },
    { score: 4, lateness: 0.75 },
    { score: 3, lateness: 0 },
    { score: 4, lateness: 0.105 },
    { score: 4, lateness: 0 },
    { score: 3, lateness: 0 },
    { score: 4, lateness: 0 },
    { score: 3, lateness: 0 },
  ];

  const results = scoresWithLateness.reduce(
    (acc, currentValue) => [
      ...acc,
      funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
    ],
    [null as CardState | null]
  );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "4d",
    "12d",
    "40d",
    "85d",
    "204d",
    "465d",
    "920d",
    "1961d",
    "3599d",
  ]);
});

test("results match the 'Reviewed too early' simulator", () => {
  const scoresWithLateness: Evaluation[] = [
    { score: 3, lateness: 0 },
    { score: 4, lateness: 0 },
    { score: 3, lateness: -0.9 },
    { score: 4, lateness: -0.25 },
    { score: 4, lateness: 0 },
    { score: 4, lateness: -0.107 },
    { score: 3, lateness: 0 },
  ];

  const results = scoresWithLateness.reduce(
    (acc, currentValue) => [
      ...acc,
      funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
    ],
    [null as CardState | null]
  );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "1d",
    "4d",
    "10d",
    "28d",
    "64d",
  ]);
});

test("results match the 'Initial reviews done late' simulator", () => {
  const scoresWithLateness: Evaluation[] = [
    { score: 3, lateness: 0 },
    { score: 3, lateness: 1 },
    { score: 3, lateness: 0.5 },
    { score: 4, lateness: 0.25 },
    { score: 3, lateness: 0 },
    { score: 4, lateness: 0 },
    { score: 4, lateness: 0 },
    { score: 4, lateness: 0 },
  ];

  const results = scoresWithLateness.reduce(
    (acc, currentValue) => [
      ...acc,
      funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
    ],
    [null as CardState | null]
  );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "1d",
    "4d",
    "9d",
    "25d",
    "61d",
    "148d",
  ]);
});

test("results match the '(All 3s)' simulator", () => {
  const typicalScores: EvaluationScore[] = [3, 3, 3, 3, 3, 3, 3, 3];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "1d",
    "4d",
    "9d",
    "21d",
    "39d",
    "67d",
  ]);
});

test("results match the '(All 4s)' simulator", () => {
  const typicalScores: EvaluationScore[] = [4, 4, 4, 4, 4, 4, 4, 4];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "1d",
    "4d",
    "10d",
    "28d",
    "72d",
    "185d",
  ]);
});

test("results match the 'Consistently failed` simulator", () => {
  const typicalScores: EvaluationScore[] = [2, 2, 2, 2, 2, 2];
  const results = typicalScores
    .map((s) => ({ lateness: 0, score: s }))
    .reduce(
      (acc, currentValue) => [
        ...acc,
        funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
      ],
      [null as CardState | null]
    );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual(["-", "1m", "1m", "1m", "1m", "1m", "1m"]);
});

test("results match the 'Review done very early' simulator", () => {
  const scoresWithLateness: Evaluation[] = [
    { score: 3, lateness: 0 },
    { score: 3, lateness: -1 },
    { score: 3, lateness: -1 },
    { score: 3, lateness: -(23 / 24) },
    { score: 3, lateness: -(1 / 3) },
    { score: 3, lateness: -(7 / 9) },
    { score: 3, lateness: -(15 / 21) },
    { score: 3, lateness: 0 },
    { score: 3, lateness: -(34 / 67) },
    { score: 3, lateness: -(52 / 105) },
    { score: 3, lateness: -(74 / 148) },
    { score: 3, lateness: -(99 / 197) },
  ];

  const results = scoresWithLateness.reduce(
    (acc, currentValue) => [
      ...acc,
      funcUnderTest(acc[acc.length - 1] ?? initialCardState, currentValue),
    ],
    [null as CardState | null]
  );

  const mappedResults = results.map((r) =>
    toMinutesIfUnder12Hours(r?.interval)
  );

  expect(mappedResults).toEqual([
    "-",
    "1m",
    "10m",
    "1d",
    "4d",
    "9d",
    "21d",
    "39d",
    "67d",
    "105d",
    "148d",
    "197d",
    "264d",
  ]);
});

test("first time review", () => {
  const scoreWithLateness: Evaluation = {
    score: 3,
    lateness: daysFromMinutes(10),
  };

  const result = funcUnderTest(initialCardState, scoreWithLateness);

  expect(result).toEqual({
    bucket: 1,
    efactor: 2.5,
    interval: daysFromMinutes(1),
  });
});
