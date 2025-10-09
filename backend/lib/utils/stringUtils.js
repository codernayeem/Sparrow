// String utility functions
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const removeSpecialChars = (text) => {
  if (!text) return '';
  return text.replace(/[^a-zA-Z0-9\s]/g, '');
};