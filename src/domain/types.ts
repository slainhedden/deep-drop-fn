export type EntityType = 'skin' | 'weapon' | 'location' | 'collaboration' | 'item' | 'vehicle' | 'event';
export type Category = 'Skins' | 'Weapons' | 'Locations' | 'Crossovers' | 'Items' | 'Vehicles' | 'Events';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type Operator = 'eq' | 'includes' | 'contains';

export interface SourceRecord {
  id: string;
  label: string;
  url: string;
  verifiedOn: string;
}

export interface FortniteEntity {
  id: string;
  type: EntityType;
  name: string;
  aliases: EntityAlias[];
  familiarity: number;
  facts: Record<string, string | number | boolean | string[] | number[] | undefined>;
  sourceIds: string[];
  dataVersion: string;
}

export interface EntityAlias {
  text: string;
  kind: 'official' | 'abbreviation' | 'slang' | 'former_name';
  confidence: 'exact' | 'strong' | 'contextual';
}

export interface Predicate {
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
  baseDifficulty: Difficulty;
  parameters: TemplateParameter[];
  prompt: (parameters: Record<string, string | number>) => string;
  predicates: (parameters: Record<string, string | number>) => Predicate[];
  explanation: (answer: FortniteEntity, parameters: Record<string, string | number>) => string;
  advanced?: boolean;
  minAnswers?: number;
}

export interface GeneratedQuestion {
  id: string;
  templateId: string;
  category: Category;
  answerType: EntityType;
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
