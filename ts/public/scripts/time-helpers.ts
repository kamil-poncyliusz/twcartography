export const dayTimestampFromDateString = function (dateString: string): number {
  const date = new Date(dateString);
  return Math.round(date.getTime() / 1000 / 60 / 60 / 24);
};

export const dateStringFromDayTimestamp = function (dayTimestamp: number): string {
  const date = new Date(dayTimestamp * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
};
