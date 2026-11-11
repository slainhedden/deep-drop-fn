/** Positive, mode-scoped gameplay edges. Missing edges and seasons mean unknown. */
export interface WorldRelation {
 subjectId:string;
 kind:'drops'|'mythicDrop'|'spawnsAt'|'near'|'gasStationIn'|'upgradeBenchIn'|'offersService'|'keycard'|'faction'|'foodBusinessAt'|'carries'|'mythicCarry'|'vaultIn'|'sells';
 objectId:string;
 season?:string;
 chapter?:number;
 mode:'core_br'|'special_br';
 sourceIds:string[];
 status:'verified';
}
export const worldRelations:WorldRelation[]=[];
