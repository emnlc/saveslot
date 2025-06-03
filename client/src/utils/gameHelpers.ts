export const convertToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};
