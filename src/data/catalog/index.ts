import { locations, landmarks } from './locations';
import { weapons, namedMythics } from './weapons';
import { skins } from './skins';
import { items, vehicleCandidates, bossCandidates, eventCandidates } from './other';
// One canonical identity per entity type. Cross-type identities (a boss and outfit)
// are intentional: their answer categories and histories are independent.
export const historicalCatalog = [...locations,...landmarks,...weapons,...namedMythics,...skins,...items,...vehicleCandidates,...bossCandidates,...eventCandidates];
