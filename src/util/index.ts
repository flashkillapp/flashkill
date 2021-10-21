export const notNull = <T>(value: T | null): value is T => value !== null;

export const notUndefined = <T>(value: T | undefined): value is T => value !== undefined;