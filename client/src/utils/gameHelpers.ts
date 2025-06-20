export const convertToDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

export const decodeTag = (tag: number) => {
  const typeID = tag >>> 28;
  const objectID = tag & 0x0ffffff;
  return { typeID, objectID };
};
