export const formatLKR = (n: number) =>
  "Rs. " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
