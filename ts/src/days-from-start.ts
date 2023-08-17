const daysFromStart = function (date: Date): number {
  const difference = Date.now() - date.getTime();
  const days = Math.round(difference / 1000 / 60 / 60 / 24);
  return days;
};

export default daysFromStart;
