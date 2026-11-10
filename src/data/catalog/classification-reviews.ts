import type { FortniteEntity } from '../../domain/types';
import { proof } from './history-editor';

/** Classification reviews do not promote pending introduction/availability claims. */
export function applyClassificationReviews(bank:FortniteEntity[]):FortniteEntity[] {
 const scoped=bank.find(entity=>entity.id==='weapon-scoped-assault-rifle')!;
 scoped.facts.weaponClass='assault rifle';
 scoped.factEvidence??={};
 scoped.factEvidence.weaponClass=proof('epic-patch-v4-4','Battle Royale Weapons + Items explicitly renames Assault Rifle with Scope to Scoped Assault Rifle. This verifies classification, not its first-release season.');
 scoped.aliases.push({text:'Assault Rifle with Scope',kind:'former_name',confidence:'exact'});
 return bank;
}
