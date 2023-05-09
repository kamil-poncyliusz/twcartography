function daysFromStart(date: Date) {
  const difference = Date.now() - date.getTime();
  const days = Math.floor(difference / 1000 / 60 / 60 / 24);
  return days;
}

export default daysFromStart;
