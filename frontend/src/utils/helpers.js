export const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const formatPKR = (n, decimals = 0) =>
  'Rs ' + Number(n).toLocaleString('en-PK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
