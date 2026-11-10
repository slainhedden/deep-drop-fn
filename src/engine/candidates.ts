import type { FortniteEntity,GeneratedQuestion } from '../domain/types';
import { entitiesById } from '../data/entities';

export function uniqueEntities(candidates:readonly FortniteEntity[]):FortniteEntity[] {
 const unique=new Map<string,FortniteEntity>();
 for(const entity of candidates)if(!unique.has(entity.id))unique.set(entity.id,entity);
 return [...unique.values()];
}
/** Use the frozen question snapshot for both suggestions and validation. */
export function answerCandidates(question:Pick<GeneratedQuestion,'validAnswerIds'>):FortniteEntity[] {
 return uniqueEntities(question.validAnswerIds.map(id=>entitiesById.get(id)).filter((entity):entity is FortniteEntity=>!!entity));
}
