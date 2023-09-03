import { Collection, CreatedAnimation, CreatedMap, User, World } from "@prisma/client";

export interface MarkGroup {
  tribes: string[];
  name: string;
  color: string;
}
export interface Settings {
  backgroundColor: string;
  borderColor: string;
  captions: Caption[];
  markGroups: MarkGroup[];
  outputWidth: number;
  scale: number;
  trim: boolean;
  topSpotSize: number;
  turn: number;
  world: number;
}
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
}
export interface Caption {
  text: string;
  color: string;
  fontSize: number;
  x: number;
  y: number;
}
export interface Tribe {
  id: string;
  name: string;
  tag: string;
  points: number;
  players: number;
  killAll: number;
  killAtt: number;
  killDef: number;
  villages: Village[];
}
export interface Village {
  tribeId: string;
  x: number;
  y: number;
  points: number;
}
export interface ParsedTurnData {
  conquer: Object;
  tribes: { [key: string]: Tribe };
  width: number;
  averageVillagePoints: number;
  medianVillagePoints: number;
  topVillagePoints: number;
}
export type CreatedMapWithRelations = CreatedMap & {
  collection: Collection;
};
export type WorldWithWorldData = World & { worldData: { id: number; turn: number }[] };
export type UserWithRelations = User & {
  collections: Collection[];
};
export type CollectionWithRelations = Collection & {
  animations: CreatedAnimation[];
  author: User;
  maps: CreatedMap[];
  world: World;
};
export type CreatedAnimationWithRelations = CreatedAnimation & {
  collection: Collection;
};
export interface WorldDataState {
  id: number;
  serverName: string;
  turns: TurnDataState[];
}
export interface TurnDataState {
  hasDataFiles: boolean;
  isParsed: boolean;
}
export interface UserSessionData {
  id: number;
  login: string;
  rank: number;
}
export interface CreateMapRequestPayload {
  collection: number;
  description: string;
  settings: Settings;
  title: string;
}
export interface CreateWorldRequestPayload {
  domain: string;
  num: string;
  server: string;
  timestamp: number;
}
