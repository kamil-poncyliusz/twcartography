import { Collection, CreatedMap, User, World } from "@prisma/client";

export interface MarkGroup {
  tribes: string[];
  name: string;
  color: string;
}
export interface Settings {
  backgroundColor: string;
  borderColor: string;
  displayUnmarked: boolean;
  markGroups: MarkGroup[];
  outputWidth: number;
  scale: number;
  spotsFilter: number;
  trim: boolean;
  turn: number;
  unmarkedColor: string;
  world: number;
}
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
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
  tribeID: string;
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
export interface TurnDataState {
  id: number;
  hasFiles: boolean;
}
export type UserWithRelations = User & {
  collections: Collection[];
};
export type CollectionWithRelations = Collection & {
  author: User;
  maps: CreatedMap[];
  world: World;
};
export interface WorldDataState {
  id: number;
  serverName: string;
  turns: TurnDataState[];
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
