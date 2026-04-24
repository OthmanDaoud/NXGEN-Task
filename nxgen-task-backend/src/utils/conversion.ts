export const parseNumber = (value: unknown): number | undefined => {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };
  
 export const parseDate = (value: unknown): Date | undefined => {
    if (!value || typeof value !== "string") return undefined;
  
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  };