import Household from '../models/Household.js';

export async function isMemberOfHousehold(userId, householdId) {
  const h = await Household.findById(householdId).lean(); // [REQ:NoSQLi:parameterized]
  if (!h) return false;
  return h.owner?.toString() === userId || (h.members || []).some((m) => String(m) === userId);
}
