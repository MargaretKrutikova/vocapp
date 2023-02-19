import { daysFromMinutes } from "./dateLogic";

export type CardState = {
  bucket: number;
  eFactor: number;
  interval: number;
};

export type EvaluationScore =
  | 1
  | 2 // Failed
  | 3 // Got right, but was tough to remember
  | 4 // Good
  | 5; // Too easy

export type Evaluation = {
  score: EvaluationScore;
  lateness: number; // (timeLate / intendedInterval)
};

const getFuzzRange = (i: number) => {
  if (i < 2) return 0;
  if (i === 2) return 1;
  if (i < 7) return Math.round(i * 0.25);
  if (i < 30) return Math.max(2, Math.round(i * 0.25));

  return Math.max(4, Math.round(i * 0.05));
};

const fuzzForInterval = (i: number, randomFunc: () => number) => {
  const fuzzRange = getFuzzRange(i);
  return randomFunc() * fuzzRange - fuzzRange * 0.5;
};

const getFuzzInterval = (n: number) => {
  switch (n) {
    case 1: // first interval = 1min
      return daysFromMinutes(1);
    case 2: // second interval = 10min
      return daysFromMinutes(10);
    default: // third interval = 24h
      return 1.0;
  }
};

function learningPhaseState(
  previousBucket: number,
  score: EvaluationScore,
  previousEfactor: number
): CardState {
  const incrementedBucket = previousBucket + 1;
  switch (score) {
    case 1:
    case 2:
      return {
        bucket: 0,
        eFactor: previousEfactor,
        interval: daysFromMinutes(1.0),
      };
    case 3:
    case 4:
      return {
        bucket: incrementedBucket,
        eFactor: previousEfactor,
        interval: getFuzzInterval(incrementedBucket),
      };
    case 5:
      return {
        bucket: incrementedBucket,
        eFactor: previousEfactor,
        interval: 4.0,
      };
  }
}

function getLatenessBonus(latenessDays: number, score: EvaluationScore) {
  if (latenessDays <= 0) return 0.0;

  switch (score) {
    case 5:
      return latenessDays;
    case 4:
      return latenessDays / 2.0;
    default:
      return latenessDays / 4.0;
  }
}

function getInterval(
  previousInterval: number,
  score: EvaluationScore,
  workingEfactor: number,
  latenessBonus: number
) {
  switch (score) {
    case 1:
    case 2:
    case 4: // TODO: This is questionable - double-check whether it makes sense
      return Math.ceil((previousInterval + latenessBonus) * workingEfactor);
    case 3:
      return Math.ceil(
        (previousInterval + latenessBonus) *
          Math.max(1.3, workingEfactor - 0.15)
      );
    case 5:
      return Math.ceil(
        (previousInterval + latenessBonus) *
          Math.max(1.3, workingEfactor + 0.15)
      );
  }
}

export const initialCardState: CardState = {
  bucket: 0,
  eFactor: 2.5,
  interval: 1.0,
};

export function srsFunc(
  randomFunc: () => number,
  previous: CardState,
  evaluation: Evaluation
): CardState {
  if (previous.bucket <= 2) {
    // "Learning phase" - do not change efactor
    return learningPhaseState(
      previous.bucket,
      evaluation.score,
      previous.eFactor
    );
  }

  // Reviewing phase - Failed
  if (evaluation.score < 3) {
    return {
      bucket: 0,
      interval: daysFromMinutes(1), // Reset interval to 1 minute
      eFactor: Math.max(1.3, previous.eFactor - 0.2), // Reduce efactor
    };
  }

  // Reviewing phase - Passed
  const latenessDays = Math.max(0, evaluation.lateness * previous.interval);
  const latenessBonus = getLatenessBonus(latenessDays, evaluation.score);

  const newEfactor = Math.max(
    1.3,
    previous.eFactor +
      (0.1 - (5 - evaluation.score) * (0.08 + (5 - evaluation.score) * 0.02))
  );

  const newInterval = getInterval(
    previous.interval,
    evaluation.score,
    newEfactor,
    latenessBonus
  );

  return {
    bucket: previous.bucket + 1,
    eFactor: newEfactor,
    interval: newInterval + fuzzForInterval(newInterval, randomFunc),
  };
}
