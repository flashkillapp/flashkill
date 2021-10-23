export const isNull = <T>(value: T | null): value is null => value === null;
export const notNull = <T>(value: T | null): value is T => value !== null;
export const isUndefined = <T>(value: T | undefined): value is undefined => value === undefined;
export const isNotUndefined = <T>(value: T | undefined): value is T => value !== undefined;
