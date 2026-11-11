/** Positive, mode-scoped gameplay edges. Missing edges and seasons mean unknown. */
export interface WorldRelation {
 subjectId:string;
 kind:'drops'|'mythicDrop'|'spawnsAt'|'near'|'gasStationIn'|'upgradeBenchIn'|'offersService'|'keycard'|'faction'|'foodBusinessAt'|'carries'|'mythicCarry'|'vaultIn'|'sells'|'featuresMechanic'|'supportsInteraction'|'providesFunction'|'eventAt'|'eventTransforms'|'contains'|'businessAt'|'providesLoot';
 objectId:string;
 season?:string;
 chapter?:number;
 mode:'core_br'|'special_br'|'br_ltm';
 /** Conditional effects and unknown dates remain explicit rather than generalized. */
 conditions?:string;
 sourceIds:string[];
 status:'verified';
}
export const worldRelations:WorldRelation[]=[];
