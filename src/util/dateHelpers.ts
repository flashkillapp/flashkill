const prefixZero = (i: number): string => (
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
  const year = prefixZero(date.getFullYear());
  const month = prefixZero(date.getMonth() + 1);
  const day = prefixZero(date.getDate());
  const hours = prefixZero(date.getHours());
  const minutes = prefixZero(date.getMinutes());

  return {
    year, month, day, hours, minutes,
  };
};

export const getDay = (time: number): string => {
  const { day, month, year } = getUnits(time);

  return `${day}.${month}.${year.slice(2)}`;
};

export const getTimeOfDay = (time: number): string => {
  const { hours, minutes } = getUnits(time);

  return `${hours}:${minutes}`;
};

export const getDate = (time: number): string => {
  const {
    day, month, year, hours, minutes,
  } = getUnits(time);

  return `${day}.${month}.${year} - ${hours}:${minutes}`;
};
