/**
 * The mobile-money, card and online payment operators people can use.
 * `integrated: true` means it's actually live today; `false` means it's
 * planned and shows up in the "coming soon" list instead.
 */

export const paymentMethods = [
  { operator: 'Orange Money', method: 'MOBILE_MONEY', bg: '#FF7900', fg: '#000000', integrated: true },
  { operator: 'MTN Mobile Money', method: 'MOBILE_MONEY', bg: '#FFCB05', fg: '#00256B', integrated: true },
  { operator: 'Wave', method: 'MOBILE_MONEY', bg: '#1DC4FF', fg: '#001B44', integrated: true },
  { operator: 'Moov Money', method: 'MOBILE_MONEY', bg: '#F58220', fg: '#FFFFFF', integrated: true },
  { operator: 'Visa', method: 'CARD', bg: '#1A1F71', fg: '#F7B600', integrated: true },
  { operator: 'Mastercard', method: 'CARD', bg: '#111111', fg: '#FF5F00', integrated: true },
  { operator: 'PayPal', method: 'PAYPAL', bg: '#003087', fg: '#009CDE', integrated: true },
  { operator: 'Free Money', method: 'MOBILE_MONEY', bg: '#E2001A', fg: '#FFFFFF', integrated: false },
  { operator: 'Airtel Money', method: 'MOBILE_MONEY', bg: '#ED1C24', fg: '#FFFFFF', integrated: false },
  { operator: 'Wizall Money', method: 'MOBILE_MONEY', bg: '#0072BC', fg: '#FFFFFF', integrated: false },
  { operator: 'M-Pesa', method: 'MOBILE_MONEY', bg: '#4CAF50', fg: '#FFFFFF', integrated: false },
  { operator: 'Afrimoney', method: 'MOBILE_MONEY', bg: '#6A1B9A', fg: '#FFFFFF', integrated: false },
  { operator: 'EcoCash', method: 'MOBILE_MONEY', bg: '#004990', fg: '#FFFFFF', integrated: false },
  { operator: 'T-Money', method: 'MOBILE_MONEY', bg: '#0057A8', fg: '#FFFFFF', integrated: false },
];

export const paymentMethodMeta = {
  MOBILE_MONEY: { label: 'Mobile Money' },
  CARD: { label: 'Carte bancaire' },
  PAYPAL: { label: 'PayPal' },
};
