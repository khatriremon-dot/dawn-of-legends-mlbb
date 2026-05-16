// ========================================
// Mobile Legends: Bang Bang - Type Definitions
// Dawn of Legends Blog - Data Types
// ========================================

export type HeroRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';
export type Specialty = 'Damage' | 'Crowd Control' | 'Initiator' | 'Magic Damage' | 'Physical Damage' | 'Support' | 'Jungle' | 'Roam' | 'Burst' | 'Sustain' | 'Poke' | 'Charge' | 'Reap' | 'Reggie';
export type Lane = 'EXP' | 'Mid' | 'Gold' | 'Roam' | 'Jungle' | 'Any';
export type Rarity = 'Normal' | 'Elite' | 'Special' | 'Epic' | 'Legend' | 'Collector' | 'Limited';
export type TierRank = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface HeroAbility {
  name: string;
  description: string;
  type: 'Passive' | 'Skill 1' | 'Skill 2' | 'Ultimate';
  cooldown?: string;
  manaCost?: string;
}

export interface Hero {
  id: string;
  name: string;
  role: HeroRole;
  specialty: Specialty[];
  lane: Lane[];
  difficulty: Difficulty;
  tier: TierRank;
  releaseYear: number;
  faction: string;
  title: string;
  description: string;
  lore: string;
  abilities: HeroAbility[];
  stats: {
    hp: number;
    mana: number;
    physicalAttack: number;
    magicalAttack: number;
    physicalDefense: number;
    magicalDefense: number;
    attackSpeed: number;
    movementSpeed: number;
    hpRegen: number;
    manaRegen: number;
  };
  counters: string[]; // hero ids that counter this hero
  weakTo: string[]; // hero ids this hero is weak to
  synergies: string[]; // hero ids that synergize well
  tags: string[];
  popularity: number; // 1-100
  winRate: number; // percentage
  pickRate: number; // percentage
  banRate: number; // percentage
  imageColor: string; // gradient color for card
  emoji: string; // visual representation
}

export interface Item {
  id: string;
  name: string;
  type: 'Attack' | 'Magic' | 'Defense' | 'Jungle' | 'Roam' | 'Movement' | 'Boots';
  cost: number;
  description: string;
  stats: Record<string, number>;
  tier: number; // 1-3
  buildFrom?: string[];
  tags: string[];
}

export interface Emblem {
  id: string;
  name: string;
  type: 'Common' | 'Assassin' | 'Mage' | 'Tank' | 'Marksman' | 'Fighter' | 'Support';
  effects: Record<string, string>;
  talents: string[];
}

export interface BattleSpell {
  id: string;
  name: string;
  description: string;
  cooldown: string;
  bestFor: string[];
}

export interface Skin {
  id: string;
  name: string;
  heroId: string;
  heroName: string;
  rarity: Rarity;
  price: number;
  releaseDate: string;
  theme: string;
  description: string;
  effects?: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  leader: string;
  heroes: string[];
  color: string;
  icon: string;
  territory: string;
  motto: string;
  history: string;
}

export interface MapRegion {
  id: string;
  name: string;
  description: string;
  faction: string;
  pointsOfInterest: string[];
  connections: string[];
  color: string;
  imageColor: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readTime: string;
  hero?: string;
  featured: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: QuizDifficulty;
  category: string;
  heroId?: string;
}

export interface EsportsTournament {
  id: string;
  name: string;
  year: number;
  winner: string;
  runnerUp: string;
  mvp: string;
  location: string;
  prizePool: string;
  teams: string[];
}

export interface MetaHeroData {
  heroId: string;
  heroName: string;
  role: HeroRole;
  winRate: number;
  pickRate: number;
  banRate: number;
  trend: 'up' | 'down' | 'stable';
  tier: TierRank;
  bestLane: Lane;
  bestEmblem: string;
  bestBuild: string[];
}

export interface HeroMatchup {
  hero1Id: string;
  hero2Id: string;
  advantage: number; // percentage advantage for hero1
  tips: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Nightmare';
}

export interface PatchNote {
  id: string;
  version: string;
  date: string;
  title: string;
  heroChanges: {
    heroId: string;
    heroName: string;
    type: 'Buff' | 'Nerf' | 'Adjustment' | 'Rework';
    changes: string[];
  }[];
  itemChanges: {
    itemId: string;
    itemName: string;
    type: 'Buff' | 'Nerf' | 'Adjustment' | 'New' | 'Removed';
    changes: string[];
  }[];
  systemChanges: string[];
  newHeroes?: string[];
  newSkins?: string[];
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  players: number;
  duration: string;
  difficulty: Difficulty;
  tips: string[];
}

export interface LoreTimelineEvent {
  year: number;
  event: string;
  description: string;
  involvedHeroes: string[];
  faction?: string;
}

export interface HeroRelationship {
  hero1Id: string;
  hero1Name: string;
  hero2Id: string;
  hero2Name: string;
  type: 'Ally' | 'Rival' | 'Lover' | 'Family' | 'Mentor' | 'Enemy' | 'Neutral';
  description: string;
}
