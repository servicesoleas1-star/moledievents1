/**
 * Commission barème — mirrors UML DC-08 `CommissionConfig` (global rates by
 * `CommissionType`) with the lookup order documented on the diagram:
 *   1. UserCommissionConfig (user_id + campaign_type)
 *   2. UserCommissionConfig (user_id, campaign_type IS NULL)
 *   3. CommissionConfig (global, this file)
 * The public pricing page only has anonymous visitors, so it always reads
 * step 3 — the global table. When an organizer is logged in and has a
 * `UserCommissionConfig` row, that value overrides this one (not wired here,
 * since this page is public/pre-auth).
 */

// CommissionType = VOTE | TICKET | DONATION | CF | CONTEST | LOTTERY | ESCROW_FEE | ADSENSE_SHARE
export const commissionConfigs = [
  { config_id: 'cc-vote', type: 'VOTE', rate: 10, active: true },
  { config_id: 'cc-contest', type: 'CONTEST', rate: 10, active: true },
  { config_id: 'cc-ticket', type: 'TICKET', rate: 7, active: true },
  { config_id: 'cc-donation', type: 'DONATION', rate: 7, active: true },
  { config_id: 'cc-cf', type: 'CF', rate: 7, active: true },
  { config_id: 'cc-lottery', type: 'LOTTERY', rate: 7, active: true },
  { config_id: 'cc-sponsorship', type: 'SPONSORSHIP', rate: 7, active: true },
];

// Campaign families shown in the calculator, each pointing at its
// CommissionType so the rate always comes from the table above — never
// hardcoded twice.
export const campaignTypes = [
  { key: 'VOTE', label: 'Votes & scrutins' },
  { key: 'TICKET', label: 'Billetterie' },
  { key: 'DONATION', label: 'Dons & cagnottes' },
  { key: 'CF', label: 'Crowdfunding' },
  { key: 'CONTEST', label: 'Concours' },
  { key: 'LOTTERY', label: 'Loteries' },
  { key: 'SPONSORSHIP', label: 'Sponsoring' },
];

// If the table has no active row for a type, the page must show an empty
// state rather than invent a number — this is the only lookup helper.
export function getCommissionRate(type) {
  const row = commissionConfigs.find((c) => c.type === type && c.active);
  return row ? row.rate : null;
}
