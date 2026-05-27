export const APP = {
  name: "Happy Home Rider",
  restaurant: "Happy Home Restaurant",
  tagline: "Sri Lankan + Indian Kitchen",
  currency: "LKR",
  pickupAddress: "Happy Home Restaurant, 142 Galle Rd, Colombo 04",
  supportPhone: "+94 11 555 0199",
};

export const formatCurrency = (n: number) =>
  `${APP.currency} ${n.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
