export type EntityType = 'skin' | 'weapon' | 'location' | 'collaboration' | 'item' | 'vehicle' | 'event' | 'boss' | 'npc' | 'container' | 'ammo' | 'material' | 'faction';
export type Category = 'Skins' | 'Weapons' | 'Locations' | 'Crossovers' | 'Items' | 'Vehicles' | 'Events' | 'Bosses' | 'NPCs' | 'Containers' | 'Ammunition' | 'Materials';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Operator = 'eq' | 'includes' | 'contains' | 'introducedOnOrAfter' | 'introducedOnOrBefore' | 'availableIn' | 'appearedInChapter' | 'historyChange' | 'hasRelationship' | 'historyFlag' | 'chapterCountAtLeast' | 'introducedInChapter' | 'changeInSeason' | 'relatedTo';

export interface SourceRecord {
  id: string;
  label: string;
  url: string;
  verifiedOn?: string;
  status?: 'verified' | 'pending';
  notes?: string;
}

export interface FortniteEntity {
  id: string;
  type: EntityType;
  name: string;
  aliases: EntityAlias[];
  familiarity: number;
  facts: Record<string, string | number | boolean | string[] | number[] | undefined>;
  sourceIds: string[];
  factEvidence?: Record<string, HistoricalEvidence>;
  dataVersion: string;
  history?: EntityHistory;
  origin?: 'legacy' | 'expansion';
  verification?: 'legacy' | 'pending' | 'verified';
}

export type SeasonId = string;
export type HistoryChangeKind = 'removed' | 'vaulted' | 'reintroduced' | 'unvaulted' | 'replaced' | 'renamed' | 'destroyed' | 'transformed';
export interface HistoricalEvidence {
  sourceIds: string[];
  status: 'verified' | 'pending';
  note?: string;
}
export interface AppearancePeriod extends HistoricalEvidence {
  from: SeasonId;
  through: SeasonId;
  // Season-level presence does not assert uninterrupted availability within a season.
  namedPoi?: boolean;
}
export interface HistoricalChange extends HistoricalEvidence {
  kind: HistoryChangeKind;
  season: SeasonId;
  eventId?: string;
  relatedEntityId?: string;
}
export interface HistoricalRelationship extends HistoricalEvidence {
  kind: 'boss' | 'mythic' | 'location' | 'participant' | 'successor' | 'droppedBy' | 'foundIn' | 'obtainableAt' | 'faction';
  entityId: string;
  variant?: 'mythic' | 'exotic';
  season: SeasonId;
}
export interface AvailabilityObservation extends HistoricalEvidence {
 season:SeasonId; update:string; state:'present'|'absent'; mode:'core_br';
}
export interface EntityHistory {
  observations?:AvailabilityObservation[];
  introduction?: HistoricalEvidence & { season: SeasonId; timing?: 'launch' | 'midseason' };
  appearances: AppearancePeriod[];
  changes: HistoricalChange[];
  relationships: HistoricalRelationship[];
  // Flags apply only to a documented scope; missing values mean unknown.
  flags?: Record<string, HistoricalEvidence & { value: string | number | boolean }>;
  coverageNote?: string;
}

export interface EntityAlias {
  text: string;
  kind: 'official' | 'abbreviation' | 'slang' | 'former_name';
  confidence: 'exact' | 'strong' | 'contextual';
}

export interface Predicate {
  season?: SeasonId;
  field: string;
  operator: Operator;
  value: string | number | boolean;
}

export interface TemplateParameter {
  key: string;
  values: Array<string | number>;
}

export interface QuestionTemplate {
  id: string;
  category: Category;
  answerType: EntityType;
  answerTypes?: EntityType[];
  baseDifficulty: Difficulty;
  parameters: TemplateParameter[];
  prompt: (parameters: Record<string, string | number>) => string;
  predicates: (parameters: Record<string, string | number>) => Predicate[];
  explanation: (answer: FortniteEntity, parameters: Record<string, string | number>) => string;
  advanced?: boolean;
  minAnswers?: number;
  family?: string;
  status?: 'enabled' | 'pending';
  scopeNote?: string;
  coverage?: {sourceIds:string[]; reviewedOn:string; note:string; parameters?:Record<string,string|number>[]};
  diversityGroup?:string;
}

export interface GeneratedQuestion {
  id: string;
  templateId: string;
  category: Category;
  answerType: EntityType;
  answerTypes?: EntityType[];
  prompt: string;
  parameters: Record<string, string | number>;
  predicates: Predicate[];
  validAnswerIds: string[];
  difficulty: Difficulty;
  advanced: boolean;
  dataVersion: string;
}

export type RarityTier = 'Very Common' | 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface AnswerResult {
  submitted: string;
  canonicalAnswer?: string;
  answerId?: string;
  correct: boolean;
  timedOut: boolean;
  points: number;
  tier?: RarityTier;
  explanation: string;
  frequencySource?: 'estimated' | 'observed';
  estimatedFrequency?: number;
  matchedVia?: 'canonical' | 'alias' | 'autocorrect';
  correctedFrom?: string;
}

export interface RoundResult {
  question: GeneratedQuestion;
  result: AnswerResult;
}
