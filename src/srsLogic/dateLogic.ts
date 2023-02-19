import differenceInDays from "date-fns/differenceInDays";

export const daysFromMinutes = (min: number) => min / (24.0 * 60.0);

export const getLatenessInDays = (
  plannedReviewDate: Date,
  plannedIntervalInDays: number,
  now: Date
) => differenceInDays(now, plannedReviewDate) / plannedIntervalInDays;

export const minutesFromDays = (days: number) => days * 24 * 60;
