/**
 * The commission rate we charge per type of campaign. Organizers who are
 * logged in can sometimes get a custom rate, but this page is public (no
 * login), so it always shows the standard rate below.
 */

// The different kinds of campaigns someone can create on the platform.
export const commissionConfigs = [
  { config_id: 'cc-vote', type: 'VOTE', rate: 10, active: true },
  { config_id: 'cc-contest', type: 'CONTEST', rate: 10, active: true },
  { config_id: 'cc-ticket', type: 'TICKET', rate: 7, active: true },
  { config_id: 'cc-donation', type: 'DONATION', rate: 7, active: true },
  { config_id: 'cc-cf', type: 'CF', rate: 7, active: true },
  { config_id: 'cc-lottery', type: 'LOTTERY', rate: 7, active: true },
  { config_id: 'cc-sponsorship', type: 'SPONSORSHIP', rate: 7, active: true },
];

// The campaign types shown in the calculator. Each one points back to a
// rate above, so we never have to write the same number twice.
export const campaignTypes = [
  { key: 'VOTE', label: 'Votes & scrutins', icon: 'fa-check-to-slot' },
  { key: 'TICKET', label: 'Billetterie', icon: 'fa-ticket' },
  { key: 'DONATION', label: 'Dons & cagnottes', icon: 'fa-hand-holding-heart' },
  { key: 'CF', label: 'Crowdfunding', icon: 'fa-people-group' },
  { key: 'CONTEST', label: 'Concours', icon: 'fa-trophy' },
  { key: 'LOTTERY', label: 'Loteries', icon: 'fa-dice' },
  { key: 'SPONSORSHIP', label: 'Sponsoring', icon: 'fa-handshake' },
];

// Looks up the rate for a given type. Returns null if there's no active
// rate for it, so the page can show "not available" instead of a wrong number.
export function getCommissionRate(type) {
  const row = commissionConfigs.find((c) => c.type === type && c.active);
  return row ? row.rate : null;
}
