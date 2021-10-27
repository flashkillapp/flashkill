const makeDoubleDigit = (i: number): string => (
  i < 10 ? `0${i}` : `${i}`
);

interface DateUnits {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
}

export const getUnits = (time: number): DateUnits => {
  const date = new Date(time * 1000);
  const year = makeDoubleDigit(date.getFullYear());
  const month = makeDoubleDigit(date.getMonth() + 1);
  const day = makeDoubleDigit(date.getDate());
  const hours = makeDoubleDigit(date.getHours());
  const minutes = makeDoubleDigit(date.getMinutes());

  return {
    year, month, day, hours, minutes,
  };
};

export const getDay = (time: number): string => {
  const { day, month, year } = getUnits(time);

  return `${day}.${month}.${year.slice(2)}`;
};
