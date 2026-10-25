export type RelationshipType = 'spouse' | 'sibling' | 'parent-child' | 'future-spouse';

export type RelationshipSymbol = '<=>' | '<->' | '->' | '<...>';

export interface PersonNode {
  id: string;
  name: string;
  relationToMe: string;
  labelOverride?: string;
  photoUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  gender?: 'male' | 'female' | 'other';
  isPlaceholder?: boolean;
  notes?: string;
  generation: number; // 1: Grandparents, 2: Parents, 3: Me/Siblings, 4: Niece
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  fromId: string;
  toId: string;
  symbol: RelationshipSymbol;
  label?: string;
  dashed?: boolean;
}

export interface FamilyTreeData {
  title: string;
  creator: string;
  subtitle: string;
  version: number;
  lastUpdated: string;
  members: PersonNode[];
  relationships: Relationship[];
}

export interface AuthSession {
  isAuthenticated: boolean;
  userEmail?: string;
  token?: string;
  role?: 'owner' | 'visitor';
}
