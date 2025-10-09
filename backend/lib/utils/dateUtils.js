// Date utility functions
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

export const isDateInPast = (date) => {
  if (!date) return false;
  const now = new Date();
  const checkDate = new Date(date);
  return checkDate < now;
};

export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};