export const reservationTimes = [
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
] as const;

export const guestOptions = Array.from({ length: 6 }, (_, i) => i + 1);
