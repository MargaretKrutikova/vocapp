import differenceInMinutes from "date-fns/differenceInMinutes";

export const daysFromMinutes = (min: number) => min / (24.0 * 60.0);

export const getLateness = (
  plannedReviewDate: Date,
  plannedIntervalInDays: number,
  now: Date
) =>
  daysFromMinutes(differenceInMinutes(now, plannedReviewDate)) /
  plannedIntervalInDays;

export const minutesFromDays = (days: number) => days * 24 * 60;
